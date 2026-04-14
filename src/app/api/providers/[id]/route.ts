import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/providers/[id] - Get provider profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    const provider = await db.provider.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        category: true,
      },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json({ provider });
  } catch (error) {
    console.error('Provider fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/providers/[id] - Update provider profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });

    const body = await request.json();
    const { categoryId, newCategoryName, companyName, description, wilaya, website, phone } = body;

    let finalCategoryId = categoryId;

    // Handle dynamically creating a new category if "other" is selected
    if (categoryId === 'other' && newCategoryName) {
      // Check if it already exists
      let existingCategory = await db.category.findFirst({
        where: { OR: [{ nameAr: newCategoryName }, { nameEn: newCategoryName }] }
      });

      if (!existingCategory) {
        existingCategory = await db.category.create({
          data: {
            nameAr: newCategoryName,
            nameEn: newCategoryName,
            icon: 'Plus', // Default icon for dynamically created categories
          }
        });
      }
      finalCategoryId = existingCategory.id;
    }

    const providerFieldsToUpdate: any = {};
    if (finalCategoryId && finalCategoryId !== 'other') providerFieldsToUpdate.categoryId = finalCategoryId;
    if (companyName) providerFieldsToUpdate.companyName = companyName;
    if (description !== undefined) providerFieldsToUpdate.description = description;
    if (wilaya !== undefined) providerFieldsToUpdate.wilaya = wilaya;
    if (website !== undefined) providerFieldsToUpdate.website = website;

    const provider = await db.provider.update({
      where: { id },
      data: providerFieldsToUpdate,
      include: {
        user: true,
      }
    });

    // Optionally update user phone if provided
    if (phone !== undefined && provider.user) {
      await db.user.update({
        where: { id: provider.userId },
        data: { phone },
      });
    }

    return NextResponse.json({ provider });
  } catch (error) {
    console.error('Provider update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

