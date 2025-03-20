"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Loader2, EyeOff, Eye } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, updateOrderLocally } from "@/redux/orderSlice";
import type { RootState, AppDispatch } from "../redux/index"; // Import proper store types
import type { Order } from "@prisma/client";
import { jwtDecode } from "jwt-decode";
import { OrderType } from "@/lib/types/types";
import { OrderStatus } from "@/lib/enums/enums";
import Pusher from "pusher-js";

interface DecodedToken {
  role: string;
  branchId?: string;
  userId?: string;
  [key: string]: any;
}

const getStatusColor = (isCompleted: boolean, isCheckedOut: boolean, isAccepted: boolean) => {
  if ( isCheckedOut) return "bg-green-100 text-green-800";
  if (isCompleted ) return "bg-yellow-100 text-yellow-800";
  if (!isAccepted) return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
};

const getStatusText = (isCompleted: boolean, isCheckedOut: boolean, isAccepted: boolean) => {
  if (isCheckedOut) return "Completed & Checked Out";
  if (isCompleted) return "Completed, Not Checked Out";
  if (isAccepted) return "Order Processing..";
  return "In Progress";
};


const OrderItem = ({
  order,
  onDelete,
}: {
  order: OrderType;
  onDelete: (id: string) => void;
}) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <div className="flex flex-col space-y-1 flex-grow">
      <span className="font-medium">{order.orderNumber}</span>
      <Badge
        variant="outline"
        className={`${getStatusColor(order.orderStatus === OrderStatus.COMPLETED, order.orderStatus === OrderStatus.PAID,order.orderStatus === OrderStatus.PROCESSING )} text-xs font-normal`}
      >
        {getStatusText(order.orderStatus === OrderStatus.COMPLETED, order.orderStatus === OrderStatus.PAID, order.orderStatus === OrderStatus.PROCESSING)}
      </Badge>
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(order.id!);
      }}
      className="text-gray-500 hover:text-gray-700 ml-2"
    >
      <Trash2 className="h-4 w-4 text-red-500 " />
      <span className="sr-only">Delete order</span>
    </Button>
  </div>
);

export function OrderList() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

 
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      return;
    }
    const decodedToken: DecodedToken = jwtDecode(token);
    if(decodedToken){
      dispatch(fetchOrders(decodedToken.userId ?? ""));}
   

    }
  , [dispatch]);
  useEffect(() => {
    Pusher.logToConsole = true;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap2",
    });

    const channel = pusher.subscribe("orders");

    channel.bind("order-update", (data: any) => {
      console.log("New order update received:", data);
     
      dispatch(updateOrderLocally(data));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [dispatch]);



  const filteredData = Array.isArray(orders)
  ? orders
      .filter((order: OrderType) =>
        showCompleted ? true : !(order.orderStatus === OrderStatus.PAID)
      )
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
  : [];


  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(orderId);
    console.log(`Navigating to order ${orderId}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    window.location.href = `/waiter/order/`;
  };

  const toggleShowCompleted = () => {
    setShowCompleted(!showCompleted);
  };

  return (
    <div className="border border-gray-200 rounded-lg w-80">
      <div className="p-4 text-xl font-semibold border-b border-gray-200 flex justify-between items-center">
        <span>Orders</span>
        <Link href="/waiter/order/new">
          <Button variant="outline" size="sm">
            Add New Order
          </Button>
         
        </Link>
        <Button
  variant="outline"
  size="sm"
  onClick={toggleShowCompleted}
  className="flex items-center space-x-2"
>
  {showCompleted ? (
    <>
      <EyeOff className="h-4 w-4" />
     
    </>
  ) : (
    <>
      <Eye className="h-4 w-4" />
      
    </>
  )}
</Button>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="py-2">
            {filteredData.length === 0 ? (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
    <p className="text-gray-500 text-lg">No orders available.</p>
    <Link href="/waiter/order/new">
      <Button variant="outline">Create Your First Order</Button>
    </Link>
  </div>
) : (
  filteredData.map((order : OrderType) => (
    <div
      key={order.id}
      onClick={() => handleOrderClick(order.id!)}
      className={`cursor-pointer ${
        selectedOrder === order.id ? "bg-gray-100" : ""
      }`}
    >
      <Link href={`/waiter/order/${order.id}`}>
        <OrderItem order={order} onDelete={handleDeleteOrder} />
      </Link>
    </div>
  
  ))
)}

            
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
