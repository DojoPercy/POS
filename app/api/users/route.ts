import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/utils/auth';

type UserRole = 'owner' | 'admin' | 'user';

interface CreateUserRequestBody {
  fullname: string;
  status: string;
  email: string;
  password: string;
  role: UserRole;
  branchId?: string | null;
}



export async function GET(req: NextRequest) {
  try{
     const { searchParams } = new URL(req.url);
              const id = searchParams.get('id');
          
              if (id) {
                const branch = await prisma.user.findUnique({
                  where: { id },
                });
                if (!branch) {
                  return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
                }
                return NextResponse.json(branch, { status: 200 });
              }
    const user = await prisma.user.findMany({

    });
    return NextResponse.json(user, { status: 200 });
  }catch{
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}



export async function POST(req: Request) {
  try {
    const body: CreateUserRequestBody = await req.json();

    const { email, password, role, branchId, fullname, status } = body;

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
      },
    });

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
