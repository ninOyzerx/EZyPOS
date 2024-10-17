// /api/products/route.js
import db from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Extract session token from headers
    const authHeader = request.headers.get('authorization');
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : '';

    // Validate session token
    const [sessionResults] = await db.query('SELECT * FROM sessions WHERE session_token = ?', [sessionToken]);
    const session = sessionResults[0];
    if (!session) {
      return NextResponse.json({ message: 'Invalid or expired session token' }, { status: 401 });
    }

    const userId = session.user_id;

    // Fetch store_id based on user_id
    const [userResults] = await db.query('SELECT store_id FROM users WHERE id = ?', [userId]);
    const user = userResults[0];
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const storeId = user.store_id;

    // Validate store_id from query parameter
    const url = new URL(request.url);
    const queryStoreId = url.searchParams.get('store_id');

    if (storeId.toString() !== queryStoreId) {
      return NextResponse.json({ message: 'Store ID mismatch' }, { status: 403 });
    }

    // Fetch products for the specific store
    const [productResults] = await db.query('SELECT * FROM products WHERE store_id = ?', [storeId]);
    const products = productResults;

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
