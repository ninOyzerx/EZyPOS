import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Use uuid to generate unique file names

// New route configuration for Next.js App Router
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching for dynamic routes

// GET request to fetch categories by store_id and include product count for that store
export async function GET(request, { params }) {
  const { store_id } = params;

  try {
    // Query to fetch categories along with the product count for the given store
    const query = `
      SELECT 
        c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.store_id = ?) AS product_count
      FROM categories c
      WHERE c.store_id = ?
    `;

    const [categories] = await db.query(query, [store_id, store_id]);

    if (categories.length === 0) {
      return NextResponse.json({ message: 'No categories found for this store' }, { status: 404 });
    }

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Error fetching categories', error }, { status: 500 });
  }
}

// POST request to create a new category
export async function POST(req, { params }) {
  const { store_id } = params;

  try {
    const formData = await req.formData();
    
    const name = formData.get('name');
    const description = formData.get('description');
    const imageFile = formData.get('category_img'); // Image might be null if not uploaded

    if (!name || !description) {
      return NextResponse.json({ message: 'Name and description are required' }, { status: 400 });
    }

    let imagePath = null; // Initialize as null in case no image is uploaded

    if (imageFile) {
      // Generate a unique file name using uuid and preserve the original file extension
      const uniqueFileName = `${uuidv4()}${path.extname(imageFile.name)}`;

      // Define the upload directory based on store_id
      const uploadDir = `./public/uploads/category/${store_id}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      // Ensure the directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Write the file to the designated directory
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Set the new image path
      imagePath = `/uploads/category/${store_id}/${uniqueFileName}`;
    }

    // Save the category in the database (imagePath can be null if no image was uploaded)
    await db.query(
      'INSERT INTO categories (store_id, name, description, category_img) VALUES (?, ?, ?, ?)',
      [store_id, name, description, imagePath]
    );

    return NextResponse.json({ message: 'Category created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ message: 'Error creating category', error }, { status: 500 });
  }
}

// PUT request to update an existing category
export async function PUT(req, { params }) {
  const { store_id } = params;

  try {
    const formData = await req.formData(); // Parse the incoming formData

    const id = formData.get('id');
    const name = formData.get('name');
    const description = formData.get('description');
    const imageFile = formData.get('category_img');

    if (!id || !name || !description) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    let imagePath = null;

    // If there is a new image file, handle it
    if (imageFile && imageFile.size > 0) {
      // Generate a unique file name using uuid and preserve the original file extension
      const uniqueFileName = `${uuidv4()}${path.extname(imageFile.name)}`;

      // Define the upload directory based on store_id
      const uploadDir = `./public/uploads/category/${store_id}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      // Ensure the directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Write the file to the designated directory
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Set the new image path
      imagePath = `/uploads/category/${store_id}/${uniqueFileName}`;
    } else {
      // If no new image was uploaded, use the existing image path from the database
      const [[category]] = await db.query('SELECT category_img FROM categories WHERE id = ? AND store_id = ?', [id, store_id]);
      imagePath = category.category_img;
    }

    // Update the category in the database
    await db.query(
      'UPDATE categories SET name = ?, description = ?, category_img = ? WHERE id = ? AND store_id = ?',
      [name, description, imagePath, id, store_id]
    );

    return NextResponse.json({ message: 'Category updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ message: 'Error updating category', error }, { status: 500 });
  }
}

// DELETE request to delete a category
export async function DELETE(request, { params }) {
  const { store_id } = params;
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
  }

  try {
    // Delete all products related to the category before deleting the category
    await db.query('DELETE FROM products WHERE category_id = ?', [id]);

    // Delete the category
    const result = await db.query('DELETE FROM categories WHERE id = ? AND store_id = ?', [id, store_id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Category not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category and related products deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting category and products:', error);
    return NextResponse.json({ message: 'Error deleting category', error }, { status: 500 });
  }
}
