import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, confirmed, cancelled, or completed' },
        { status: 400 }
      );
    }

    const existing = await db.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = await db.booking.update({
      where: { id },
      data: { status },
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

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
