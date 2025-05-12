"use client"

import { useState, useEffect } from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, RefreshCw } from "lucide-react"
import { DatePicker } from "./ui/datepicker"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"
import { DatePickerWithRange } from "./ui/date-time-picker"
import { getSalesSummaryOfBranches } from "@/lib/summaries"

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

// Function to generate random colors
export const generateColors = (count: number) => {
  const colors = []
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    colors.push(`rgb(${r}, ${g}, ${b})`)
  }
  return colors
}

// Skeleton component for loading state
const ChartSkeleton = () => (
  <div className="flex flex-col items-center justify-center w-full h-[300px] space-y-4">
    <Skeleton className="h-[200px] w-[200px] rounded-full" />
    <div className="flex flex-col space-y-2 w-full max-w-[300px]">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
)


// Mock function for getBranchNameById since it's used in getSalesSummaryOfBranches


const BranchStats = ({ companyId  }: {companyId:string }) => {
   
    
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
      });
  const [loading, setLoading] = useState(true)
  const [branchData, setBranchData] = useState<Array<{ branch: string; sales: number; revenue: number }>>([])
  const [chartType, setChartType] = useState<"sales" | "revenue">("revenue")
  const fetchData = async () => {
    setLoading(true)
    try {
        const fromDate: Date = date!.from!;
        const toDate: Date = date!.to!;
      const data = await getSalesSummaryOfBranches(fromDate!, toDate!, companyId)
      if (data) {
        // Ensure that revenue is a number, if it’s a string, convert it to a number.
        const formattedData = data.map(item => ({
          branch: item.branch,
          sales: item.sales,
          revenue: typeof item.revenue === "string" ? parseFloat(item.revenue) : item.revenue
        }))
        setBranchData(formattedData)
      } else {
        setBranchData([])
      }
    } catch (error) {
      console.error("Error fetching branch data:", error)
    } finally {
      setLoading(false)
    }
  }
  
  
  useEffect(() => {
    fetchData()
  }, [date!.from!, date?.to])
  
  useEffect(() => {
    fetchData()
  }, [])

  const prepareChartData = () => {
    const labels = branchData.map((item) => item.branch)
    const values = branchData.map((item) => (chartType === "sales" ? item.sales : item.revenue))
    const colors = generateColors(branchData.length)

    return {
      labels,
      datasets: [
        {
          label: chartType === "sales" ? "Sales" : "Revenue",
          data: values,
          backgroundColor: colors,
          hoverOffset: 4,
        },
      ],
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">
          Branch {chartType === "sales" ? "Sales" : "Revenue"} Distribution
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === "sales" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("sales")}
          >
            Sales
          </Button>
          <Button
            variant={chartType === "revenue" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("revenue")}
          >
            Revenue
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              
              <DatePickerWithRange date={date} setDate={setDate} />
            </div>
           
            <Button variant="outline" size="sm" onClick={fetchData} className="ml-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Update
            </Button>
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : branchData.length > 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut
                data={prepareChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || ""
                          const value = context.raw
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                          const percentage = Math.round(((value as number) / total) * 100)
                          return `${label}: ${value} (${percentage}%)`
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No data available for the selected period</p>
            </div>
          )}

          {!loading && branchData.length > 0 && (
            <div className="text-xs text-muted-foreground text-center">Last updated: {new Date().toLocaleString()}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default BranchStats
