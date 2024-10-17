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

    // ตรวจสอบค่า session token จาก headers
    const authHeader = request.headers.get('authorization');
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : '';

    if (!sessionToken) {
      return NextResponse.json({ message: 'Session Token not found' }, { status: 401 });
    }

    // ตรวจสอบ session token
    const [sessionResults] = await db.query('SELECT * FROM sessions WHERE session_token = ?', [sessionToken]);
    const session = sessionResults[0];

    if (!session) {
      return NextResponse.json({ message: 'Session Token ไม่ถูกต้องหรือหมดอายุ' }, { status: 401 });
    }

    const userId = session.user_id;

    // ดึง store_id ของผู้ใช้ที่ล็อกอิน
    const [userResults] = await db.query('SELECT store_id FROM users WHERE id = ?', [userId]);
    const user = userResults[0];

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const storeId = user.store_id;

    // ตรวจสอบว่ามี storeName ถูกส่งมาหรือไม่
    if (!storeName) {
      return NextResponse.json({ message: 'Store name is required' }, { status: 400 });
    }

    // อัปเดต store_name ในฐานข้อมูล
    await db.query('UPDATE stores SET store_name = ? WHERE id = ?', [storeName, storeId]);

    // อัปเดตที่อยู่ร้านค้า (ในรูปแบบ JSON)
    if (storeAddress) {
      await db.query('UPDATE stores SET store_address = ? WHERE id = ?', [storeAddress, storeId]);
    }

    // อัปเดตเบอร์โทรศัพท์ร้านค้า
    if (storePhoneNo) {
      await db.query('UPDATE stores SET store_phone_no = ? WHERE id = ?', [storePhoneNo, storeId]);
    }

    // หากมีไฟล์รูปภาพ ให้ทำการอัปเดต
    let imageUrl = null;
    if (imageFile) {
      // สร้างชื่อไฟล์ใหม่แบบสุ่มเพื่อป้องกันชื่อซ้ำ
      const newFileName = `${uuidv4()}${path.extname(imageFile.name)}`;
      const uploadPath = path.join('public', 'uploads', newFileName);

      // บันทึกไฟล์ลงโฟลเดอร์ uploads
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      fs.writeFileSync(uploadPath, fileBuffer);

      // อัปเดต URL ของรูปภาพใหม่ลงในฐานข้อมูล
      imageUrl = `/uploads/${newFileName}`;
      await db.query('UPDATE stores SET store_img = ? WHERE id = ?', [imageUrl, storeId]);
    }

    // ส่ง response กลับ
    return NextResponse.json({
      message: 'Store updated successfully',
      store_name: storeName,
      store_img: imageUrl || null,
      store_address: storeAddress ? JSON.parse(storeAddress) : null, // ส่งข้อมูลที่อยู่กลับไป
      store_phone_no: storePhoneNo || null, // ส่งข้อมูลเบอร์โทรกลับไป
    });

  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
