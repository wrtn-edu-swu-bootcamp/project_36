import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        DATABASE_URL: hasDbUrl ? '✅ Set' : '❌ Missing',
        NEXTAUTH_SECRET: hasNextAuthSecret ? '✅ Set' : '❌ Missing',
        NEXTAUTH_URL: hasNextAuthUrl ? '✅ Set' : '❌ Missing (optional for local)',
        NODE_ENV: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
