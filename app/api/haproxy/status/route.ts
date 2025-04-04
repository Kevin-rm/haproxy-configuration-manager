import { NextResponse } from 'next/server';
import { getServiceStatus } from '@/lib/haproxy-service';
import { StatusCodes } from '@/lib/constants';

export async function GET() {
  try {
    const status = getServiceStatus();
    return NextResponse.json(status, { status: StatusCodes.OK });
  } catch (error) {
    console.error('Error getting HAProxy status:', error);
    return NextResponse.json(
      { message: 'Failed to get HAProxy service status' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
