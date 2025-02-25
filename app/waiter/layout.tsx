"use client"
import type React from "react";
import SiderBarWaiter from "@/components/waiter-sidebar";
import { OrderList } from "@/components/orders_list_sidebar";
import { usePathname } from "next/navigation";
import { OrderProvider } from "@/components/order-context";
import { Provider } from "react-redux";
import { store } from '../../redux/index';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <Provider store={store}>
     <div className="flex h-screen">
      <SiderBarWaiter />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex">
         
          {(!["/waiter/order/view", "/waiter"].includes(pathname)) && <OrderList />}

          <div className={`flex-1 ${pathname !== "/view" ? "ml-4" : ""}`}>
          {children}
          </div>
        </div>
      </div>
    </div>
    </Provider>
  );
}
