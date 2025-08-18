import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Check cache first
    const cacheKey = `company-slug-${slug}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), { status: 200 });
    }

    // Fetch company by slug (assuming slug is stored in a field, you might need to adjust this)
    // For now, we'll search by name converted to slug format
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: slug.replace(/-/g, ' '),
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: slug.replace(/-/g, ' '),
              mode: 'insensitive',
            },
          },
          {
            id: {
              equals: slug,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        logo: true,
        currency: true,
        taxRate: true,
        enableDiscount: true,
        paymentMethods: true,
        orderProcessingMode: true,
        subcriptionPlan: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Cache the result for 1 hour
    await redis.set(cacheKey, JSON.stringify(company), 'EX', 60 * 60);

    return NextResponse.json(company, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching company by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
