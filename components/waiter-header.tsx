"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { OrderListSidebar } from "./orders_list_sidebar"

interface WaiterHeaderProps {
  title?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  showSearch?: boolean
  showOrderList?: boolean
  cartItemCount?: number
  onCartClick?: () => void
}

export function WaiterHeader({
  title = "Dashboard",
  breadcrumbs,
  showSearch = false,
  showOrderList = false,
  cartItemCount = 0,
  onCartClick,
}: WaiterHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Breadcrumbs or Title */}
      <div className="flex-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search menu..." className="pl-9 w-[250px] bg-gray-50 border-gray-200" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-xs">2</Badge>
        </Button>

        {/* Cart (Mobile) */}
        {showOrderList && (
          <>
            <Button variant="ghost" size="icon" className="relative xl:hidden" onClick={onCartClick}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-xs">{cartItemCount}</Badge>
              )}
            </Button>

            {/* Mobile Order List */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="xl:hidden">
                  Orders
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0">
                <OrderListSidebar onClose={() => {}} />
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </header>
  )
}
