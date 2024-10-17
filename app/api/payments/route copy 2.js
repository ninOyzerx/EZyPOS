import db from '../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { amount, paymentMethod, change, transactionId, items } = await request.json();

  // Check for missing fields
  if (!amount || !paymentMethod || change === undefined || !transactionId || !items || !Array.isArray(items)) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
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
        throw new Error(`ข้อมูลสินค้าไม่ถูกต้อง: ${JSON.stringify(item)}`);
      }

      // ตรวจสอบ stock_quantity ปัจจุบันและชื่อสินค้าของสินค้า
      const [stockCheckResult] = await connection.execute(
        `SELECT stock_quantity, product_name FROM products WHERE id = ?`,
        [productId]
      );

      if (stockCheckResult.length === 0) {
        throw new Error(`ไม่พบสินค้าที่มีรหัส ${productId}`);
      }

      const currentStock = stockCheckResult[0].stock_quantity;
      const productName = stockCheckResult[0].product_name;

      // ถ้าสต๊อกหมด ห้ามทำการชำระเงิน และแจ้งเตือนชื่อสินค้า
      if (currentStock <= 0) {
        throw new Error(`สินค้า "${productName}" หมดสต็อก`);
      }

      // ถ้าสต๊อกไม่เพียงพอ ห้ามทำการชำระเงิน
      if (currentStock < quantity) {
        throw new Error(`สินค้า "${productName}" มีสต็อกไม่เพียงพอ เหลือเพียง ${currentStock} ชิ้น`);
      }

      // อัปเดต stock_quantity ในตาราง products
      const [updateResult] = await connection.execute(
        `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
        [quantity, productId]
      );

      // ตรวจสอบว่ามีการอัปเดต stock หรือไม่
      if (updateResult.affectedRows === 0) {
        throw new Error(`ไม่สามารถอัปเดตสต็อกของสินค้า "${productName}" ได้`);
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
          productName: productName,
          remainingStock: stockResult[0].stock_quantity,
        });
      }
    }

    // คำนวณ remain_quantity จาก updatedStockQuantities
    const totalRemainingStock = updatedStockQuantities.reduce((total, item) => total + item.remainingStock, 0);

    // บันทึกข้อมูลการชำระเงิน พร้อมกับค่าคงเหลือของ remain_quantity
    const [result] = await connection.execute(
      `INSERT INTO payments (paid_amount, payment_method, \`change\`, transaction_id, items, remain_quantity, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [amount, paymentMethod, change, transactionId, JSON.stringify(items), totalRemainingStock]
    );

    // commit transaction
    await connection.commit();

    return NextResponse.json({
      message: 'บันทึกการชำระเงินและอัปเดตสต็อกเรียบร้อยแล้ว',
      paymentId: result.insertId,
      updatedStocks: updatedStockQuantities,
    }, { status: 201 });

  } catch (error) {
    // rollback transaction หากมีข้อผิดพลาด
    await connection.rollback();
    console.error('Error recording payment and updating inventory:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    if (connection) connection.release();
  }
}
