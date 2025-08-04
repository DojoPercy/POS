"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2,
  ChefHat,
  ClipboardList,
  LogOut,
  MenuIcon,
  Package,
  Settings,
  User,
  Users,
  BarChart3,
  Bell,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserFromToken, logoutUser, selectUser } from "@/redux/authSlice"
import { getCompanyDetails } from "@/redux/companySlice"
import type { RootState } from "@/redux"
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
} from "@/components/ui/sidebar"
import Image from "next/image"

// Navigation items configuration
const mainNavItems = [{ icon: BarChart3, text: "Dashboard", href: "/owner/dashboard" }]

const businessNavItems = [
  { icon: MenuIcon, text: "Menu", href: "/owner/menu" },
  { icon: ChefHat, text: "Ingredients", href: "/owner/ingredient" },
  { icon: Building2, text: "Branches", href: "/owner/branches" },
  { icon: ClipboardList, text: "Orders", href: "/owner/orders" },
  { icon: Package, text: "Inventory", href: "/owner/inventory" },
  { icon: Users, text: "Staff", href: "/owner/staffs" },
  { icon: Bell, text: "Notifications", href: "/owner/notifications" },
  { icon: User, text: "Profile", href: "/owner/profile" },
]

const bottomNavItems = [{ icon: Settings, text: "Settings", href: "/owner/settings" }]

export function SideBarOwner() {
  const [hasCompanies, setHasCompanies] = useState(false)
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const router = useRouter()
  const pathname = usePathname()
  const { company } = useSelector((state: RootState) => state.company)

  useEffect(() => {
    if (user?.companyId) {
      Promise.all([dispatch(fetchUserFromToken()), dispatch(getCompanyDetails(user.companyId))]).finally(() => {
        setHasCompanies(true)
      })
    }
  }, [dispatch, user?.companyId])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/login")
  }

  // Helper function to check if a route is active
  const isActive = (href: string) => {
    if (href === "/owner/dashboard") return pathname === "/owner/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-4 py-4">
          {/* ChainPOS Logo */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold text-slate-900">ChainPOS</span>
            <span className="text-xs text-slate-500">Management Platform</span>
          </div>
        </div>

        {/* Company Info - Hidden when collapsed */}
        <div className="mx-4 mb-4 rounded-lg bg-slate-50 p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            
              <Image src={company?.logo || "/default-logo.png"} alt="Company Logo" width={72} height={72} className="rounded-full" />
              
            
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">{company?.name || "Restaurant"}</span>
              <span className="text-xs text-slate-500">Owner Dashboard</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        {/* Main navigation */}
        <div className="px-3 py-2">
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.text}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={item.text}
                  className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:border-blue-200 hover:bg-slate-50"
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.text}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <SidebarSeparator className="mx-3 bg-slate-200" />

        {/* Business management navigation */}
        {hasCompanies && (
          <div className="px-3 py-2">
            <div className="mb-2 px-2 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Business Management</span>
            </div>
            <SidebarMenu>
              {businessNavItems.map((item) => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.text}
                    className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:border-blue-200 hover:bg-slate-50"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.text}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 bg-white">
        <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.text}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.text}
                className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 hover:bg-slate-50"
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.text}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default SideBarOwner
