// File: /api/graphs/product/top-selling/route.js
import db from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        // Assuming you extract store_id from request headers or query parameters
        const { searchParams } = new URL(req.url);
        const storeId = searchParams.get('store_id'); // Get store_id from query parameters

        // Ensure store_id is provided
        if (!storeId) {
            return NextResponse.json({ message: "store_id is required" }, { status: 400 });
        }

        const query = `
            SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(item, '$.name')) AS product_name,
                SUM(JSON_UNQUOTE(JSON_EXTRACT(item, '$.quantity'))) AS total_sold
            FROM (
                SELECT JSON_UNQUOTE(JSON_EXTRACT(items, CONCAT('$[', numbers.n, ']'))) AS item
                FROM payments
                JOIN (
                    SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
                ) numbers
                WHERE JSON_UNQUOTE(JSON_EXTRACT(items, CONCAT('$[', numbers.n, ']'))) IS NOT NULL
                AND store_id = ?  -- Filter by store_id
            ) AS extracted_items
            GROUP BY product_name
            ORDER BY total_sold DESC
            LIMIT 5;
        `;

        const [rows] = await db.query(query, [storeId]); // Pass storeId as a parameter

        return NextResponse.json(rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching top-selling products from payments:', error);
        return NextResponse.json({ message: 'Error fetching top-selling products from payments', error: error.message }, { status: 500 });
    }
}
