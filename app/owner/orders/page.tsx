"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { RefreshCw, Download, Plus, Filter, ChevronDown } from "lucide-react"
import { getOrders } from "@/lib/order"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/order-columns"
import { DatePickerWithRange } from "@/components/ui/date-time-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { jwtDecode } from "jwt-decode"
import type { Company, OrderType } from "@/lib/types/types"
import { OrderStatus } from "@/lib/enums/enums"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserFromToken, selectUser } from "@/redux/authSlice"
import { getCompanyDetails } from "@/redux/companySlice"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface DatePickerWithRangeProps {
  range: { from: Date; to: Date }
  setRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>
}

interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  companyId?: string
  [key: string]: any
}

export default function Orders() {
  const [refresh, setRefresh] = useState(true)
  const [data, setData] = useState<OrderType[]>([])
  const [filteredData, setFilteredData] = useState<OrderType[]>([])
  const [showCompleted, setShowCompleted] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })

  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const company = useSelector((state: any) => state.company.company) as Company

  useEffect(() => {
    dispatch(fetchUserFromToken())
  }, [dispatch])

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId))
    }
  }, [dispatch, user?.companyId])

  useEffect(() => {
    if (!refresh) return

    setData([])
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("Token not found")
          return
        }
        const decodedToken: DecodedToken = jwtDecode(token)
        const orders = await getOrders(decodedToken.companyId ?? "", undefined)
        const updatedOrders = orders
          .map((order: any) => ({
            ...order,
            branchName: order.branch?.name || "Unknown Branch",
          }))
          .reverse()

        setData(updatedOrders)
        setFilteredData(orders)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
      } finally {
        setRefresh(false)
      }
    }
    fetchOrders()
  }, [refresh])

  useEffect(() => {
    let filtered = data
    if (!showCompleted) {
      filtered = filtered.filter((order) => !(order.orderStatus === OrderStatus.PAID))
    }
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt!)
        return orderDate >= dateRange.from! && orderDate <= dateRange.to!
      })
    }
    setFilteredData(filtered)
  }, [showCompleted, dateRange, data])

  const applyFilters = () => {
    // Filters are already applied via useEffect, but this gives visual feedback
    setIsFilterOpen(false)
  }

  return (
    <div className="py-3 px-4 md:py-6 md:px-10 max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center">
          <h1 className="font-bold text-xl md:text-2xl">Orders</h1>
          <Button
            variant="ghost"
            size="sm"
            className={`ml-2 rounded-full p-2 ${refresh ? "animate-spin" : ""}`}
            onClick={() => setRefresh(true)}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        <div className="flex gap-2 sm:gap-3 sm:ml-auto w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
            onClick={() => (window.location.href = "/orders/create")}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="whitespace-nowrap">New Order</span>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="whitespace-nowrap">Download</span>
          </Button>
        </div>
      </div>

      {/* Filters Section - Mobile Collapsible */}
      <div className="md:hidden mb-4">
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="w-full border rounded-lg">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-4">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                <span>Filters</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-completed-mobile"
                checked={showCompleted}
                onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
              />
              <Label htmlFor="show-completed-mobile">Show Completed Orders</Label>
            </div>
            <div>
              <Label htmlFor="date-range-mobile" className="mb-2 block">
                Date Range
              </Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <Button variant="secondary" className="w-full" onClick={applyFilters}>
              <Filter className="w-4 h-4 mr-2" /> Apply Filters
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Filters Section - Desktop */}
      <Card className="mb-6 hidden md:block">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 md:gap-6 items-end">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-completed"
                checked={showCompleted}
                onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
              />
              <Label htmlFor="show-completed">Show Completed Orders</Label>
            </div>
            <div className="w-full md:w-auto">
              <Label htmlFor="date-range" className="mb-2 block">
                Date Range
              </Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <Button variant="secondary" onClick={applyFilters}>
              <Filter className="w-4 h-4 mr-2" /> Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="w-full overflow-x-auto">
        {company ? (
          <DataTable columns={columns(company.currency)} data={filteredData} />
        ) : (
          <div className="flex justify-center py-10">
            <p>Loading company details...</p>
          </div>
        )}
      </div>
    </div>
  )
}
