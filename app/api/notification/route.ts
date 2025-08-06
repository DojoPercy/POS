import { type NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';
import { NotificationType, NotificationPriority } from '@prisma/client';

// GET - Fetch notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    const notifications =
      await NotificationService.getNotificationsForUser(userId);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 },
    );
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      type,
      priority,
      companyId,
      branchId,
      userId,
      createdBy,
      expiresAt,
    } = body;

    // Validate required fields
    if (!title || !message || !type || !createdBy) {
      return NextResponse.json(
        { error: 'Title, message, type, and createdBy are required' },
        { status: 400 },
      );
    }

    // Validate notification type and corresponding IDs
    if (type === NotificationType.COMPANY && !companyId) {
      return NextResponse.json(
        { error: 'Company ID is required for company notifications' },
        { status: 400 },
      );
    }

    if (type === NotificationType.BRANCH && !branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required for branch notifications' },
        { status: 400 },
      );
    }

    if (type === NotificationType.USER && !userId) {
      return NextResponse.json(
        { error: 'User ID is required for user notifications' },
        { status: 400 },
      );
    }

    const notification = await NotificationService.createNotification({
      title,
      message,
      type,
      priority: priority || NotificationPriority.MEDIUM,
      companyId,
      branchId,
      userId,
      createdBy,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: notification,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 },
    );
  }
}
