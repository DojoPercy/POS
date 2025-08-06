import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    // Clear the authentication cookie by setting it to expire in the past
    const cookie = serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: -1, // Setting maxAge to -1 ensures the cookie is removed
    });

    // Create a response and append the cleared cookie
    const response = NextResponse.json(
      { message: 'Successfully logged out' },
      { status: 200 },
    );
    response.headers.append('Set-Cookie', cookie);

    return response;
  } catch (error) {
    console.error('Error during logout:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
