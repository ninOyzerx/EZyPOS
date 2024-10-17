import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function GET(req) {
  try {
    const sessionToken = req.headers.get('Authorization')?.split(' ')[1];
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store_id');

    if (!sessionToken) {
      console.log('Unauthorized: No session token');
      return NextResponse.json({ message: 'Unauthorized, no session token' }, { status: 401 });
    }

    if (!storeId) {
      console.log('Missing store_id parameter');
      return NextResponse.json({ message: 'Missing store_id parameter' }, { status: 400 });
    }

    // console.log('Session Token:', sessionToken);
    // console.log('Store ID:', storeId);

    const [rows] = await db.query('SELECT store_name, store_address, store_img, store_phone_no FROM stores WHERE id = ?', [storeId]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'No store found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching store details:', error);  
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
