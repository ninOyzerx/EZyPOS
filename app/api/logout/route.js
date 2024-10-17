import { NextResponse } from 'next/server';
import db from '../../lib/db'; // Adjust this path according to your project structure

export async function POST(request) {
  try {
    // Extract cookies from the request headers
    const cookies = request.headers.get('cookie') || '';
    const sessionTokenMatch = cookies.match(/session_token=([^;]*)/);
    const sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : null;

    // Check if session token exists
    if (!sessionToken) {
      return NextResponse.json({ message: 'No session token provided' }, { status: 400 });
    }

    // Delete the session from the database
    await db.query('DELETE FROM sessions WHERE session_token = ?', [sessionToken]);

    // Create the response and remove the session cookie
    const response = NextResponse.json({ message: 'Logged out successfully' });
    
    // Remove the session_token cookie
    response.cookies.set('session_token', '', {
      maxAge: 0, // Expire immediately
      httpOnly: true, // Ensure it's HTTP-only for security
      path: '/', // Make sure it's deleted across the entire domain
    });

    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json({ message: 'Failed to log out' }, { status: 500 });
  }
}

// อันเก่า
// import { NextResponse } from 'next/server';
// import db from '../../lib/db'; // Adjust the import based on your setup

// export async function POST(request) {
//   try {
//     // Get cookies from headers
//     const cookies = request.headers.get('cookie') || '';
//     const sessionTokenMatch = cookies.match(/session_token=([^;]*)/);
//     const sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : '';

//     // Check if session token exists
//     if (!sessionToken) {
//       return NextResponse.json({ message: 'No session token provided' }, { status: 400 });
//     }

//     await db.query('DELETE FROM sessions WHERE session_token = ?', [sessionToken]);

//     const response = NextResponse.json({ message: 'Logged out successfully' });
//     response.cookies.delete('session_token');

//     return response;
//   } catch (error) {
//     console.error('Error invalidating session:', error);
//     return NextResponse.json({ message: 'Failed to log out' }, { status: 500 });
//   }
// }
