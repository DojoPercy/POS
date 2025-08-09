import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const branchId = searchParams.get('branchId');
    const id = searchParams.get('id');

    if (id) {
      const ingredient = await prisma.ingredient.findUnique({
        where: { id },
        include: {
          stocks: {
            where: branchId ? { branchId } : undefined,
          },
        },
      });
      return NextResponse.json(ingredient);
    }

    if (companyId) {
      const ingredients = await prisma.ingredient.findMany({
        where: { companyId },
        include: {
          stocks: {
            where: branchId ? { branchId } : undefined,
          },
        },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(ingredients);
    }

    return new NextResponse('Company ID is required', { status: 400 });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return new NextResponse(`Error: ${error}`, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, unit, companyId } = body;

    if (!name || !unit || !companyId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        companyId,
      },
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return new NextResponse(`Error: ${error}`, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, unit } = body;

    if (!id) {
      return new NextResponse('Ingredient ID is required', { status: 400 });
    }

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        unit,
      },
    });

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return new NextResponse(`Error: ${error}`, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Ingredient ID is required', { status: 400 });
    }

    await prisma.ingredient.delete({
      where: { id },
    });

    return new NextResponse('Ingredient deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return new NextResponse(`Error: ${error}`, { status: 500 });
  }
}
