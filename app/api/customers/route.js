import { NextResponse } from 'next/server';
import db from '../../lib/db';

export async function GET(req) {
  try {
    // Extract sessionToken from the Authorization header
    const authHeader = req.headers.get('authorization');
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : '';
    
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store_id');

    // Check if sessionToken and storeId exist
    if (!sessionToken) {
      return NextResponse.json({ message: 'ไม่ได้รับอนุญาตให้เข้าถึง (Unauthorized)' }, { status: 401 });
    }

    if (!storeId) {
      return NextResponse.json({ message: 'Store ID is missing' }, { status: 400 });
    }

    // Validate sessionToken (this is a placeholder for actual validation)
    // You would implement actual token validation based on your authentication logic
    const sessionIsValid = await validateSessionToken(sessionToken);
    if (!sessionIsValid) {
      return NextResponse.json({ message: 'Invalid session token' }, { status: 403 });
    }

    // Fetch customers associated with the storeId from the database
    const [customers] = await db.query('SELECT id, name, phone_no, email FROM customers WHERE store_id = ?', [storeId]);
    
    // Return the customer data in JSON format
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    
    // Return an error response if something goes wrong
    return NextResponse.json({ message: 'Error fetching customers' }, { status: 500 });
  }
}

// Placeholder function for session token validation
async function validateSessionToken(token) {
  // Implement actual session validation logic here
  // For now, we'll assume all tokens are valid
  return true;
}
