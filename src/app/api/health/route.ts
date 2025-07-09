import prisma from '@/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json(
      {
        status: 'healthy',
        message: 'Next.js app is running',
        database: 'connected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (error) {
    const isDbError = error instanceof Error && 
      error.message.toLowerCase().includes('database');
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Health check failed',
        database: isDbError ? 'disconnected' : 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
