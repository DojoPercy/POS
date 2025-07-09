"use client"

import { useEffect, useState } from "react" // Import useState for local state
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, ClipboardList, FilePlus, User, Settings, LogOut, Building2, ChevronRight } from "lucide-react" // Added ChevronRight for a consistent look with breadcrumbs
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
import Image from "next/image"
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
import { RootState } from "@/redux"
import { getCompanyDetails } from "@/redux/companySlice"

// --- Navigation Item Definitions ---
const mainNavItems = [{ icon: Home, text: "Dashboard", href: "/waiter" }]

const orderNavItems = [
  { icon: FilePlus, text: "New Order", href: "/waiter/order/new" },
  { icon: ClipboardList, text: "View Orders", href: "/waiter/order/view" },
]

const accountNavItems = [ // New section for account-related items
  { icon: Settings, text: "Settings", href: "/waiter/settings" },
  { icon: User, text: "Profile", href: "/waiter/profile" }, // Assuming a profile page
]

export function WaiterSidebar() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const router = useRouter()
  const pathname = usePathname()
  const { company } = useSelector((state: RootState) => state.company)

  // Local state to track if company details have been fetched
  // This replaces the global setHasCompanies function, which was causing an error
  const [hasCompanyDetails, setHasCompanyDetails] = useState(false)

  // Fetch user token on initial load
  useEffect(() => {
    dispatch(fetchUserFromToken())
  }, [dispatch])

  // Fetch company details once user.companyId is available
  useEffect(() => {
    if (user?.companyId && !hasCompanyDetails) { // Only fetch if companyId exists and hasn't been fetched yet
      dispatch(getCompanyDetails(user.companyId) as any) // Type assertion if TS complains about PromiseLike
        .then(() => {
          setHasCompanyDetails(true) // Mark as fetched
        })
        .catch((error: any) => {
          console.error("Failed to fetch company details:", error)
          setHasCompanyDetails(true) // Still set true to prevent re-fetching on error
        })
    }
  }, [dispatch, user?.companyId, hasCompanyDetails])

  const handleLogout = async () => {
    await dispatch(logoutUser() as any) // Type assertion if TS complains
    router.push("/login")
  }

  const isActive = (href: string) => {
    // For exact match on dashboard, otherwise check if path starts with href
    if (href === "/waiter") {
      return pathname === "/waiter"
    }
    return pathname.startsWith(href)
  }

  // Determine user initials for AvatarFallback
  const userInitials = user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "W"

  return (
    <Sidebar collapsible="offcanvas" className="border-r bg-white flex flex-col h-full"> {/* Added flex and h-full for layout */}
      {/* Sidebar Header: Logo and Company Info */}
      <SidebarHeader className="border-b bg-gradient-to-br from-blue-50 to-indigo-100 p-4 shrink-0"> {/* Added shrink-0 */}
        {/* ChainPOS Branding */}
        <div className="flex items-center gap-3 py-2 px-2"> {/* Adjusted padding */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-md"> {/* Added shadow */}
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold text-slate-900 leading-none">ChainPOS</span> {/* leading-none for tighter text */}
            <span className="text-xs text-slate-500 mt-1">Waiter POS System</span> {/* mt-1 for slight separation */}
          </div>
        </div>

        {/* Restaurant/Company Info Card */}
        <div className="mx-2 my-4 rounded-lg bg-white p-3 shadow-sm border border-gray-100 group-data-[collapsible=icon]:hidden"> {/* Adjusted mx, my, added shadow and border, changed bg */}
          <div className="flex items-center gap-3"> {/* Increased gap for better spacing */}
            <Image
              src={company?.logo || "/default-logo.png"}
              alt="Company Logo"
              width={48} // Smaller image size for better fit in the card
              height={48}
              className="rounded-full object-cover border border-gray-200" // Added object-cover and border
            />
            <div className="flex flex-col flex-1 min-w-0"> {/* flex-1 min-w-0 to truncate text if too long */}
              <span className="text-sm font-semibold text-slate-900 truncate">{company?.name || "Your Restaurant"}</span>
              <span className="text-xs text-slate-500 truncate">Waiter Dashboard</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content: Navigation Menus */}
      <SidebarContent className="px-2 py-4 flex-1 overflow-y-auto"> {/* Added flex-1 and overflow-y-auto */}
        {/* Main Navigation */}
        <SidebarGroup>
          {/* <SidebarGroupLabel className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">Main</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.text}
                    // Tailwind for active and hover states
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200
                               data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700
                               hover:bg-gray-100 hover:text-gray-900
                               group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:px-0" // Adjusted for icon mode
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5 shrink-0" /> {/* shrink-0 to prevent icon from shrinking */}
                      <span className="group-data-[collapsible=icon]:hidden">{item.text}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 bg-gray-200" /> {/* Adjusted margin and color */}

        {/* Order Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">Order Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {orderNavItems.map((item) => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.text}
                    // Tailwind for active and hover states
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200
                               data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700
                               hover:bg-gray-100 hover:text-gray-900
                               group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:px-0"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.text}</span>
                      {item.text === "View Orders" && (
                        <Badge variant="secondary" className="ml-auto px-2 py-0.5 rounded-full text-xs font-normal bg-gray-200 text-gray-700 group-data-[collapsible=icon]:hidden"> {/* Added styling and hidden in icon mode */}
                          {/* You need to fetch and display the actual order count here */}
                          5 {/* Placeholder for order count */}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 bg-gray-200" />

        {/* Account Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavItems.map((item) => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.text}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200
                               data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700
                               hover:bg-gray-100 hover:text-gray-900
                               group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:px-0"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.text}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer: User Profile and Logout */}
      <SidebarFooter className="border-t bg-white p-4 shrink-0"> {/* Changed background to white, added shrink-0 */}
        {/* User Profile */}
        <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:justify-center"> {/* mb-4 for more space, centered in icon mode */}
          <Avatar className="h-9 w-9"> {/* Slightly larger avatar */}
            <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt="User Avatar" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-base"> {/* Gradient fallback */}
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
              {user?.firstName} {user?.lastName || user?.email} {/* Fallback to email if no last name */}
            </p>
            <p className="text-xs text-gray-500 truncate leading-tight">Waiter</p>
          </div>
        </div>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost" // Changed to ghost for a cleaner look
              size="sm"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200
                         group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0" // Adjusted for icon mode
            >
              <LogOut className="h-4 w-4 shrink-0 mr-2 group-data-[collapsible=icon]:mr-0" /> {/* Removed mr-2 in icon mode */}
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
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
              <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">Sign Out</AlertDialogAction> {/* Red color for sign out action */}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>

      <SidebarRail /> {/* This component usually controls the collapsible state or small rail version */}
    </Sidebar>
  )
}

// Removed the standalone setHasCompanies function to integrate it into the component's state.
// If this function was intended to be global, it needs to be defined appropriately (e.g., in a utility file).
// For now, it's handled by a useState hook within the component.