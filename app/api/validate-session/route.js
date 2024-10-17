import db from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : '';

    if (!sessionToken) {
      return NextResponse.json({ message: 'ไม่พบ Session Token' }, { status: 401 });
    }

    // Validate session token
    const [sessionResults] = await db.query('SELECT * FROM sessions WHERE session_token = ?', [sessionToken]);
    const session = sessionResults[0];
    if (!session) {
      return NextResponse.json({ message: 'Session ไม่ถูกต้องหรือหมดอายุ' }, { status: 401 });
    }

    const userId = session.user_id;

    const [userResults] = await db.query('SELECT store_id FROM users WHERE id = ?', [userId]);
    const user = userResults[0];
    if (!user) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    const storeId = user.store_id;

    // Validate that the store_id exists in the stores table
    const [storeResults] = await db.query('SELECT * FROM stores WHERE id = ?', [storeId]);
    const store = storeResults[0];
    if (!store) {
      return NextResponse.json({ message: 'ไม่พบร้านค้า' }, { status: 404 });
    }

    return NextResponse.json({ storeId });
  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json({ message: 'ข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์' }, { status: 500 });
  }
}
