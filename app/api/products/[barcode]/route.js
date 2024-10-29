import db from '../../../lib/db'; // นำเข้าโมดูลการเชื่อมต่อฐานข้อมูล
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { barcode } = params; // รับ barcode จากพารามิเตอร์ URL
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('store_id'); // รับ store_id จาก query string

  if (!barcode || !storeId) {
    return NextResponse.json({ message: 'Barcode or store_id is missing' }, { status: 400 });
  }

  try {
    // ค้นหาสินค้าจากฐานข้อมูลโดยใช้ barcode และ store_id
    const [results] = await db.query('SELECT * FROM products WHERE product_code = ? AND store_id = ?', [barcode, storeId]);

    if (results.length === 0) {
      return NextResponse.json({ message: 'Product not found or does not belong to this store' }, { status: 404 });
    }

    const product = results[0]; // นำข้อมูลสินค้าตัวแรกที่ค้นพบออกมาใช้

    return NextResponse.json(product, { status: 200 }); // ส่งข้อมูลสินค้ากลับไป
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
