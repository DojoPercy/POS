"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { DateRange } from "react-day-picker"
import { getTopMenusByDateRange } from "@/lib/summaries"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { DatePickerWithRange } from "./date-range"

interface TopMenusChartProps {
  companyId: string
  branches?: { id: string; name: string }[]
}

export default function TopMenusChart({ companyId}: TopMenusChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined)

  const fetchData = useCallback(async () => {
    if (!companyId) return

    setLoading(true)
    try {
      const topMenus = await getTopMenusByDateRange(dateRange.from, dateRange.to, undefined, companyId)

      // Transform data for the chart
      const chartData = topMenus.map((item: any) => ({
        name: item.menu.name || "Unknown Menu",
        total: item.totalOrders,
      }))

      setData(chartData)
    } catch (error) {
      console.error("Error fetching chart data:", error)
    } finally {
      setLoading(false)
    }
  }, [companyId, dateRange.from, dateRange.to])

  useEffect(() => {
    fetchData()
  }, [companyId, fetchData]) // Initial fetch when component mounts

  const handleDateChange = (range: DateRange) => {
    if (range.from && range.to) {
      setDateRange({ from: range.from, to: range.to })
    }
  }

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value === "all" ? undefined : value)
  }

  const handleApplyFilters = () => {
    fetchData()
  }

  const formatYAxis = (value: number) => {
    return value.toLocaleString()
  }

  return (
    <Card className="col-span-full w-full h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Top Menu Items</CardTitle>
          <CardDescription>Most ordered menu items for the selected period</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
        
          <DatePickerWithRange date={dateRange} onDateChange={handleDateChange} />
          <Button onClick={handleApplyFilters}>Apply</Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="w-full h-[350px] flex items-center justify-center">
            <Skeleton className="w-full h-[300px]" />
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#888888" }}
                tickFormatter={(value : any) => (value.length > 15 ? `${value.substring(0, 15)}...` : value)}
              />
              <YAxis tickFormatter={formatYAxis} tickLine={false} axisLine={false} tick={{ fill: "#888888" }} />
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <Tooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            No data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  )
}
