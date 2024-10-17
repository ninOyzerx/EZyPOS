// api/products/route.js

import db from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : '';
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('category_id');
    const storeId = url.searchParams.get('store_id');
    const productCode = url.searchParams.get('product_code');  // ดึง product_code จากพารามิเตอร์

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

    // Validate that the store_id exists in the stores table
    const [storeResults] = await db.query('SELECT * FROM stores WHERE id = ?', [storeId]);
    const store = storeResults[0];
    if (!store) {
      return NextResponse.json({ message: 'Store not found' }, { status: 404 });
    }

    // ตรวจสอบว่ามี product_code หรือไม่ และทำการค้นหาด้วย product_code
    if (productCode) {
      const [productResults] = await db.query('SELECT * FROM products WHERE product_code = ? AND store_id = ?', [productCode, storeId]);
      const product = productResults[0];
      
      if (!product) {
        return NextResponse.json({ message: 'ไม่พบสินค้าในฐานข้อมูล' }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    // Fetch products for the store and category
    let query = 'SELECT * FROM products WHERE store_id = ?';
    let params = [storeId];

    if (categoryId) {
      query += ' AND category_id = ?';
      params.push(categoryId);
    }

    const [productResults] = await db.query(query, params);
    return NextResponse.json(productResults);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
