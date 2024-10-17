// app/api/graphs/product/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function GET() {
    try {
        const query = 'SELECT product_name, price, stock_quantity FROM products';
        const [rows] = await db.query(query);

        // Return only the rows as an array of products
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching product data:', error);
        return NextResponse.json({ error: 'Error fetching product data' }, { status: 500 });
    }
}
