import db from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        // Get the store_id from the query parameters
        const { searchParams } = new URL(req.url);
        const storeId = searchParams.get('store_id');

        // Check if store_id is provided
        if (!storeId) {
            return NextResponse.json({ error: 'กรุณาระบุ store_id' }, { status: 400 });
        }

        // Query to fetch total sales (paid_amount - change) grouped by payment date for a specific store
        const query = `
            SELECT DATE(created_at) AS sale_date, SUM(paid_amount - \`change\`) AS total_sales
            FROM payments
            WHERE paid_amount > 0 -- Assuming payments with paid_amount > 0 are successful payments
            AND store_id = ?  -- Filter by store_id
            GROUP BY sale_date
            ORDER BY sale_date ASC;
        `;
        
        const [salesData] = await db.query(query, [storeId]); // Pass storeId as a parameter
        
        return NextResponse.json(salesData, { status: 200 });
    } catch (error) {
        console.error('Error fetching sales data:', error.message, error.stack);
        return NextResponse.json({ message: 'Error fetching sales data', error: error.message }, { status: 500 });
    }
}
