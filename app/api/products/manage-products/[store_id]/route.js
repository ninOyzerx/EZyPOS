import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Use uuid to generate unique file names

// New configuration for Next.js dynamic routes
export const dynamic = 'force-dynamic'; // Ensures that the API route is treated as dynamic
export const revalidate = 0; // Prevent caching of dynamic content

// GET request to fetch products by store_id
export async function GET(request, { params }) {
  const { store_id } = params;

  try {
    const [products] = await db.query('SELECT * FROM products WHERE store_id = ?', [store_id]);
    if (products.length === 0) {
      return NextResponse.json({ message: 'No products found for this store' }, { status: 404 });
    }
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Error fetching products', error }, { status: 500 });
  }
}

// POST request to create a new product
export async function POST(req, { params }) {
  const { store_id } = params;

  try {
      const formData = await req.formData();

      const name = formData.get('name');
      const code = formData.get('code');
      const categoryId = formData.get('categoryId');
      const price = formData.get('price');
      const stockQuantity = formData.get('stockQuantity');
      const imageFile = formData.get('productImg');

      // Check for required fields, except for the image file
      if (!name || !code || !categoryId || !price || !stockQuantity) {
          return NextResponse.json({ message: 'All fields except image are required' }, { status: 400 });
      }

      let imagePath = null;

      // Handle image upload if an image is provided
      if (imageFile && imageFile.name) {
          // Generate unique file name using uuid and original extension
          const uniqueFileName = `${uuidv4()}${path.extname(imageFile.name)}`;

          const buffer = Buffer.from(await imageFile.arrayBuffer());
          const uploadDir = `./public/uploads/product/${store_id}`;
          const filePath = path.join(uploadDir, uniqueFileName);

          // Ensure the directory exists
          if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
          }

          // Write the file to disk
          fs.writeFileSync(filePath, buffer);

          // Set the image path for saving in the database
          imagePath = `/uploads/product/${store_id}/${uniqueFileName}`;
      }

      // Save the product in the database
      await db.query(
          'INSERT INTO products (store_id, category_id, product_name, product_code, price, stock_quantity, img) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [store_id, categoryId, name, code, price, stockQuantity, imagePath]
      );

      return NextResponse.json({ message: 'Product created successfully' }, { status: 201 });
  } catch (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ message: 'Error creating product', error }, { status: 500 });
  }
}


// PUT request to update a product
export async function PUT(req, { params }) {
  const { store_id } = params;

  try {
    const formData = await req.formData();
    const id = formData.get('id');
    const name = formData.get('name');
    const code = formData.get('code');
    const categoryId = formData.get('categoryId');
    const price = formData.get('price');
    const stockQuantity = formData.get('stockQuantity');
    const imageFile = formData.get('productImg');

    if (!id || !name || !code || !categoryId || !price || !stockQuantity) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    let imagePath = formData.get('existingImg'); // Fallback to existing image if no new image uploaded

    if (imageFile) {
      // Handle new image upload

      // Generate unique file name with uuid and preserve original extension
      const uniqueFileName = `${uuidv4()}${path.extname(imageFile.name)}`;

      // Define the upload directory based on store_id
      const uploadDir = `./public/uploads/product/${store_id}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      // Ensure the directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Write the file to the designated directory
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Set the new image path
      imagePath = `/uploads/product/${store_id}/${uniqueFileName}`;
    }

    // Update product in the database
    await db.query(
      'UPDATE products SET category_id = ?, product_name = ?, product_code = ?, price = ?, stock_quantity = ?, img = ? WHERE id = ? AND store_id = ?',
      [categoryId, name, code, price, stockQuantity, imagePath, id, store_id]
    );

    return NextResponse.json({ message: 'Product updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Error updating product', error }, { status: 500 });
  }
}

// DELETE request to delete a product
export async function DELETE(req) {
  try {
    const { productId } = await req.json(); // Extract productId from request body

    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    // Delete the product from the database
    const result = await db.query('DELETE FROM products WHERE id = ?', [productId]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Product not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Error deleting product', error }, { status: 500 });
  }
}
