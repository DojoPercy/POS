"use client"

import { useEffect } from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Building2, ChefHat, ClipboardList, Home, LogOut, MenuIcon, Package, Settings, User, Users } from "lucide-react"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Navigation items configuration
const mainNavItems = [{ icon: Home, text: "Home", href: "/" }]

const businessNavItems = [
  { icon: MenuIcon, text: "Menu", href: "/owner/menu" },
  { icon: ChefHat, text: "Ingredient", href: "/owner/ingredient" },
  { icon: Building2, text: "Branches", href: "/owner/branches" },
  { icon: ClipboardList, text: "Orders", href: "/owner/orders" },
   {icon: Package, text: "Inventory", href: "/owner/inventory"},
  { icon: Users, text: "Staffs", href: "/owner/staffs" },
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
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="flex justify-center py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {company?.name?.charAt(0) || "R"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{company?.name || "Restaurant"}</span>
            <span className="text-xs text-muted-foreground">Owner Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main navigation */}
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.text}>
              <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.text}>
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.text}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator />

        {/* Business management navigation */}
        {hasCompanies && (
          <SidebarMenu>
            {businessNavItems.map((item) => (
              <SidebarMenuItem key={item.text}>
                <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.text}>
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.text}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>

      <SidebarFooter>
        {/* Settings and logout */}
        <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.text}>
              <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.text}>
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.text}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export default SideBarOwner
