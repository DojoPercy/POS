import { prisma } from '../../../lib/prisma';
import { comparePassword, generateToken } from '../../../utils/auth';
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    
    const { email, password } = await req.json() as LoginRequestBody;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

 
    const user = await prisma.user.findUnique({
      where: { email },
    });

    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

   console.log(user.companyId);
    const token = await generateToken({
      id: user.id,
      role: user.role,
      branchId: user.branchId || '',
      companyId: user.companyId || '',
    });

    // Serialize the cookie and set it in the response headers
    
    const cookie = serialize('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', 
      path: '/', 
      maxAge: 3600,
    });

    
    const response = NextResponse.json( {token: token} ,{ status: 200 });
    response.headers.append('Set-Cookie', cookie);

    return response;
  } catch (error) {
    console.error('Error during login:', error);

   
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
