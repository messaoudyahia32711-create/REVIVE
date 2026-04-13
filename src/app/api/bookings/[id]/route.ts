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
    const { status, postponedDate, rejectionReason } = body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'postponed', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, confirmed, cancelled, completed, postponed, or rejected' },
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

    // Validate status transitions
    const invalidTransitions: Record<string, string[]> = {
      cancelled: ['confirmed', 'completed'],
      completed: ['confirmed', 'cancelled', 'pending'],
      rejected: ['confirmed', 'completed'],
    };
    if (invalidTransitions[existing.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot change status from '${existing.status}' to '${status}'` },
        { status: 400 }
      );
    }

    // For postponed status, postponedDate is required
    if (status === 'postponed' && !postponedDate) {
      return NextResponse.json(
        { error: 'postponedDate is required when status is "postponed"' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = { status };
    if (status === 'postponed') {
      updateData.bookingDate = new Date(postponedDate);
    }
    if (status === 'rejected' && rejectionReason) {
      updateData.notes = `[REJECTED] ${rejectionReason}`;
    }

    const booking = await db.booking.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ booking, message: `Booking status updated to ${status}` });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
