import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/dashboard - Provider dashboard stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId is required' },
        { status: 400 }
      );
    }

    // Get total bookings and revenue
    const bookings = await db.booking.findMany({
      where: { providerId },
      include: {
        service: {
          select: { id: true, titleAr: true, titleEn: true, image: true },
        },
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Get total active services
    const totalServices = await db.service.count({
      where: { providerId, active: true },
    });

    // Get provider rating
    const provider = await db.provider.findUnique({
      where: { id: providerId },
      select: { rating: true },
    });
    const avgRating = provider?.rating || 0;

    // Calculate monthly data for last 6 months
    const now = new Date();
    const monthlyData: { month: string; bookings: number; revenue: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const monthLabel = monthStart.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      const monthBookings = bookings.filter((b) => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });

      monthlyData.push({
        month: monthLabel,
        bookings: monthBookings.length,
        revenue: monthBookings.reduce((sum, b) => sum + b.totalPrice, 0),
      });
    }

    // Get recent bookings (last 10)
    const recentBookings = bookings.slice(0, 10);

    // Get popular services (sorted by totalBookings)
    const popularServices = await db.service.findMany({
      where: { providerId, active: true },
      orderBy: { totalBookings: 'desc' },
      take: 5,
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        image: true,
        price: true,
        rating: true,
        totalReviews: true,
        totalBookings: true,
      },
    });

    return NextResponse.json({
      totalBookings,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalServices,
      avgRating,
      monthlyData,
      recentBookings,
      popularServices,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
