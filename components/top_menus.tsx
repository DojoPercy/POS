"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { DateRange } from "react-day-picker"
import { getTopMenusByDateRange } from "@/lib/summaries"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { DatePickerWithRange } from "./ui/date-time-picker"
import { RefreshCw, ChefHat, TrendingUp } from "lucide-react"
import { addDays } from "date-fns"

interface TopMenusChartProps {
  companyId: string
}

export default function TopMenusChart({ companyId }: TopMenusChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const fetchData = useCallback(async () => {
    if (!companyId || !dateRange?.from || !dateRange?.to) return

    setLoading(true)
    try {
      const topMenus = await getTopMenusByDateRange(dateRange.from, dateRange.to, undefined, companyId)

      const chartData = topMenus.slice(0, 10).map((item: any, index: number) => ({
        name: item.menu.name || "Unknown Menu",
        total: item.totalOrders,
        rank: index + 1,
      }))

      setData(chartData)
    } catch (error) {
      console.error("Error fetching top menus data:", error)
    } finally {
      setLoading(false)
    }
  }, [companyId, dateRange?.from, dateRange?.to])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatYAxis = (value: number) => {
    return value.toLocaleString()
  }

  const totalOrders = data.reduce((sum, item) => sum + item.total, 0)

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg font-semibold">Top Menu Items</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Update
          </Button>
        </div>
        <p className="text-sm text-slate-600">Most ordered items for the selected period</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-[300px]" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        ) : data.length > 0 ? (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value: any) => (value.length > 12 ? `${value.substring(0, 12)}...` : value)}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <Tooltip
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any, name: string) => [`${value.toLocaleString()} orders`, "Total Orders"]}
                />
                <Bar dataKey="total" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} name="Orders" />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>

            {/* Top 3 Items Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.slice(0, 3).map((item, index) => (
                <Card key={item.name} className="bg-gradient-to-br from-slate-50 to-slate-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>#{item.rank}</Badge>
                      <TrendingUp className="h-4 w-4 text-slate-500" />
                    </div>
                    <h4 className="font-semibold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-2xl font-bold text-slate-900">{item.total.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">
                      {((item.total / totalOrders) * 100).toFixed(1)}% of total orders
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-slate-600">Total Orders</p>
                <p className="text-xl font-bold text-slate-900">{totalOrders.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Menu Items</p>
                <p className="text-xl font-bold text-slate-900">{data.length}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px] text-center">
            <ChefHat className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No menu data available</p>
            <p className="text-sm text-slate-400">Try selecting a different date range</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
