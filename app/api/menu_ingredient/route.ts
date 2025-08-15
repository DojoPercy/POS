import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const menuId = searchParams.get('menuId');
    if (menuId) {
      const ingredients = await prisma.menuIngredient.findMany({
        where: {
          menuId: menuId,
        },
        include: {
          ingredient: {
            select: {
              id: true,
              name: true,
              unit: true,
            },
          },
        },
      });
      return NextResponse.json(ingredients);
    }
    if (id) {
      const ingredient = await prisma.menuIngredient.findUnique({
        where: {
          id: id,
        },
      });
      return NextResponse.json(ingredient);
    }

    if (!id && !menuId) {
      return new NextResponse('No id or MenuId provided', { status: 400 });
    }
    return NextResponse.json(
      { message: 'No id or companyId provided' },
      { status: 400 }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse(`Error with Geeting Ingredient: ${error}`, {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      menuId,
      ingredientId,
      amount,
    }: { menuId: string; ingredientId: string; amount: number } = body;

    if (!menuId || !ingredientId || !amount) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const newIngredient = await prisma.menuIngredient.create({
      data: {
        menuId,
        ingredientId,
        amount,
      },
    });
    return NextResponse.json(newIngredient, { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse(`Error with Creating Ingredient: ${error}`, {
      status: 500,
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return new NextResponse('No id provided', { status: 400 });
    }
    const deletedIngredient = await prisma.menuIngredient.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json(deletedIngredient, { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse(`Error with Deleting Ingredient: ${error}`, {
      status: 500,
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      menuId,
      ingredientId,
      amount,
    }: { id: string; menuId: string; ingredientId: string; amount: number } =
      body;

    if (!id || !menuId || !ingredientId || !amount) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const updatedIngredient = await prisma.menuIngredient.update({
      where: {
        id: id,
      },
      data: {
        menuId,
        ingredientId,
        amount,
      },
    });
    return NextResponse.json(updatedIngredient, { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse(`Error with Updating Ingredient: ${error}`, {
      status: 500,
    });
  }
}
