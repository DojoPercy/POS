import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/utils/auth';

import { jwtDecode } from 'jwt-decode';
import { Console } from 'console';
import redis from '@/lib/redis/redis';

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  companyId?: string;
  [key: string]: any;
}
type UserRole = 'owner' | 'admin' | 'user';

interface CreateUserRequestBody {
  fullname: string;
  status: string;
  email: string;
  password: string;
  role: UserRole;
  branchId?: string | null;
  companyId?: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const companyId = searchParams.get('companyId');

    if (id) {
      const branch = await prisma.user.findUnique({
        where: { id },
      });
      if (!branch) {
        return NextResponse.json(
          { error: 'Branch not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(branch, { status: 200 });
    } else if (companyId) {
      const branches = await prisma.user.findMany({
        where: { companyId },
      });
      console.log('branches:', branches);

      return NextResponse.json(branches, { status: 200 });
    }

    const user = await prisma.user.findMany({});

    return NextResponse.json(user, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateUserRequestBody = await req.json();

    const { email, password, role, branchId, fullname, status, companyId } =
      body;

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, or role' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create user in the database
    const user = await prisma.user.create({
      data: {
        fullname,
        status,
        email,
        password: hashedPassword,
        role,
        branchId: branchId || null,
        companyId: companyId || null,
      },
    });
    console.log('User created:', user);
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          fullname: user.fullname,
          status: user.status,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
          companyId: user.companyId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'User creation failed due to a server error' },
      { status: 500 }
    );
  }
}
