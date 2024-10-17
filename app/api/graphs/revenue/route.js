import db from '../../../lib/db'; // Adjust the path according to your project structure
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store_id'); // Get store_id from query parameters

    if (!storeId) {
        return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    try {
        // Query to fetch revenue data by category
        const query = `
            SELECT 
                c.name AS category_name, 
                SUM(pm.paid_amount - pm.\`change\`) AS totalRevenue
            FROM payments pm
            JOIN products p ON JSON_UNQUOTE(JSON_EXTRACT(pm.items, '$[0].productId')) = p.id
            JOIN categories c ON c.id = p.category_id
            WHERE pm.store_id = ?
            GROUP BY c.name
            ORDER BY totalRevenue DESC;
        `;

        const [revenueData] = await db.query(query, [storeId]);

        return NextResponse.json(revenueData, { status: 200 });
    } catch (error) {
        console.error('Error fetching revenue data:', error.message, error.stack);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
