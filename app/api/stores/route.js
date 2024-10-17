import db from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // รับค่า session token จาก headers
    const authHeader = request.headers.get('authorization');
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : '';

    // ตรวจสอบว่ามี session token หรือไม่
    if (!sessionToken) {
      return NextResponse.json({ message: 'Session Token not found' }, { status: 401 });
    }

    // ตรวจสอบความถูกต้องของ session token ในตาราง sessions
    const [sessionResults] = await db.query('SELECT * FROM sessions WHERE session_token = ?', [sessionToken]);
    const session = sessionResults[0];
    if (!session) {
      return NextResponse.json({ message: 'Session Token ไม่ถูกต้องหรือหมดอายุ' }, { status: 401 });
    }

    // ดึง user_id จาก session token ที่พบ
    const userId = session.user_id;
    
    // ดึงข้อมูล store_id จากตาราง users
    const [userResults] = await db.query('SELECT store_id FROM users WHERE id = ?', [userId]);
    const user = userResults[0];
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // ดึงข้อมูลร้านค้า รวมถึงที่อยู่ (store_address)
    const storeId = user.store_id;
    const [storeResults] = await db.query('SELECT store_name, store_img, store_address,store_phone_no FROM stores WHERE id = ?', [storeId]);
    const store = storeResults[0];
    if (!store) {
      return NextResponse.json({ message: 'Store not found' }, { status: 404 });
    }

    // ส่งข้อมูล storeId, store_name, store_img และ store_address กลับไป
    return NextResponse.json({
      storeId,
      store_name: store.store_name,
      store_img: store.store_img,
      store_address: store.store_address,  // เพิ่มข้อมูลที่อยู่
      store_phone_no: store.store_phone_no
    });
    
  } catch (error) {
    // จัดการ error ในกรณีที่เกิดข้อผิดพลาดบนเซิร์ฟเวอร์
    console.error('Error fetching store details:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
