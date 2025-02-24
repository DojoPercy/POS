"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { RefreshCw, Download, Plus, Filter, Search } from "lucide-react"
import { getOrders } from "@/lib/order"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/order-columns"
import { DatePickerWithRange } from "@/components/ui/date-time-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { jwtDecode } from "jwt-decode"
import { Order } from '../../../../components/order-columns';

interface DatePickerWithRangeProps {
  range: { from: Date; to: Date }
  setRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>
}

interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  [key: string]: any
}

export default function Orders() {
  const [refresh, setRefresh] = useState(true)
  const [data, setData] = useState<Order[]>([])
  const [filteredData, setFilteredData] = useState<Order[]>([])
  const [showCompleted, setShowCompleted] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [searchTerm, setSearchTerm] = useState("")

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
        const orders = await getOrders(undefined, decodedToken.branchId ?? "")
        const filteredOrders = orders.filter((order: { waiterId: any }) => order.waiterId === decodedToken.userId)
        const finalData = filteredOrders.map((order: { branch: { name: any } }) => ({
          ...order,
          branchName: order.branch?.name ?? "N/A" 
        }))
        setData(finalData)
        console.log("Fet orders:", finalData)
        setFilteredData(finalData)
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
      filtered = filtered.filter((order) => !order.isCompleted)
    }
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= dateRange.from! && orderDate <= dateRange.to!
      })
    }
    if (searchTerm) {
      
      filtered = filtered.filter(
        (order) =>
          
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.branchName?.toLowerCase().includes(searchTerm.toLowerCase()),
          
      )
      console.log("searchTerm", filtered)
    }
    setFilteredData(filtered)
  }, [showCompleted, dateRange, data, searchTerm])

  return (
    <div className="">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Orders Dashboard</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className={`${refresh ? "animate-spin" : ""}`}
              onClick={() => setRefresh(true)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/waiter/order/new")}>
              <Plus className="h-4 w-4 mr-2" /> New Order
            </Button>
            <Button variant="default">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Order Number, ID or Branch"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="show-completed">Order Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-completed"
                  checked={showCompleted}
                  onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
                />
                <Label htmlFor="show-completed">Show Completed Orders</Label>
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="secondary" className="w-full">
                <Filter className="w-4 mr-2" /> Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </div>
  )
}

