import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/reviews - List reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    const where: Record<string, string> = {};
    if (serviceId) where.serviceId = serviceId;

    const reviews = await db.review.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        service: {
          select: { id: true, titleAr: true, titleEn: true },
        },
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Reviews list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, serviceId, bookingId, rating, comment } = body;

    if (!userId || !serviceId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Prevent duplicate reviews by same user on same service
    const existingReview = await db.review.findFirst({
      where: { userId, serviceId },
    });
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this service' },
        { status: 409 }
      );
    }

    const review = await db.review.create({
      data: {
        userId,
        serviceId,
        bookingId: bookingId || null,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update service average rating and totalReviews
    const allReviews = await db.review.findMany({
      where: { serviceId },
      select: { rating: true },
    });

    const totalReviews = allReviews.length;
    const avgRating =
      totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await db.service.update({
      where: { id: serviceId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        totalReviews,
      },
    });

    // Update provider average rating
    const service = await db.service.findUnique({
      where: { id: serviceId },
      select: { providerId: true },
    });

    if (service) {
      const providerServices = await db.service.findMany({
        where: { providerId: service.providerId, active: true },
        select: { rating: true, totalReviews: true },
      });

      let totalRatingSum = 0;
      let totalReviewCount = 0;
      for (const s of providerServices) {
        totalRatingSum += s.rating * s.totalReviews;
        totalReviewCount += s.totalReviews;
      }

      const providerAvgRating =
        totalReviewCount > 0 ? totalRatingSum / totalReviewCount : 0;

      await db.provider.update({
        where: { id: service.providerId },
        data: {
          rating: parseFloat(providerAvgRating.toFixed(1)),
          totalReviews: totalReviewCount,
        },
      });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
