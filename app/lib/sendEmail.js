import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendActivationEmail(to, activationKey) {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject: 'รหัสเปิดใช้งานผลิตภัณฑ์ของคุณ สำหรับ EZyPOS',
    text: `ขอขอบคุณสำหรับการซื้อของคุณ! นี่คือรหัสเปิดใช้งานผลิตภัณฑ์ของคุณ: ${activationKey}`,
    html: `<p>ขอขอบคุณสำหรับการซื้อของคุณ!</p><p>นี่คือรหัสเปิดใช้งานผลิตภัณฑ์ของคุณ: <strong>${activationKey}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
