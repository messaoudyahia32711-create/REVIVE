import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET /api/services - List services with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const providerId = searchParams.get('providerId');
    const sort = searchParams.get('sort');

    // Build where clause
    const where: Prisma.ServiceWhereInput = { active: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (search) {
      where.OR = [
        { titleAr: { contains: search } },
        { titleEn: { contains: search } },
        { descriptionAr: { contains: search } },
        { descriptionEn: { contains: search } },
        { location: { contains: search } },
      ];
    }

    // Build order clause
    let orderBy: Prisma.ServiceOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const services = await db.service.findMany({
      where,
      orderBy,
      include: {
        provider: {
          select: { id: true, companyName: true, rating: true, verified: true },
        },
        category: {
          select: { id: true, nameAr: true, nameEn: true, icon: true },
        },
        reviews: {
          select: { id: true },
        },
      },
    });

    const servicesWithReviewCount = services.map((service) => ({
      id: service.id,
      providerId: service.providerId,
      categoryId: service.categoryId,
      titleAr: service.titleAr,
      titleEn: service.titleEn,
      descriptionAr: service.descriptionAr,
      descriptionEn: service.descriptionEn,
      price: service.price,
      currency: service.currency,
      duration: service.duration,
      maxPeople: service.maxPeople,
      location: service.location,
      image: service.image,
      images: service.images,
      rating: service.rating,
      totalReviews: service.totalReviews,
      totalBookings: service.totalBookings,
      featured: service.featured,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      provider: service.provider,
      category: service.category,
      reviewCount: service.reviews.length,
    }));

    return NextResponse.json({ services: servicesWithReviewCount });
  } catch (error) {
    console.error('Services list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/services - Create service (provider only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      providerId,
      categoryId,
      titleAr,
      titleEn,
      descriptionAr,
      descriptionEn,
      price,
      duration,
      maxPeople,
      location,
      image,
      images,
      featured,
    } = body;

    if (!providerId || !categoryId || !titleAr || !titleEn || !descriptionAr || !descriptionEn || !price || !duration || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const service = await db.service.create({
      data: {
        providerId,
        categoryId,
        titleAr,
        titleEn,
        descriptionAr,
        descriptionEn,
        price: parseFloat(price),
        duration,
        maxPeople: maxPeople || 1,
        location,
        image: image || null,
        images: images || '[]',
        featured: featured || false,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Service create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
