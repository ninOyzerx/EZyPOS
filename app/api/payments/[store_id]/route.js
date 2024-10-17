import { NextResponse } from 'next/server';
import db from '../../../lib/db'; // Adjust the path according to your project structure

// GET request to fetch payments by store_id
export async function GET(request, { params }) {
  const { store_id } = params; // Extract store_id from the URL parameters

  try {
    // Query to fetch payments for the specified store_id
    const [payments] = await db.query(
      'SELECT * FROM payments WHERE store_id = ? ORDER BY created_at DESC',
      [store_id]
    );

    // If no payments are found, return a 404 response
    if (payments.length === 0) {
      return NextResponse.json({ message: 'No payments found for this store' }, { status: 404 });
    }

    // Return the list of payments with a 200 status code
    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    console.error('Error fetching payments:', error);
    // Return a 500 response in case of an error
    return NextResponse.json({ message: 'Error fetching payments', error }, { status: 500 });
  }
}
