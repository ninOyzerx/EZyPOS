import { hash } from 'bcryptjs';
import db from '../../lib/db';

export async function POST(req) {
  const { store_name, store_code, username, password, email } = await req.json();

  try {
    // Check if the username or email already exists
    const [existingUserResults] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existingUserResults.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Username or email already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Generate a new session token using Math.random()
    const sessionToken = Math.random().toString(36).substring(2);

    // Insert the new store into the database
    const [storeResult] = await db.query(
      'INSERT INTO stores (store_name, store_code) VALUES (?, ?)',
      [store_name, store_code]
    );
    const storeId = storeResult.insertId; // Get the store ID from the result

    // Insert the new user into the database with the session token
    const [userResult] = await db.query(
      'INSERT INTO users (store_id, username, password_hash, email, session_token) VALUES (?, ?, ?, ?, ?)',
      [storeId, username, hashedPassword, email, sessionToken]
    );

    // Insert the session token into the sessions table
    await db.query(
      'INSERT INTO sessions (user_id, session_token) VALUES (?, ?)',
      [userResult.insertId, sessionToken]
    );

    return new Response(
      JSON.stringify({ message: 'Registration successful', sessionToken }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
