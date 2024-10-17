import db from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : '';
    const url = new URL(req.url);
    const storeId = url.searchParams.get('store_id');

    if (!sessionToken || !storeId) {
      return NextResponse.json({ message: 'Authorization details are missing' }, { status: 401 });
    }

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

    const userStoreId = user.store_id;

    // Validate that the store_id in the URL matches the user's store_id
    if (storeId !== userStoreId.toString()) {
      return NextResponse.json({ message: 'The store ID in the URL does not match your session' }, { status: 403 });
    }

    // Fetch categories for the store
    const [categoryResults] = await db.query('SELECT * FROM categories WHERE store_id = ?', [storeId]);
    return NextResponse.json(categoryResults);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
