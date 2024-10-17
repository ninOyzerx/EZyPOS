import { compare } from 'bcryptjs';
import db from '../../lib/db';
import { serialize } from 'cookie';

export async function POST(req) {
  const { username, password } = await req.json();

  try {
    // Fetch user details from the database
    const [userResults] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username] // Query both username and email
    );
    const user = userResults[0];

    if (user && (await compare(password, user.password_hash))) {
      
      // Check if the product activation key has been activated
      if (!user.product_activation_key_activated) {
        return new Response(
          JSON.stringify({ error: 'โปรดเปิดใช้งานผลิตภัณฑ์ก่อนเข้าสู่ระบบ' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      let sessionToken = user.session_token;

      // Check if a session token exists
      if (!sessionToken) {
        // Generate a new session token
        sessionToken = Math.random().toString(36).substring(2);

        // Update the users table with the new session token
        await db.query(
          'UPDATE users SET session_token = ? WHERE id = ?',
          [sessionToken, user.id]
        );

        // Add the new session token to the sessions table
        await db.query(
          'INSERT INTO sessions (user_id, session_token) VALUES (?, ?)',
          [user.id, sessionToken]
        );
      } else {
        // Verify the session token exists in the sessions table
        const [sessionResults] = await db.query(
          'SELECT * FROM sessions WHERE user_id = ? AND session_token = ?',
          [user.id, sessionToken]
        );

        if (sessionResults.length === 0) {
          // If the session token does not exist, insert it
          await db.query(
            'INSERT INTO sessions (user_id, session_token) VALUES (?, ?)',
            [user.id, sessionToken]
          );
        }
      }

      // Fetch the store ID associated with the user
      const storeId = user.store_id;

      // Set a secure cookie with the session token
      const cookie = serialize('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      return new Response(
        JSON.stringify({ message: 'เข้าสู่ระบบสำเร็จ', sessionToken, storeId }),
        {
          status: 200,
          headers: {
            'Set-Cookie': cookie,
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'ไม่สามารถติดต่อฐานข้อมูลได้' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
