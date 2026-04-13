import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/auth - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name, phone, role, companyName, description, location } = body;

    // Login
    if (action === 'login' || (!action && email && password && !name)) {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const user = await db.user.findUnique({
        where: { email },
        include: { provider: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Demo mode: plain text password check
      if (user.password !== password) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({
        user: {
          ...userWithoutPassword,
          providerId: user.provider?.id || null,
        },
      });
    }

    // Register
    if (action === 'register' || (!action && name)) {
      if (!email || !password || !name) {
        return NextResponse.json(
          { error: 'Email, password, and name are required' },
          { status: 400 }
        );
      }

      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }

      const user = await db.user.create({
        data: {
          email,
          password, // Demo mode: storing plain text
          name,
          phone: phone || null,
          role: role || 'user',
          provider: role === 'provider'
            ? {
                create: {
                  companyName: companyName || name,
                  description: description || null,
                  location: location || null,
                },
              }
            : undefined,
        },
        include: { provider: true },
      });

      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(
        {
          user: {
            ...userWithoutPassword,
            providerId: user.provider?.id || null,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "login" or "register".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
