"use client"

import React, { useState, useEffect } from "react"
import { RefreshCw, Download, Plus, Filter } from 'lucide-react'
import { getOrders } from "@/lib/order"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { columns, Order } from "@/components/order-columns"
import { DatePickerWithRange } from "@/components/ui/date-time-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { addDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { jwtDecode } from "jwt-decode"

interface DatePickerWithRangeProps {
    range: { from: Date; to: Date };
    setRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
  }
  interface DecodedToken {
    role: string; 
    userId?: string; 
    branchId?: string;
    [key: string]: any;
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

  useEffect(() => {
    if (!refresh) return

    setData([])
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
                if (!token) {
                  console.error("Token not found");
                  return;
                }
                const decodedToken: DecodedToken = jwtDecode(token);
                const orders = await getOrders(undefined, decodedToken.branchId ?? "",);

        const filteredOrders = orders.filter((order: { branchId: any }) => order.branchId === decodedToken.branchId)
        setData(filteredOrders)
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
      filtered = filtered.filter(order => !order.isCompleted)
    }
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= dateRange.from! && orderDate <= dateRange.to!
      })
    }
    setFilteredData(filtered)
  }, [showCompleted, dateRange, data])

  return (
    <div className="py-6 px-10">
      <div className="flex flex-row mb-6">
        <div className="mr-auto flex">
          <h1 className="mr-auto font-bold text-2xl flex items-center">
            Orders
          </h1>
          <div className="ml-5 my-auto h-4 w-4 items-center flex">
            <Button
              variant="ghost"
              className={`rounded-full p-3 items-center ${refresh ? "animate-spin" : ""}`}
              onClick={() => setRefresh(true)}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="ml-auto flex justify-end gap-5">
          <Button variant="outline" className="my-auto" onClick={() => window.location.href = "/orders/create"}>
            <Plus className="w-4 h-4 mr-2" /> New Order
          </Button>
          <Button className="my-auto">
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-completed"
                checked={showCompleted}
                onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
              />
              <Label htmlFor="show-completed">Show Completed Orders</Label>
            </div>
            <div>
              <Label htmlFor="date-range" className="mb-2 block">Date Range</Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <Button variant="secondary">
              <Filter className="w-4 h-4 mr-2" /> Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  )
}

