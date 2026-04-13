import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/complaints — list all complaints (admin) or user's complaints
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (status && status !== 'all') where.status = status;

    const complaints = await db.complaint.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('GET /api/complaints error:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

// POST /api/complaints — user submits a complaint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subject, content } = body;

    if (!userId || !subject || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const complaint = await db.complaint.create({
      data: { userId, subject, content },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ complaint }, { status: 201 });
  } catch (error) {
    console.error('POST /api/complaints error:', error);
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}
