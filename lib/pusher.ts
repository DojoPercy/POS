import { OrderType } from "./types/types";

export async function sendOrderUpdate(order: any){
    console.log("Sending order update:", order, process.env.NEXT_PUBLIC_BASE_URL);
   const res = await fetch(`http://localhost:3000/api/pusher/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!res.ok) {
        throw new Error(`Error sending order update: ${res.statusText}`);
      }
      console.log("Order update sent successfully", res);
}