import db from '../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { amount, paymentMethod, change, transactionId, items, storeId } = await request.json(); // Add storeId to the destructured payload

  // Check for missing fields
  if (!amount || !paymentMethod || change === undefined || !transactionId || !items || !Array.isArray(items) || !storeId) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
  }

  const connection = await db.getConnection(); // Get connection for transaction
  try {
    // Begin transaction
    await connection.beginTransaction();

    const updatedStockQuantities = []; // Array to hold updated stock quantities

    // Loop through items to update stock
    for (const item of items) {
      const { productId, quantity } = item;

      // Check that productId and quantity are valid
      if (!productId || !quantity) {
        throw new Error(`ข้อมูลสินค้าไม่ถูกต้อง: ${JSON.stringify(item)}`);
      }

      // Check current stock quantity and product name
      const [stockCheckResult] = await connection.execute(
        `SELECT stock_quantity, product_name FROM products WHERE id = ?`,
        [productId]
      );

      if (stockCheckResult.length === 0) {
        throw new Error(`ไม่พบสินค้าที่มีรหัส ${productId}`);
      }

      const currentStock = stockCheckResult[0].stock_quantity;
      const productName = stockCheckResult[0].product_name;

      // If stock is out, disallow payment and notify product name
      if (currentStock <= 0) {
        throw new Error(`สินค้า "${productName}" หมดสต็อก`);
      }

      // If stock is insufficient, disallow payment
      if (currentStock < quantity) {
        throw new Error(`สินค้า "${productName}" มีสต็อกไม่เพียงพอ เหลือเพียง ${currentStock} ชิ้น`);
      }

      // Update stock quantity in products table
      const [updateResult] = await connection.execute(
        `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
        [quantity, productId]
      );

      // Check if stock was updated
      if (updateResult.affectedRows === 0) {
        throw new Error(`ไม่สามารถอัปเดตสต็อกของสินค้า "${productName}" ได้`);
      }

      // Retrieve remaining stock after update
      const [stockResult] = await connection.execute(
        `SELECT stock_quantity FROM products WHERE id = ?`,
        [productId]
      );

      // Add remaining stock to array
      if (stockResult.length > 0) {
        updatedStockQuantities.push({
          productId: productId,
          productName: productName,
          remainingStock: stockResult[0].stock_quantity,
        });
      }
    }

    // Calculate remain_quantity from updatedStockQuantities
    const totalRemainingStock = updatedStockQuantities.reduce((total, item) => total + item.remainingStock, 0);

    // Insert payment data including storeId
    const [result] = await connection.execute(
      `INSERT INTO payments (paid_amount, payment_method, \`change\`, transaction_id, items, remain_quantity, store_id, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [amount, paymentMethod, change, transactionId, JSON.stringify(items), totalRemainingStock, storeId]
    );

    // Commit transaction
    await connection.commit();

    return NextResponse.json({
      message: 'บันทึกการชำระเงินและอัปเดตสต็อกเรียบร้อยแล้ว',
      paymentId: result.insertId,
      updatedStocks: updatedStockQuantities,
    }, { status: 201 });

  } catch (error) {
    // Rollback transaction if there's an error
    await connection.rollback();
    console.error('Error recording payment and updating inventory:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    if (connection) connection.release();
  }
}
