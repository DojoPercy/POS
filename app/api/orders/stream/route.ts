import { type NextRequest, NextResponse } from "next/server"
import { getOrders } from "@/lib/order"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const branchId = searchParams.get("branchId")
  const waiterId = searchParams.get("waiterId")

  if (!branchId || !waiterId) {
    return new NextResponse("Missing branchId or waiterId", { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      while (true) {
        try {
          const orders = await getOrders(undefined, branchId)
          const filteredOrders = orders.filter((order: { waiterId: string }) => order.waiterId === waiterId)

          filteredOrders.forEach((order: any) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(order)}\n\n`))
          })

          await new Promise((resolve) => setTimeout(resolve, 2000)) // Poll every 5 seconds
        } catch (error) {
          console.error("Error fetching orders:", error)
          controller.error(error)
        }
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

