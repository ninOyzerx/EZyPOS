import db from '../../../../lib/db'; 
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store_id');
    
    if (!storeId) {
        return NextResponse.json({ message: 'Store ID is required' }, { status: 400 });
    }

    try {
        const query = `
            SELECT product_name, stock_quantity
            FROM products
            WHERE store_id = ? AND stock_quantity <= 5; 
        `;

        const [lowStockItems] = await db.query(query, [storeId]);

        return NextResponse.json(lowStockItems, { status: 200 });
    } catch (error) {
        console.error('Error fetching low stock items:', error.message, error.stack);
        return NextResponse.json({ message: 'Error fetching low stock items', error: error.message }, { status: 500 });
    }
}
