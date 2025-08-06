import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const users = await prisma.user.findUnique({
      where: { id },
    });
    if (!users) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const body = await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user with provided fields
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(body.fullname && { fullname: body.fullname }),
        ...(body.email && { email: body.email }),
        ...(body.role && { role: body.role }),
        ...(body.status && { status: body.status }),
        ...(body.branchId !== undefined && { branchId: body.branchId }),
        ...(body.companyId !== undefined && { companyId: body.companyId }),
        ...(body.phone && { phone: body.phone }),
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const { id } = params;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is the owner of the company
    if (existingUser.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot delete owner account' },
        { status: 400 },
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 },
    );
  }
}
