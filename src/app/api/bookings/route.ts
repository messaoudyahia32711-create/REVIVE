import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bookings - List bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const providerId = searchParams.get('providerId');

    const where: Record<string, string> = {};
    if (userId) where.userId = userId;
    if (providerId) where.providerId = providerId;

    if (Object.keys(where).length === 0) {
      return NextResponse.json(
        { error: 'Provide userId or providerId' },
        { status: 400 }
      );
    }

    const bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            price: true,
            duration: true,
            image: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Bookings list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, serviceId, providerId, bookingDate, numberOfPeople, notes } = body;

    if (!userId || !serviceId || !providerId || !bookingDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch service to get price
    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const people = numberOfPeople || 1;
    const totalPrice = service.price * people;

    const booking = await db.booking.create({
      data: {
        userId,
        serviceId,
        providerId,
        bookingDate: new Date(bookingDate),
        numberOfPeople: people,
        totalPrice,
        notes: notes || null,
      },
      include: {
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            price: true,
            duration: true,
            image: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
    });

    // Increment service total bookings
    await db.service.update({
      where: { id: serviceId },
      data: { totalBookings: { increment: 1 } },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Booking create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
