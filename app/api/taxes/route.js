// pages/api/taxes.js
import db from '../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [taxes] = await db.execute('SELECT * FROM taxes_type');
    return NextResponse.json(taxes);
  } catch (error) {
    console.error('Error fetching taxes:', error.message);
    return NextResponse.json({ error: 'Error fetching taxes' }, { status: 500 });
  }
}
