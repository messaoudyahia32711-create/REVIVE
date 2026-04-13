import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/stats - Public platform statistics (real data only)
export async function GET() {
  try {
    const [
      totalUsers,
      totalProviders,
      totalServices,
      totalBookings,
      totalReviews,
      totalCategories,
      completedBookings,
      avgRating,
      topWilayas,
      recentReviews,
    ] = await Promise.all([
      // Total registered users (patients only)
      db.user.count({ where: { role: 'user' } }),
      // Total verified providers
      db.provider.count({ where: { verified: true } }),
      // Total active services
      db.service.count({ where: { active: true } }),
      // Total bookings
      db.booking.count(),
      // Total reviews
      db.review.count(),
      // Total categories
      db.category.count(),
      // Completed bookings
      db.booking.count({ where: { status: 'completed' } }),
      // Average service rating
      db.service.aggregate({
        where: { active: true },
        _avg: { rating: true },
      }),
      // Top wilayas by service count
      db.service.groupBy({
        by: ['wilaya'],
        where: { active: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      // Recent reviews with user and service info
      db.review.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          service: { select: { id: true, titleAr: true, titleEn: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalProviders,
      totalServices,
      totalBookings,
      totalReviews,
      totalCategories,
      completedBookings,
      avgRating: avgRating._avg.rating ? parseFloat(avgRating._avg.rating.toFixed(1)) : 0,
      topWilayas: topWilayas.map((w) => ({ wilaya: w.wilaya, count: w._count.id })),
      recentReviews,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
