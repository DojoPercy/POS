"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, ClipboardList, Users, CreditCard, User, Settings, LogOut, Building2, BarChart3, Package } from "lucide-react"
import { jwtDecode } from "jwt-decode"
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
import { getBranchById } from "@/lib/branch"

interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  [key: string]: any
}

interface Branch {
  id: string
  name: string
  address: string
  city: string
  status: "active" | "inactive"
}

const mainNavItems = [{ icon: Home, text: "Dashboard", href: "/branch" }]

const managementNavItems = [
  { icon: ClipboardList, text: "Orders", href: "/branch/orders" },
  { icon: CreditCard, text: "Expenses", href: "/branch/expenses" },
  { icon: Users, text: "Staff", href: "/branch/staffs" },
  {icon: Package, text: "Inventory", href: "/branch/inventory"},
]

const accountNavItems = [
  { icon: User, text: "Profile", href: "/branch" },
  { icon: Settings, text: "Settings", href: "/branch/settings" },
]

export function BranchSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode(token) as DecodedToken
        setDecodedToken(decoded)

        // Fetch branch details
        if (decoded.branchId) {
          getBranchById(decoded.branchId).then((branchData) => {
            setBranch(branchData)
            setIsLoading(false)
          })
        }
      } catch (error) {
        console.error("Error decoding token:", error)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogout = async () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const isActive = (href: string) => {
    if (href === "/branch") return pathname === "/branch"
    return pathname.startsWith(href)
  }

  // Don't show sidebar for owners
  if (decodedToken?.role === "owner") {
    return null
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r">
      <SidebarHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">
              {isLoading ? "Loading..." : branch?.name || "Branch Portal"}
            </span>
            <span className="text-xs text-gray-500">Management Dashboard</span>
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
                    <Link href={`${item.href}/${branch?.id}`} className="flex items-center gap-3">
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

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNavItems.map((item) => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.text}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.text}</span>
                      {item.text === "Orders" && (
                        <Badge variant="secondary" className="ml-auto">
                          12
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
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavItems.map((item) => (
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
      </SidebarContent>

      <SidebarFooter className="border-t bg-gray-50 p-4">
        {/* Branch Status */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{branch?.name || "Branch Name"}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${branch?.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
              <p className="text-xs text-gray-500 capitalize">{branch?.status || "Unknown"}</p>
            </div>
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
