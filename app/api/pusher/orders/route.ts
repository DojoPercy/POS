// app/api/pusher/trigger-order-update/route.ts
import { NextResponse, NextRequest } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();

    await pusher.trigger('orders', 'order-update', orderData);

    return NextResponse.json({
      message: 'Pusher event triggered successfully',
    });
  } catch (error: any) {
    console.error('Error triggering Pusher event:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event' },
      { status: 500 }
    );
  }
}
