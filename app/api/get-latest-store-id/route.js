import { NextResponse } from 'next/server'; // Make sure to import NextResponse
import db from '../../lib/db'; // Assuming db connection is correctly setup

export async function GET() {
  try {
    // Query to get the highest store_id from the stores table
    const [rows] = await db.query('SELECT MAX(id) as latestStoreId FROM stores');
    
    const latestStoreId = rows[0]?.latestStoreId || 0; // Default to 0 if no stores exist

    return NextResponse.json({ latestStoreId });
  } catch (error) {
    console.error('Error fetching latest store_id:', error);
    return NextResponse.json({ error: 'Failed to fetch latest store_id' }, { status: 500 });
  }
}
