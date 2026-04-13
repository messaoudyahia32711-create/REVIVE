import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/complaints/[id] — admin replies or changes status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, adminReply } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (adminReply !== undefined) updateData.adminReply = adminReply;

    const complaint = await db.complaint.update({
      where: { id },
      data: updateData,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error('PATCH /api/complaints/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}

// DELETE /api/complaints/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.complaint.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/complaints/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete complaint' }, { status: 500 });
  }
}
