import { NextRequest, NextResponse } from 'next/server';
import {jwtDecode} from "jwt-decode"; // Ensure the correct library is imported

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface DecodedToken {
  role: string; // Assuming the token contains a "role" property
  userId?: string; 
  branchId?: string// Additional properties if available
  [key: string]: any;
}

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/public', '/start'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes to pass through
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Retrieve the token from cookies
  const token = req.cookies.get('token')?.value;

  // Redirect to /login if no token is found
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // Decode the JWT to extract the user's role
    const decodedToken: DecodedToken = jwtDecode(token);

    console.log('Decoded Token:', decodedToken);

    // Role-based access control
    if (pathname.startsWith('/owner') && decodedToken.role !== 'owner') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (
      pathname.startsWith('/branch') &&
      !(decodedToken.role === 'manager' || decodedToken.role === 'owner')
    ) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (pathname.startsWith('/waiter') && decodedToken.role !== 'waiter') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (pathname.startsWith('/kitchen') && decodedToken.role !== 'kitchen') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // For the root route "/", redirect based on role
    if (pathname === '/') {
      switch (decodedToken.role) {
        case 'owner':
          return NextResponse.redirect(new URL('/owner/dashboard', req.url));
        case 'manager':
          return NextResponse.redirect(new URL(`/branch/${decodedToken.branchId}`, req.url));
        case 'waiter':
          return NextResponse.redirect(new URL('/waiter/order/new', req.url));
        case 'kitchen':
          return NextResponse.redirect(new URL('/kitchen/dashboard', req.url));
        default:
          return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Optionally, pass user details in headers
    const headers = new Headers(req.headers);
    headers.set('x-user-id', decodedToken.userId || '');
    headers.set('x-user-role', decodedToken.role);

    return NextResponse.next({ request: { headers } });
  } catch (error) {
    console.error('Token decoding or verification failed:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/', '/owner/:path*', '/branch/:path*', '/waiter/:path*', '/kitchen/:path*'], // Protect these routes
};
