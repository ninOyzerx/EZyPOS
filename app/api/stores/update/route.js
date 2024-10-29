import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import db from '../../../lib/db'; // เชื่อมต่อฐานข้อมูล
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const storeName = formData.get('store_name');
    const storeAddress = formData.get('store_address'); // รับข้อมูลที่อยู่
    const storePhoneNo = formData.get('store_phone_no'); // รับข้อมูลเบอร์โทร
    const imageFile = formData.get('store_img'); // รับรูปภาพ
    const removeImage = formData.get('remove_image'); // รับค่าเพื่อระบุว่าจะลบรูปภาพหรือไม่

    const authHeader = request.headers.get('authorization');
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : '';

    if (!sessionToken) {
      return NextResponse.json({ message: 'Session Token not found' }, { status: 401 });
    }

    const [sessionResults] = await db.query('SELECT * FROM sessions WHERE session_token = ?', [sessionToken]);
    const session = sessionResults[0];

    if (!session) {
      return NextResponse.json({ message: 'Session Token ไม่ถูกต้องหรือหมดอายุ' }, { status: 401 });
    }

    const userId = session.user_id;
    const [userResults] = await db.query('SELECT store_id FROM users WHERE id = ?', [userId]);
    const user = userResults[0];

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const storeId = user.store_id;

    // อัปเดต store_name ในฐานข้อมูล
    if (storeName) {
      await db.query('UPDATE stores SET store_name = ? WHERE id = ?', [storeName, storeId]);
    }

    // อัปเดตที่อยู่ร้านค้า (ในรูปแบบ JSON)
    if (storeAddress) {
      await db.query('UPDATE stores SET store_address = ? WHERE id = ?', [storeAddress, storeId]);
    }

    // อัปเดตเบอร์โทรศัพท์ร้านค้า
    if (storePhoneNo) {
      await db.query('UPDATE stores SET store_phone_no = ? WHERE id = ?', [storePhoneNo, storeId]);
    }

    // ลบรูปภาพหากต้องการ
    if (removeImage === 'true') {
      const [storeResults] = await db.query('SELECT store_img FROM stores WHERE id = ?', [storeId]);
      const store = storeResults[0];

      if (store.store_img) {
        const filePath = path.join('public', store.store_img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // ลบไฟล์รูปภาพออกจากระบบ
        }
        await db.query('UPDATE stores SET store_img = NULL WHERE id = ?', [storeId]); // อัปเดตฐานข้อมูล
      }
    }

    let imageUrl = null;
    // หากมีไฟล์รูปภาพใหม่ ให้ทำการอัปเดต
    if (imageFile) {
      // สร้างโฟลเดอร์สำหรับ store_id ถ้ายังไม่มี
      const storeDir = path.join('public', 'uploads', 'store', storeId.toString());
      if (!fs.existsSync(storeDir)) {
        fs.mkdirSync(storeDir, { recursive: true }); // สร้างโฟลเดอร์ถ้าไม่มี
      }

      const newFileName = `${uuidv4()}${path.extname(imageFile.name)}`;
      const uploadPath = path.join(storeDir, newFileName);

      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      fs.writeFileSync(uploadPath, fileBuffer);

      // อัปเดต URL สำหรับรูปภาพที่อัปโหลด
      imageUrl = `/uploads/store/${storeId}/${newFileName}`;
      await db.query('UPDATE stores SET store_img = ? WHERE id = ?', [imageUrl, storeId]);
    }

    return NextResponse.json({
      message: 'Store updated successfully',
      store_name: storeName,
      store_img: imageUrl, // Only include the image URL if an image is uploaded
      store_address: storeAddress ? JSON.parse(storeAddress) : null,
      store_phone_no: storePhoneNo || null,
    });
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
