import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import db from '../../lib/db'; // Assuming db connection setup

export async function POST(req) {
  try {
    const { token, product_activation_key } = await req.json();

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const email = decoded.email;

    // Fetch the hashed activation key from the database
    const [rows] = await db.query('SELECT product_activation_hash_key FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { product_activation_hash_key } = rows[0];

    // Compare the provided key with the hashed key
    const isKeyValid = await bcrypt.compare(product_activation_key, product_activation_hash_key);

    if (!isKeyValid) {
      return NextResponse.json({ error: 'รหัสเปิดใช้งานไม่ถูกต้อง' }, { status: 400 });
    }

    // Update the product activation status
    await db.query('UPDATE users SET product_activation_key_activated = 1 WHERE email = ?', [email]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ข้อผิดพลาดในการตรวจสอบโทเค็นและรหัสเปิดใช้งาน:', error);
    return NextResponse.json({ error: 'ไม่สามารถตรวจสอบรหัสเปิดใช้งานได้' }, { status: 500 });
  }
}
