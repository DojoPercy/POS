import type React from "react"
import SiderBarWaiter from "@/components/waiter-sidebar"
import { OrderList } from "@/components/orders_list_sidebar"


export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <SiderBarWaiter />
      <div className="flex-1 overflow-auto p-4">
        <div className="flex">
          <OrderList />
          <div className="flex-1 ml-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

