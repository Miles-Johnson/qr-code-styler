import { NextResponse } from 'next/server';

export async function GET() {
  // Only enable in development
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not available in production', { status: 404 });
  }

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    databaseUrl: process.env.DATABASE_URL?.replace(/\/\/.*@/, '//****:****@'),
    devDatabaseUrl: process.env.DEV_DATABASE_URL?.replace(/\/\/.*@/, '//****:****@'),
  });
}
