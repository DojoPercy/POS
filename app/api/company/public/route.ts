import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis/redis';

export async function GET(req: NextRequest) {
  try {
    // Check cache first
    const cacheKey = 'public-companies';
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), { status: 200 });
    }

    // Fetch all active companies that have branches
    const companies = await prisma.company.findMany({
      where: {
        isActivated: true,
        branches: {
          some: {
            status: 'active',
          },
        },
      },
      select: {
        id: true,
        name: true,
        logo: true,
        city: true,
        country: true,
        isActivated: true,
        createdAt: true,
        branches: {
          where: {
            status: 'active',
          },
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter companies that have at least one active branch
    const activeCompanies = companies.filter(company => company.branches.length > 0);

    // Cache the result for 30 minutes
    await redis.set(cacheKey, JSON.stringify(activeCompanies), 'EX', 30 * 60);

    return NextResponse.json(activeCompanies, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching public companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
