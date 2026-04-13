import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/categories - List all categories with service count
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sort: 'asc' },
      include: {
        services: {
          where: { active: true },
          select: { id: true },
        },
      },
    });

    const categoriesWithCount = categories.map((category) => ({
      id: category.id,
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      icon: category.icon,
      image: category.image,
      sort: category.sort,
      createdAt: category.createdAt,
      serviceCount: category.services.length,
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Categories list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
