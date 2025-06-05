"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Calendar, BarChart3 } from "lucide-react"
import { ResponsiveLineChart } from "@/components/responsive-line-chart"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { BranchPerformance, fetchBranchPerformance } from "@/lib/branch"

interface BranchPerformanceChartProps {
  branchId: string
  className?: string
}

const periodOptions = [
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
]

const metricOptions = [
  { label: "Sales", value: "sales", color: "text-green-600" },
  { label: "Orders", value: "orders", color: "text-blue-600" },
  { label: "Items", value: "items", color: "text-purple-600" },
]

export function BranchPerformanceChart({ branchId, className }: BranchPerformanceChartProps) {
  const [data, setData] = useState<BranchPerformance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(7)
  const [selectedMetric, setSelectedMetric] = useState("sales")
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const performanceData = await fetchBranchPerformance(branchId, selectedPeriod, selectedMetric)
        setData(performanceData)
      } catch (error) {
        console.error("Error loading performance data:", error)
        toast({
          title: "Error",
          description: "Failed to load performance data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [branchId, selectedPeriod, selectedMetric, toast])

  const currentMetric = metricOptions.find((m) => m.value === selectedMetric)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Trends
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {selectedPeriod} days
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex gap-1">
            {periodOptions.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-1">
            {metricOptions.map((metric) => (
              <Button
                key={metric.value}
                variant={selectedMetric === metric.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric(metric.value)}
                className={selectedMetric === metric.value ? "" : metric.color}
              >
                {metric.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total {currentMetric?.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedMetric === "sales"
                      ? `$${data.summary.totalSales.toFixed(2)}`
                      : selectedMetric === "orders"
                        ? data.summary.totalOrders.toLocaleString()
                        : data.summary.totalItems.toLocaleString()}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Daily Average</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedMetric === "sales"
                      ? `$${data.summary.averageDaily.sales.toFixed(2)}`
                      : selectedMetric === "orders"
                        ? data.summary.averageDaily.orders.toFixed(1)
                        : data.summary.averageDaily.items.toFixed(1)}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Trend</p>
                  <p className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                    <TrendingUp className="h-5 w-5" />
                    +12%
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="h-80">
                <ResponsiveLineChart data={data.data} value={selectedMetric} />
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No performance data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
