"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, ClipboardList, FilePlus, User, Settings, LogOut, ChefHat, Receipt } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser, selectUser, fetchUserFromToken } from "@/redux/authSlice"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const mainNavItems = [{ icon: Home, text: "Dashboard", href: "/waiter" }]

const orderNavItems = [
  { icon: FilePlus, text: "New Order", href: "/waiter/order/new" },
  { icon: ClipboardList, text: "View Orders", href: "/waiter/order/view" },
]



export function WaiterSidebar() {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const user = useSelector(selectUser)

  useEffect(() => {
    dispatch(fetchUserFromToken())
  }, [dispatch])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/login")
  }

  const isActive = (href: string) => {
    if (href === "/waiter") return pathname === "/waiter"
    return pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r">
      <SidebarHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
            <ChefHat className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">Waiter Portal</span>
            <span className="text-xs text-gray-500">Order Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.text}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.text}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Order Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Order Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {orderNavItems.map((item) => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.text}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.text}</span>
                      {item.text === "View Orders" && (
                        <Badge variant="secondary" className="ml-auto">
                          
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Account */}
        
      </SidebarContent>

      <SidebarFooter className="border-t bg-gray-50 p-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
            <AvatarFallback className="bg-blue-100 text-blue-600">{user?.firstName?.charAt(0) || "W"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">Waiter</p>
          </div>
        </div>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out? Any unsaved changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
