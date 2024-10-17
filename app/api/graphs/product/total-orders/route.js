import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const store_id = searchParams.get('store_id');

    if (!store_id) {
        return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }

    try {
        // Query the total orders for the given store_id
        const query = 'SELECT COUNT(*) as totalOrders FROM payments WHERE store_id = ?';
        const [results] = await db.execute(query, [store_id]);

        if (results.length > 0) {
            const totalOrders = results[0].totalOrders;
            return NextResponse.json({ totalOrders }, { status: 200 });
        } else {
            return NextResponse.json({ totalOrders: 0 }, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching total orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
