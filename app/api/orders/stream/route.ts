import { type NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/order';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const waiterId = searchParams.get('waiterId');

  if (!waiterId) {
    return new NextResponse('Missing waiterId', { status: 400 });
  }

  const encoder = new TextEncoder();

  async function* orderStream() {
    while (true) {
      try {
        const orders = await getOrders(undefined, undefined, waiterId!);
        yield encoder.encode(`data: ${JSON.stringify(orders)}\n\n`);
      } catch (error) {
        console.error('Error fetchingssd orders:', error);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of orderStream()) {
        controller.enqueue(chunk);
      }
    },
    cancel() {
      console.log('SSE connection closed by client');
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
