import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  [key: string]: any;
}

const publicRoutes = [
  '/login',
  '/register',
  '/public',
  '/start',
  '/start/business-setup',
  '/waiter',
  '/branch',
];
interface RolePermissions {
  [key: string]: string[];
}

const rolePermissions: RolePermissions = {
  owner: ['/owner/*', '/branch/*', '/manager/*', '/kitchen/*', '/waiter/*'],
  manager: ['/branch/*', '/manager/*'],
  waiter: ['/waiter/*'],
  kitchen: ['/kitchen/*'],
  customer: ['/public/*'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decodedToken: DecodedToken = jwtDecode(token);

    if (pathname === '/') {
      const roleRedirects: { [key: string]: string } = {
        owner: '/owner/dashboard',
        manager: `/branch/${decodedToken.branchId}`,
        waiter: '/waiter/order/new',
        kitchen: '/kitchen/dashboard',
      };

      const redirectUrl = roleRedirects[decodedToken.role];

      if (redirectUrl) {
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      } else {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    const userRole = decodedToken.role;
    const allowedRoutes = rolePermissions[userRole] || [];

    const isAllowed = allowedRoutes.some(route => {
      const regex = new RegExp(`^${route.replace('*', '.*')}$`);
      return regex.test(pathname);
    });

    if (!isAllowed) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

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
  matcher: [
    '/',
    '/owner/:path*',
    '/branch/:path*',
    '/waiter/:path*',
    '/kitchen/:path*',
  ],
};
