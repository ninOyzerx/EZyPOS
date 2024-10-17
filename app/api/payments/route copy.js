import db from '../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { amount, paymentMethod, change, transactionId, items } = await request.json();

  // Check for missing fields
  if (!amount || !paymentMethod || change === undefined || !transactionId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
  }

  const connection = await db.getConnection(); // เรียก connection เพื่อใช้ transaction
  try {
    // เริ่ม transaction
    await connection.beginTransaction();

    const updatedStockQuantities = []; // สร้างอาร์เรย์สำหรับเก็บ stock_quantity ที่อัปเดต

    // วนลูปลดจำนวนสินค้าในตาราง products
    for (const item of items) {
      const { productId, quantity } = item;

      // ตรวจสอบว่า productId และ quantity มีค่าหรือไม่
      if (!productId || !quantity) {
          throw new Error(`Missing productId or quantity in item: ${JSON.stringify(item)}`);
      }

      // อัปเดต stock_quantity ในตาราง products
      const [updateResult] = await connection.execute(
          `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
          [quantity, productId]
      );

      // ตรวจสอบว่ามีการอัปเดต stock หรือไม่
      if (updateResult.affectedRows === 0) {
          throw new Error(`Product with ID ${productId} not found or insufficient quantity`);
      }

      // ดึง stock_quantity หลังจากอัปเดตแล้ว
      const [stockResult] = await connection.execute(
          `SELECT stock_quantity FROM products WHERE id = ?`,
          [productId]
      );

      // เพิ่มค่า stock_quantity ที่เหลืออยู่ลงในอาร์เรย์
      if (stockResult.length > 0) {
          updatedStockQuantities.push({
              productId: productId,
              remainingStock: stockResult[0].stock_quantity, // เป็นจำนวน int
          });
      }
    }

    // คำนวณ remain_quantity จาก updatedStockQuantities
    const totalRemainingStock = updatedStockQuantities.reduce((total, item) => total + item.remainingStock, 0);

    // บันทึกข้อมูลการชำระเงิน พร้อมกับค่าคงเหลือของ remain_quantity
    const [result] = await connection.execute(
        `INSERT INTO payments (paid_amount, payment_method, \`change\`, transaction_id, items, remain_quantity, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [amount, paymentMethod, change, transactionId, JSON.stringify(items), totalRemainingStock] // ส่งค่าเป็น int
    );

    // commit transaction
    await connection.commit();

    return NextResponse.json({
      message: 'Payment recorded and inventory updated',
      paymentId: result.insertId,
      updatedStocks: updatedStockQuantities, // ส่งค่าของ stock_quantity ที่อัปเดต
    }, { status: 201 });

  } catch (error) {
    // rollback transaction หากมีข้อผิดพลาด
    await connection.rollback();
    console.error('Error recording payment and updating inventory:', error.message);
    return NextResponse.json({ error: 'Error recording payment or updating inventory' }, { status: 500 });
  } finally {
    // ปล่อย connection หลังเสร็จสิ้น
    if (connection) connection.release();
  }
}
