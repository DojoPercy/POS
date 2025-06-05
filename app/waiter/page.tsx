"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { WaiterHeader } from "@/components/waiter-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserById } from "@/lib/auth"
import { getBranchById } from "@/lib/branch"
import { jwtDecode } from "jwt-decode"
import { format, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import {
  Clock,
  MapPin,
  Building,
  Mail,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Edit,
  Settings,
  ChefHat,
  RefreshCw,
  BarChart3,
  Target,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { DatePickerWithRange } from "@/components/date"

interface WaiterProfileUser {
  id: string
  fullname: string
  status: string
  email: string
  role: string
  branchId?: string
  name: string
  createdAt?: string
}

interface Branch {
  id: string
  name: string
  location: string
  city: string
  state?: string
  country: string
  openingHours: string
  status: "active" | "inactive" | ""
  managerId?: string
  createdBy: string
  createdAt: Date
  updatedAt?: Date
}

interface OrderSummary {
  waiterId: string
  totalOrders: number
  totalItems: number
  totalAmount: number
  averageOrderValue: number
  averageItemsPerOrder: number
  dateRange: {
    from: string
    to: string
  }
  lastUpdated: string
}

interface DecodedToken {
  role: string
  userId?: string
  [key: string]: any
}

export default function WaiterProfile() {
  const [user, setUser] = useState<WaiterProfileUser | null>(null)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })

  const { toast } = useToast()
  const breadcrumbs = [{ label: "Dashboard", href: "/waiter" }, { label: "Profile" }]

  // Predefined date range options
  const dateRangePresets = [
    {
      label: "Today",
      range: { from: new Date(), to: new Date() },
    },
    {
      label: "Yesterday",
      range: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) },
    },
    {
      label: "Last 7 days",
      range: { from: subDays(new Date(), 6), to: new Date() },
    },
    {
      label: "Last 30 days",
      range: { from: subDays(new Date(), 29), to: new Date() },
    },
    {
      label: "This month",
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
  ]
 const fetchOrderSummary = useCallback(async (waiterId: string, fromDate: Date, toDate: Date) => {
    try {
      setSummaryLoading(true)
      const from = format(fromDate, "yyyy-MM-dd")
      const to = format(toDate, "yyyy-MM-dd")

      const response = await fetch(`/api/orders/waiter?waiterId=${waiterId}&from=${from}&to=${to}`)
      if (response.ok) {
        const summary = await response.json()
        setOrderSummary(summary)
        toast({
          title: "Data Updated",
          description: `Statistics loaded for ${from} to ${to}`,
        })
      } else {
        throw new Error("Failed to fetch order summary")
      }
    } catch (error) {
      console.error("Failed to fetch order summary:", error)
      toast({
        title: "Error",
        description: "Failed to load order statistics",
        variant: "destructive",
      })
    } finally {
      setSummaryLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const fetchUserAndBranch = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Token not found")
          return
        }
        const decodedToken: DecodedToken = jwtDecode(token)
        const userDetails = await getUserById(decodedToken.userId ?? "")
        const branchDetails = await getBranchById(userDetails.branchId ?? "")

        setUser(userDetails)
        setBranch(branchDetails)

        // Fetch order summary for the selected date range
        if (dateRange?.from && dateRange?.to) {
          fetchOrderSummary(decodedToken.userId ?? "", dateRange.from, dateRange.to)
        }
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserAndBranch()
  }, [dateRange?.from, dateRange?.to, fetchOrderSummary, toast])

  // Fetch order summary when date range changes
  useEffect(() => {
    if (user && dateRange?.from && dateRange?.to) {
      fetchOrderSummary(user.id, dateRange.from, dateRange.to)
    }
  }, [dateRange, fetchOrderSummary, user])

 
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange)
  }

  const handlePresetClick = (preset: { label: string; range: DateRange }) => {
    setDateRange(preset.range)
  }

  const handleRefresh = () => {
    if (user && dateRange?.from && dateRange?.to) {
      fetchOrderSummary(user.id, dateRange.from, dateRange.to)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <WaiterHeader title="Profile" breadcrumbs={breadcrumbs} />
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <ProfileSkeleton />
        </div>
      </div>
    )
  }

  if (!user || !branch) {
    return (
      <div className="flex flex-col h-full">
        <WaiterHeader title="Profile" breadcrumbs={breadcrumbs} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ChefHat className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load profile</h3>
            <p className="text-gray-500">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    )
  }

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDateRangeLabel = () => {
    if (!dateRange?.from || !dateRange?.to) return "Select date range"
    if (dateRange.from.toDateString() === dateRange.to.toDateString()) {
      return format(dateRange.from, "MMM dd, yyyy")
    }
    return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`
  }

  const stats = [
    {
      title: "Total Orders",
      value: summaryLoading ? "..." : orderSummary?.totalOrders.toString() || "0",
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
    },
    {
      title: "Items Served",
      value: summaryLoading ? "..." : orderSummary?.totalItems.toString() || "0",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
    },
    {
      title: "Total Sales",
      value: summaryLoading ? "..." : `$${orderSummary?.totalAmount.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+15%",
    },
   
  ]

  return (
    <div className="flex flex-col h-full">
      <WaiterHeader title="Profile" breadcrumbs={breadcrumbs} />

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
              <CardContent className="relative pt-0 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.fullname}`}
                      alt={user.fullname}
                    />
                    <AvatarFallback className="text-2xl font-semibold bg-gray-100">
                      {user.fullname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 sm:ml-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name || user.fullname}</h1>
                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {user.role}
                          </Badge>
                          <Badge
                            variant={user.status === "active" ? "default" : "destructive"}
                            className={user.status === "active" ? "bg-green-100 text-green-800" : ""}
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Date Range Picker and Analytics Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Date Range:</label>
                      <DatePickerWithRange
                        date={dateRange}
                        onDateChange={handleDateRangeChange}
                        placeholder="Select date range"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {dateRangePresets.map((preset) => (
                        <Button
                          key={preset.label}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePresetClick(preset)}
                          className="text-xs"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={summaryLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${summaryLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Viewing data for:</span> {getDateRangeLabel()}
                  </p>
                  {orderSummary?.lastUpdated && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated: {format(new Date(orderSummary.lastUpdated), "MMM dd, yyyy 'at' HH:mm")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {stat.change} from last period
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProfileItem icon={<Building className="w-4 h-4" />} label="User ID" value={user.id} />
                  <ProfileItem icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
                  <ProfileItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Joined"
                    value={formatJoinDate(user.createdAt)}
                  />
                  <ProfileItem
                    icon={<Award className="w-4 h-4" />}
                    label="Role"
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Branch Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Branch Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProfileItem icon={<Building className="w-4 h-4" />} label="Branch Name" value={branch.name} />
                  <ProfileItem
                    icon={<MapPin className="w-4 h-4" />}
                    label="Location"
                    value={`${branch.city}, ${branch.state || ""} ${branch.country}`.trim()}
                  />
                  <ProfileItem icon={<Clock className="w-4 h-4" />} label="Opening Hours" value={branch.openingHours} />
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div
                        className={`w-2 h-2 rounded-full ${branch.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Branch Status</p>
                      <Badge variant={branch.status === "active" ? "default" : "destructive"} className="mt-1">
                        {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link href="/waiter/order/new">
                    <Button className="w-full h-16 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                      <ShoppingBag className="h-5 w-5" />
                      Create New Order
                    </Button>
                  </Link>
                  <Link href="/waiter/order/view">
                    <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
                      <TrendingUp className="h-5 w-5" />
                      View Orders
                    </Button>
                  </Link>
                  <Link href="/waiter/settings">
                    <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
                      <Settings className="h-5 w-5" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{value}</p>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header Skeleton */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-32"></div>
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
            <Skeleton className="w-24 h-24 rounded-full border-4 border-white" />
            <div className="flex-1 sm:ml-4 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Range Picker Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <Skeleton className="h-10 w-80" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-16" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center space-x-3">
                  <Skeleton className="w-4 h-4" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
