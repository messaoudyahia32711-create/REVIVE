import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/messages - Get messages for a booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      );
    }

    const messages = await db.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, senderId, content } = body;

    if (!bookingId || !senderId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const message = await db.message.create({
      data: {
        bookingId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Message create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
