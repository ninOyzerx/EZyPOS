import db from '../../../../lib/db';
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

        // SQL query to calculate annual sales (paid_amount - change)
        const query = `
            SELECT 
                YEAR(created_at) AS sale_year, 
                SUM(paid_amount - \`change\`) AS total_sales 
            FROM payments
            WHERE paid_amount > 0
            AND store_id = ?  -- Filter by store_id
            GROUP BY sale_year
            ORDER BY sale_year ASC;
        `;
        
        const [salesData] = await db.query(query, [storeId]); // Pass storeId as a parameter
        
        return NextResponse.json(salesData, { status: 200 });
    } catch (error) {
        console.error('Error fetching annual sales data:', error.message, error.stack);
        return NextResponse.json({ message: 'Error fetching annual sales data', error: error.message }, { status: 500 });
    }
}
