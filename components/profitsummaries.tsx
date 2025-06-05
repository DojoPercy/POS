"use client"

import { useCallback, useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import { Bar } from "react-chartjs-2"
import { generateColors } from "./branchpie"
import { Skeleton } from "./ui/skeleton"
import type { DateRange } from "react-day-picker"
import { format, addDays } from "date-fns"
import { getProfitSummaryByDateRange, type Summary } from "@/lib/summaries"
import { Button } from "./ui/button"
import { Calendar, RefreshCw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar as CalendarComponent } from "./ui/calendar"

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const BarChartSkeleton = () => (
  <div className="flex flex-col items-center justify-center w-full h-[300px] space-y-4">
    <div className="flex w-full justify-center space-x-2">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="h-[200px] w-[40px] bg-gray-200 animate-pulse rounded-md"></div>
      ))}
    </div>
    <div className="flex flex-col space-y-2 w-full max-w-[300px]">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const ProfitSummaries = ({ companyId, currency }: { companyId: string, currency: string }) => {
  const colors = generateColors(3)
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [profitData, setProfitData] = useState<Summary>({
    totalRevenue: 0,
    totalExpense: 0,
    profit: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (!date?.from || !date?.to) return

      const fromDate: Date = date.from
      const toDate: Date = date.to
      const data = await getProfitSummaryByDateRange(fromDate, toDate, undefined, companyId)
      if (data) {
        setProfitData(data)
      } else {
        setProfitData({
          totalRevenue: 0,
          totalExpense: 0,
          profit: 0,
        })
      }
    } catch (error) {
      console.error("Error fetching Summaries data:", error)
    } finally {
      setLoading(false)
    }
  }, [companyId, date?.from, date?.to])

  useEffect(() => {
    if (date?.from && date?.to) {
      fetchData()
    }
  }, [date?.from, date?.to, companyId, fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const chartData = {
    labels: ["Total Revenue", "Total Expense", "Profit"],
    datasets: [
      {
        label: "Profit Summary",
        data: [profitData?.totalRevenue, profitData?.totalExpense, profitData?.profit],
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y)
            }
            return label
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  }

  const dateRangeText =
    date?.from && date?.to
      ? `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`
      : "Select date range"

  if (loading) {
    return <BarChartSkeleton />
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Profit Summary</h2>
        <Button variant="outline" size="sm" onClick={fetchData} className="ml-auto">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Update
                    </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{dateRangeText}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="h-[300px]">
        <Bar options={options} data={chartData} />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(profitData?.totalRevenue || 0)}</p>
        </div>
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Expenses</p>
          <p className="text-2xl font-bold">{formatCurrency(profitData?.totalExpense || 0)}</p>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Profit</p>
          <p className="text-2xl font-bold">{formatCurrency(profitData?.profit || 0)}</p>
        </div>
      </div>
    </div>
  )
}

export default ProfitSummaries
