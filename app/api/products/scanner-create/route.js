import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // for generating unique file names
import fs from 'fs';
import path from 'path';
import db from '../../../lib/db'; // Assuming you have a DB module for database queries

// Use dynamic or revalidate options instead of deprecated config
export const dynamic = 'force-dynamic'; // Ensures the route is dynamic and not cached
export const revalidate = 0; // Disable caching for this API route

export async function POST(req) {
  const buffers = [];
  for await (const chunk of req.body) {
    buffers.push(chunk);
  }

  const boundary = req.headers.get('content-type').split('=')[1];
  const body = Buffer.concat(buffers);
  const parts = body.toString().split(boundary);

  // Extract fields and file data from form-data
  const formData = {};
  let imageFileBuffer;
  let imageFileName = '';

  parts.forEach((part) => {
    if (part.includes('Content-Disposition')) {
      const name = part.match(/name="([^"]*)"/)[1];

      if (part.includes('filename=')) {
        // Handle file upload
        const fileContent = part.split('\r\n\r\n')[1].split('\r\n--')[0];
        const fileInfo = part.match(/filename="([^"]*)"/);
        imageFileBuffer = Buffer.from(fileContent);
        imageFileName = fileInfo[1]; // Get the original file name
      } else {
        // Handle form fields
        const value = part.split('\r\n\r\n')[1].split('\r\n--')[0];
        formData[name] = value;
      }
    }
  });

  const { product_code, name, price, stock_quantity, category_id, store_id } = formData;

  if (!product_code || !name || !price || !stock_quantity || !category_id || !store_id) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  let imageUrl = null;
  if (imageFileBuffer && imageFileName) {
    // Generate a new unique file name to avoid conflicts
    const newFileName = `${uuidv4()}${path.extname(imageFileName)}`;
    const uploadPath = path.join('public', 'uploads', 'product', store_id.trim(), newFileName);

    // Ensure the directory exists
    if (!fs.existsSync(path.dirname(uploadPath))) {
      fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
    }

    // Save the file to the server
    fs.writeFileSync(uploadPath, imageFileBuffer);

    // Create the URL for the saved image
    imageUrl = `/uploads/product/${store_id.trim()}/${newFileName}`;
  }

  try {
    // Insert the product into the database
    const [result] = await db.query(
      `INSERT INTO products (product_code, product_name, price, stock_quantity, category_id, store_id, img) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product_code, name, price, stock_quantity, category_id, store_id, imageUrl]
    );

    if (result.affectedRows > 0) {
      return NextResponse.json({ message: 'Product created successfully' });
    } else {
      return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
