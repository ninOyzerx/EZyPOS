// lib/auth.js
import db from './db';
import { parse } from 'cookie';

export async function getSession(req) {
  const cookies = parse(req.headers.cookie || '');
  const sessionToken = cookies.session_token;

  if (!sessionToken) return null;

  const [sessionResults] = await db.query(
    'SELECT * FROM sessions WHERE session_token = ?',
    [sessionToken]
  );
  const session = sessionResults[0];

  if (!session) return null;

  const [userResults] = await db.query(
    'SELECT * FROM users WHERE id = ?',
    [session.user_id]
  );
  return userResults[0];
}
