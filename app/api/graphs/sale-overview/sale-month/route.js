import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        // Get store_id from the query parameters
        const { searchParams } = new URL(req.url);
        const storeId = searchParams.get('store_id');

        if (!storeId) {
            return NextResponse.json({ message: 'Store ID is required' }, { status: 400 });
        }

        // Query to calculate total sales for the current month (paid_amount - change)
        const query = `
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') AS sale_month, 
                SUM(paid_amount - \`change\`) AS total_sales 
            FROM payments
            WHERE 
                paid_amount > 0
                AND store_id = ?
                AND MONTH(created_at) = MONTH(CURRENT_DATE())
                AND YEAR(created_at) = YEAR(CURRENT_DATE())
            GROUP BY sale_month
            ORDER BY sale_month ASC;
        `;
        
        const [salesData] = await db.query(query, [storeId]); // Pass storeId as a parameter
        
        return NextResponse.json(salesData, { status: 200 });
    } catch (error) {
        console.error('Error fetching current month sales data:', error.message, error.stack);
        return NextResponse.json({ message: 'Error fetching current month sales data', error: error.message }, { status: 500 });
    }
}
