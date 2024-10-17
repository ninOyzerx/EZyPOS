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

        // Check if user exists and password matches
        if (user && (await compare(password, user.password_hash))) {
            // Check if the product activation key has been activated
            if (!user.product_activation_key_activated) {
                return new Response(
                    JSON.stringify({ error: 'โปรดเปิดใช้งานผลิตภัณฑ์ก่อนเข้าสู่ระบบ' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Generate or fetch session token
            let sessionToken = user.session_token;

            if (!sessionToken) {
                sessionToken = Math.random().toString(36).substring(2);
                await db.query('UPDATE users SET session_token = ? WHERE id = ?', [sessionToken, user.id]);
                await db.query('INSERT INTO sessions (user_id, session_token) VALUES (?, ?)', [user.id, sessionToken]);
            } else {
                const [sessionResults] = await db.query(
                    'SELECT * FROM sessions WHERE user_id = ? AND session_token = ?',
                    [user.id, sessionToken]
                );
                if (sessionResults.length === 0) {
                    await db.query('INSERT INTO sessions (user_id, session_token) VALUES (?, ?)', [user.id, sessionToken]);
                }
            }

            const storeId = user.store_id;
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
