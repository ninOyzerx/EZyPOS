// app/api/validate-session/route.js

import db from '../../lib/db';

export async function POST(req) {
  const { sessionToken, storeId } = await req.json();

  try {
    const [sessionResults] = await db.query(
      'SELECT user_id FROM sessions WHERE session_token = ?',
      [sessionToken]
    );

    if (sessionResults.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid session token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = sessionResults[0].user_id;

    const [userResults] = await db.query(
      'SELECT store_id FROM users WHERE id = ?',
      [userId]
    );

    if (userResults.length === 0 || userResults[0].store_id !== parseInt(storeId, 10)) {
      return new Response(
        JSON.stringify({ error: 'Invalid store ID for this session' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Session and store ID are valid' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error validating session:', error);
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
