"use client"
import type React from "react"
import SiderBarWaiter from "@/components/waiter-sidebar"
import { OrderList } from "@/components/orders_list_sidebar"
import { usePathname } from "next/navigation"
import { Provider } from "react-redux"
import { store } from "../../redux/index"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orderListOpen, setOrderListOpen] = useState(false)

  const shouldShowOrderList = !["/waiter/order/view", "/waiter"].includes(pathname)

  return (
    <Provider store={store}>
      {isMobile ? (
        // Mobile Layout
        <div className="flex flex-col h-screen">
          {/* Mobile Header with menu button */}
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-medium">Waiter Dashboard</h1>
            {shouldShowOrderList && (
              <Button variant="outline" size="sm" onClick={() => setOrderListOpen(true)}>
                Orders
              </Button>
            )}
          </div>

          {/* Mobile Sidebar */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0">
              <div className="flex justify-end p-4">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SiderBarWaiter />
            </SheetContent>
          </Sheet>

          {/* Mobile Order List */}
          {shouldShowOrderList && (
            <Sheet open={orderListOpen} onOpenChange={setOrderListOpen}>
              <SheetContent side="right" className="p-0 w-full sm:max-w-md">
                <OrderList onClose={() => setOrderListOpen(false)} />
              </SheetContent>
            </Sheet>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-4">{children}</div>
        </div>
      ) : (
        // Desktop Layout
        <div className="flex h-screen">
          <SiderBarWaiter />
          <div className="flex-1 overflow-auto p-4">
            <div className="flex h-full">
              {shouldShowOrderList && <OrderList />}
              <div className={`flex-1 ${shouldShowOrderList ? "ml-4" : ""}`}>{children}</div>
            </div>
          </div>
        </div>
      )}
    </Provider>
  )
}
