import db from '../../../../lib/db';
import { NextResponse } from 'next/server';
import { format } from 'date-fns'; // ใช้เพื่อจัดการวันที่

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const store_id = searchParams.get('store_id');

    if (!store_id) {
        return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }

    try {
        // กำหนดวันที่ของวันนี้ในรูปแบบที่ฐานข้อมูลของคุณรองรับ
        const todayDate = format(new Date(), 'yyyy-MM-dd'); // เช่น: '2024-10-16'

        // Query the orders for today for the given store_id โดยใช้ฟิลด์ created_at
        const query = `
            SELECT COUNT(*) as todayOrders 
            FROM payments 
            WHERE store_id = ? 
            AND DATE(created_at) = ?
        `;
        const [results] = await db.execute(query, [store_id, todayDate]);

        if (results.length > 0) {
            const todayOrders = results[0].todayOrders;
            return NextResponse.json({ todayOrders }, { status: 200 });
        } else {
            return NextResponse.json({ todayOrders: 0 }, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching today orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
