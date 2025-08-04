"use client"

import { usePathname } from "next/navigation"
import { Bell, Building2, LogOut, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserFromToken, logoutUser, selectUser, setUser } from '@/redux/authSlice';
import type { RootState } from "@/redux"
import { useEffect, useState } from "react"
import axios from "axios"
import { DecodedToken } from "@/lib/types/types"
import { Branch } from "@/app/owner/branches/page"
import router from "next/router"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdownMenu"
import { NotificationBell } from "@/components/notification-bell"


// Route name mapping
const routeNames: Record<string, string> = {
  "/owner/dashboard": "Dashboard",
  "/owner/menu": "Menu",
  "/owner/ingredient": "Ingredients",
  "/owner/branches": "Branches",
  "/owner/orders": "Orders",
  "/owner/inventory": "Inventory",
  "/owner/staffs": "Staff",
  "/owner/profile": "Profile",
  "/owner/settings": "Settings",
}

export function SidebarHeaderComponent() {
  const pathname = usePathname()
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const [userDetails, setUser] = useState<any>(null) 
   const [branches, setBranches] = useState<Branch[]>([])
  
  const { company } = useSelector((state: RootState) => state.company)

  
  useEffect(() => {
    dispatch(fetchUserFromToken())
  }, [dispatch])
  useEffect(() => {
 

    const fetchBranches = async () => {
      try {
        const response = await axios.get(`/api/branches?companyId=${user?.companyId}`)
        setBranches(response.data)
      } catch (err: any) {
        console.error("Failed to fetch branches:", err.response?.data?.error || err.message)
      }
    }

    if (user?.companyId) {
      fetchBranches()
    }
  }, [user?.companyId])

  useEffect(() => {
    const getUserDetails = async () => {
      if (user?.userId) {
        try {
  const res = await fetch(`/api/users/${user.userId}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();
  setUser(data);
  console.log("User details fetched:", data.fullname);
} catch (error) {
  console.error("Error fetching user:", error);
}

      }
    }
    getUserDetails()
  }, [user?.userId])
 
  const currentPageName = routeNames[pathname] || "Dashboard"
 const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/login")
  }

  const activeBranches = branches.filter((branch) => branch.status === "active")
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
         <SidebarTrigger className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors">
          <Menu className="h-4 w-4" />
        </SidebarTrigger>
        <div>
          <h1 className="text-lg lg:text-2xl  font-bold text-slate-900">{"Company "+currentPageName}</h1>
          <p className="text-sm text-slate-500">{company?.name || "Restaurant"} Management</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search - Hidden on mobile */}
        <div className="hidden lg:flex relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search..." className="w-48 xl:w-64 pl-9 bg-slate-50 border-slate-200 focus:bg-white" />
        </div>

        {/* Notifications */}
        <NotificationBell />

      
        {/* User Profile - Desktop Version */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
           <p className="text-sm font-medium text-slate-900">{userDetails?.fullname || "Admin User"}</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Building2 className="h-3 w-3" />
              <span>
                {activeBranches.length} {activeBranches.length === 1 ? "Branch" : "Branches"}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {userDetails?.fullname?.charAt(0) || "A"}
            </div>
          </Button>
        </div>

        {/* User Profile - Mobile Version with Dropdown */}
        <div className="md:hidden bg-white z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 b-white">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                  {userDetails?.fullname?.charAt(0) || "A"}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userDetails?.fullname || "Admin User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{company?.name || "Restaurant"} Owner</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>
                  {activeBranches.length} {activeBranches.length === 1 ? "Branch" : "Branches"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => router.push("/owner/profile")}>
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
