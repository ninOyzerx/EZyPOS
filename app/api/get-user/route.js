// File: /api/get-user/route.js
import db from '../../lib/db'; // Adjust the path as necessary
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        // Get the session token from the cookies in the request headers
        const cookie = req.headers.get('cookie');
        const sessionToken = cookie?.split('session_token=')[1]?.split(';')[0]; // Extract the session token

        // Check if the session token is present
        if (!sessionToken) {
            return NextResponse.json({ message: "ไม่สามารถดึงข้อมูลได้ กรุณาเข้าสู่ระบบ" }, { status: 401 });
        }

        // Query to fetch user data based on the session token
        const [userResults] = await db.query('SELECT store_id FROM users WHERE session_token = ?', [sessionToken]);

        // If no user is found with the provided session token, return 404
        if (userResults.length === 0) {
            return NextResponse.json({ message: "ไม่พบผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่" }, { status: 404 });
        }

        // Get the first user's data (if there's only one row returned)
        const userData = userResults[0];

        // Return user data in the response
        return NextResponse.json(userData, { status: 200 });
    } catch (error) {
        // Catch any unexpected errors and return a generic message
        console.error('Error fetching user data:', error);
        return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน' }, { status: 500 });
    }
}
