import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const connectionConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function POST(req) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return new Response(
      JSON.stringify({ status: 0, message: 'ชื่อผู้ใช้งานและรหัสผ่านจำเป็นต้องถูกป้อน' }),
      { status: 400 }
    );
  }

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    const [rows] = await connection.execute('SELECT username, password FROM users WHERE username = ?', [username]);

    if (rows.length > 0) {
      const user = rows[0];

      // Using async bcrypt.compare
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        // You can start a session here if needed

        return new Response(
          JSON.stringify({ status: 1, message: 'เข้าสู่ระบบสำเร็จ!' }),
          { status: 200 }
        );
      } else {
        return new Response(
          JSON.stringify({ status: 0, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' }),
          { status: 401 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ status: 0, message: 'ไม่พบผู้ใช้งาน' }),
        { status: 404 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ status: 0, message: 'ข้อผิดพลาดโดยระบบ' }),
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
