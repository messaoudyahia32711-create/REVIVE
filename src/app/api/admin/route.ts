import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, providerId, verified, userId, active } = body;

    if (action === 'verify' && providerId) {
      const provider = await db.provider.update({
        where: { id: providerId },
        data: { verified: !!verified },
      });
      return NextResponse.json({ provider });
    }

    if (action === 'toggleUserActive' && userId) {
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { active: !!active },
      });
      return NextResponse.json({ user: updatedUser });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [
      totalUsers, totalProviders, totalServices, totalBookings, totalReviews, totalCategories,
      pendingBookings, completedBookings, cancelledBookings, activeServices,
      openComplaints, inactiveUsers, unverifiedProviders,
    ] = await Promise.all([
      db.user.count(),
      db.provider.count(),
      db.service.count({ where: { active: true } }),
      db.booking.count(),
      db.review.count(),
      db.category.count(),
      db.booking.count({ where: { status: 'pending' } }),
      db.booking.count({ where: { status: 'completed' } }),
      db.booking.count({ where: { status: 'cancelled' } }),
      db.service.count({ where: { active: true } }),
      db.complaint.count({ where: { status: 'open' } }),
      db.user.count({ where: { active: false } }),
      db.provider.count({ where: { verified: false } }),
    ]);

    // Calculate monthly data for last 6 months using Prisma (database-agnostic)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentBookingsData = await db.booking.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, totalPrice: true },
    });

    const monthlyMap = new Map<string, { bookings: number; revenue: number }>();
    for (const b of recentBookingsData) {
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key) || { bookings: 0, revenue: 0 };
      entry.bookings += 1;
      entry.revenue += b.totalPrice;
      monthlyMap.set(key, entry);
    }

    const monthlyBookings = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, bookings: data.bookings, revenue: data.revenue }));

    const allBookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' }, take: 10,
      include: {
        service: { select: { id: true, titleAr: true, titleEn: true, image: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const totalRevenue = await db.booking.aggregate({ where: { status: 'completed' }, _sum: { totalPrice: true } });

    const allProviders = await db.provider.findMany({
      include: {
        user: { select: { name: true, email: true, active: true } },
        _count: { select: { services: true, bookings: true } },
      },
      orderBy: { createdAt: 'desc' }, take: 20,
    });

    const allUsers = await db.user.findMany({
      orderBy: { createdAt: 'desc' }, take: 20,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    const allServices = await db.service.findMany({
      orderBy: { createdAt: 'desc' }, take: 10,
      include: { provider: { select: { companyName: true } }, category: { select: { nameAr: true, nameEn: true } } },
    });

    return NextResponse.json({
      totalUsers, totalProviders, totalServices: activeServices, totalBookings, totalReviews, totalCategories,
      pendingBookings, completedBookings, cancelledBookings,
      openComplaints, inactiveUsers, unverifiedProviders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      monthlyData: monthlyBookings,
      recentBookings: allBookings, recentProviders: allProviders, recentUsers: allUsers, recentServices: allServices,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
