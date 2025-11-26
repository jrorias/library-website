// app/api/version/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  return NextResponse.json(
    { 
      buildId: process.env.BUILD_ID || process.env.NEXT_BUILD_ID || Date.now().toString(),
      timestamp: Date.now(),
    },
    { headers }
  );
}