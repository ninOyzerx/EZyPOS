import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(req) {
    const { email, product_activation_key } = await req.json();
  
    
    if (!email || !product_activation_key) {
        return NextResponse.json({ success: false, error: 'Email or activation key is missing' }, { status: 400 });
    }
    
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'รหัสเปิดใช้งานผลิตภัณฑ์ สำหรับ EZyPOS',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">ขอบคุณสำหรับการสั่งซื้อระบบ EZyPOS</h2>
                <p>สวัสดีคุณ <strong>${email}</strong>,</p>
                <p>นี่คือรหัสเปิดใช้งานผลิตภัณฑ์ของคุณ</p>
                <div style="padding: 10px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 4px; margin-top: 15px; margin-bottom: 20px;">
                    <strong style="font-size: 20px; color: #000;">${product_activation_key}</strong>
                </div>
                <p>ใช้รหัสนี้เพื่อเปิดใช้งานผลิตภัณฑ์ของคุณบนเว็บไซต์ EZyPOS.</p>
                <p style="margin-top: 20px;">ขอบคุณที่ใช้บริการเรา!</p>
                <footer style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #888;">ผู้ดูแลระบบ EZyPOS</p>                </footer>
            </div>
        `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      return NextResponse.json({ success: false, error: 'Failed to send activation email' }, { status: 500 });
    }
}
