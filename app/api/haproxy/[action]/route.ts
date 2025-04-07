import { NextResponse } from 'next/server';
import { 
  startService, 
  stopService, 
  restartService, 
  reloadService, 
  validateConfig 
} from '@/lib/haproxy-service';
import { StatusCodes } from '@/lib/constants';

export async function POST(
  request: Request,
  { params }: { params: { action: string } }
) {
  const { action } = params;
  
  try {
    switch (action) {
      case 'start':
        startService();
        return NextResponse.json({ message: 'Service started successfully' }, { status: StatusCodes.OK });
      
      case 'stop':
        stopService();
        return NextResponse.json({ message: 'Service stopped successfully' }, { status: StatusCodes.OK });
      
      case 'restart':
        restartService();
        return NextResponse.json({ message: 'Service restarted successfully' }, { status: StatusCodes.OK });
      
      case 'reload':
        reloadService();
        return NextResponse.json({ message: 'Configuration reloaded successfully' }, { status: StatusCodes.OK });
      
      case 'validate':
        const validationResult = validateConfig();
        return NextResponse.json(validationResult, { status: StatusCodes.OK });
      
      default:
        return NextResponse.json(
          { message: `Unknown action: ${action}` },
          { status: StatusCodes.BAD_REQUEST }
        );
    }
  } catch (error) {
    console.error(`Error executing action ${action}:`, error);
    const errorMessage = error instanceof Error ? error.message : `Failed to execute ${action}`;
    
    return NextResponse.json(
      { message: errorMessage },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
