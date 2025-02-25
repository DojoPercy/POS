import { type NextRequest } from "next/server";
import { getOrders } from "@/lib/order";

export const config = {
  runtime: "edge", // Enable Edge runtime for better streaming support on Vercel
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const branchId = searchParams.get("branchId");
  const waiterId = searchParams.get("waiterId");

  if (!branchId || !waiterId) {
    return new Response("Missing branchId or waiterId", { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        while (true) {
          const orders = await getOrders(undefined, branchId);
          const filteredOrders = orders.filter(
            (order: { waiterId: string }) => order.waiterId === waiterId
          );

          filteredOrders.forEach((order: any) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(order)}\n\n`)
            );
          });

          // Keep the connection alive every 5s
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        controller.close(); // Close stream on error
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*", // Ensure CORS issues are handled
    },
  });
}
