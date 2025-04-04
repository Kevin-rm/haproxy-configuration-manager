import { NextResponse } from 'next/server';
import { getLogs } from '@/lib/haproxy-service';
import { StatusCodes } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    const logs = getLogs(limit);
    return NextResponse.json(logs, { status: StatusCodes.OK });
  } catch (error) {
    console.error('Error getting HAProxy logs:', error);
    return NextResponse.json(
      { message: 'Failed to get HAProxy logs' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
