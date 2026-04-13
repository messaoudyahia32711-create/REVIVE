import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/services/[id] - Get single service with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await db.service.findUnique({
      where: { id },
      include: {
        provider: {
          include: {
            user: {
              select: { name: true, phone: true, avatar: true },
            },
          },
        },
        category: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating =
      service.reviews.length > 0
        ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
        : 0;

    return NextResponse.json({
      service: {
        ...service,
        avgRating: parseFloat(avgRating.toFixed(1)),
      },
    });
  } catch (error) {
    console.error('Service get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const {
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

    const service = await db.service.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(titleAr !== undefined && { titleAr }),
        ...(titleEn !== undefined && { titleEn }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(duration !== undefined && { duration }),
        ...(maxPeople !== undefined && { maxPeople }),
        ...(location !== undefined && { location }),
        ...(image !== undefined && { image }),
        ...(images !== undefined && { images }),
        ...(featured !== undefined && { featured }),
      },
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Soft delete (set active=false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const service = await db.service.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Service delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
