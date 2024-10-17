import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import db from '../../lib/db'; // Assuming db connection setup
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    // Destructure required fields from the request body
    const { fname, lname, email, username, password, phone_no, session_token, store_id } = await req.json();

    // Check if all required fields are present
    if (!fname || !lname || !email || !username || !password || !phone_no || !session_token || !store_id) {
      return NextResponse.json({ error: 'All fields are required, including store_id.' }, { status: 400 });
    }

    // Generate the product activation key and hash it
    const product_activation_key = `pkey${Math.random().toString(36).substring(2, 15)}`;
    const product_activation_hash_key = await bcrypt.hash(product_activation_key, 10);

    // Hash the password with bcrypt
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user data into the database without exposing sensitive info
    const [result] = await db.query(
      `INSERT INTO users (fname, lname, email, username, password_hash, phone_no, session_token, product_activation_hash_key, store_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fname, lname, email, username, password_hash, phone_no, session_token, product_activation_hash_key, store_id]
    );

    if (result && result.affectedRows === 1) {
      // Create JWT token for the email and product activation
      const token = jwt.sign({ email, product_activation_key }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

      // Create a product activation URL with the JWT token in the query string
      const activationUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/get-pos/product-activation?token=${encodeURIComponent(token)}`;

      // Send the activation key via email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'รหัสเปิดใช้งานผลิตภัณฑ์ สำหรับ EZyPOS',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">ขอบคุณสำหรับการสั่งซื้อระบบ EZyPOS</h2>
                <p>สวัสดีคุณ <strong>${fname} ${lname}</strong>,</p>
                <p>นี่คือรหัสเปิดใช้งานผลิตภัณฑ์ของคุณ</p>
                <div style="padding: 10px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 4px; margin-top: 15px; margin-bottom: 20px;">
                    <strong style="font-size: 20px; color: #000;">${product_activation_key}</strong>
                </div>
                <p>ใช้รหัสนี้เพื่อเปิดใช้งานผลิตภัณฑ์ของคุณบนเว็บไซต์ EZyPOS.</p>
                <p>คุณสามารถเปิดใช้งานผลิตภัณฑ์ได้โดยการคลิกที่ลิงก์นี้</p>
                <a href="${activationUrl}" style="color: #4CAF50;">เปิดใช้งานผลิตภัณฑ์</a>
                <p style="margin-top: 20px;">ขอบคุณที่ใช้บริการเรา!</p>
                <footer style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #888;">ผู้ดูแลระบบ EZyPOS</p>
                </footer>
            </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      return NextResponse.json({ success: true });
    } else {
      throw new Error('Failed to insert user data.');
    }
  } catch (error) {
    console.error('Error inserting user data:', error);
    return NextResponse.json({ error: error.message || 'Failed to insert user data' }, { status: 500 });
  }
}
