import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import redis from '@/lib/redis/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const categoryId = searchParams.get('categoryId') || '';
    const cachedKey = companyId
      ? `companyCategory-${companyId}`
      : `category-${categoryId}`;
    const cachedData = await redis.get(cachedKey);

    if (cachedData) {
      console.log('cachedData Category', cachedData);

      return NextResponse.json(JSON.parse(cachedData), { status: 200 });
    }
    if (companyId) {
      const category = await prisma.menuCategory.findMany({
        where: { companyId: companyId },
      });
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
      await redis.set(cachedKey, JSON.stringify(category), 'EX', 60 * 60);
      return NextResponse.json(category, { status: 200 });
    } else if (categoryId) {
      const categories = await prisma.menuCategory.findMany({
        where: { id: categoryId },
      });
      if (!categories) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
      await redis.set(cachedKey, JSON.stringify(categories), 'EX', 60 * 60);
      return NextResponse.json(categories, { status: 200 });
    }
    const categories = await prisma.category.findMany();

    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, companyId, description } = await req.json();
    const newCategory = await prisma.menuCategory.create({
      data: {
        name,
        companyId: companyId || '',
        description,
      },
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, description, companyId } = await req.json();
    const updatedCategory = await prisma.menuCategory.update({
      where: { id },
      data: {
        name,
        description,
        companyId: companyId || '',
      },
    });
    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const deletedCategory = await prisma.menuCategory.delete({
      where: { id },
    });
    return NextResponse.json(deletedCategory, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
