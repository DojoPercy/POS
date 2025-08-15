import { type NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';

// GET - Get unread notification count for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const count = await NotificationService.getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return NextResponse.json(
      { error: 'Failed to get unread count' },
      { status: 500 }
    );
  }
}
