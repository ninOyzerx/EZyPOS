import { NextResponse } from 'next/server';
import db from '../../lib/db'; // Assuming db connection setup

export async function POST(req) {
  try {
    const { store_name, store_code = '', store_img = '', store_address = '', store_phone_no = '' } = await req.json();

    // Check for the required field store_name
    if (!store_name) {
      throw new Error('Store name is required.');
    }

    // Insert into the stores table
    const [result] = await db.query(
      `INSERT INTO stores (store_name, store_code, store_img, store_address, store_phone_no, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [store_name, store_code, store_img, store_address, store_phone_no]
    );

    if (result.affectedRows === 1) {
      const store_id = result.insertId; // Get the newly inserted store ID
      return NextResponse.json({ store_id });
    } else {
      throw new Error('Failed to insert store data');
    }
  } catch (error) {
    console.error('Error inserting store data:', error.message);
    return NextResponse.json({ error: 'Failed to insert store data' }, { status: 500 });
  }
}
