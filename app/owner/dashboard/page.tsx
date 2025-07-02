"use client"

import { useState, useEffect } from "react"
import {
  RefreshCw,
  Download,
  Building2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react"
import { addDays } from "date-fns"
import { StatisticHeaders, StatisticFns, StatisticFnsP, StatisticFnsE } from "@/components/stats-header"
import { columnsExpenses, columnsPayment, columnsRevenueIncome } from "@/components/columns-stats"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-time-picker"
import { DataTable } from "@/components/ui/data-table"
import { ResponsiveLineChart } from "@/components/responsive-line-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { getOrderSummaryByDateRangeOwner, getSalesSummaryOfBranches, getTodaySalesSummaryOfBranches } from "@/lib/order"
import Image from "next/image"
import { paymentService } from "@/lib/payment"
import { getExpensesSummaryByDateRangeOwner } from "@/lib/expense"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserFromToken, selectUser } from "@/redux/authSlice"
import { getCompanyDetails } from "@/redux/companySlice"
import type { RootState } from "@/redux"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { DateRange } from "react-day-picker"
import BranchStats from "@/components/branchpie"
import ProfitSummaries from "@/components/profitsummaries"
import TopMenusChart from "@/components/top_menus"
import axios from "axios"
import { getBranches } from "@/lib/branch"

type graphDataDef = {
  [key: number]: {
    date: string
    sales: number
    [key: string]: string | number
  }[]
}

interface Branch {
  id: string
  name: string
  status: "active" | "inactive"
  todayRevenue?: number
  todayOrders?: number
}

// Mock data for demonstration - replace with actual API calls
const mockBranches: Branch[] = [
  { id: "1", name: "Downtown Branch", status: "active", todayRevenue: 2450, todayOrders: 45 },
  { id: "2", name: "Mall Location", status: "active", todayRevenue: 1890, todayOrders: 32 },
  { id: "3", name: "Airport Branch", status: "inactive", todayRevenue: 0, todayOrders: 0 },
]

const mockTodayStats = {
  revenue: 4340,
  orders: 77,
  customers: 65,
  avgOrderValue: 56.36,
  growth: 12.5,
}
interface TodayStats {
  revenue: number
  orders: number
  avgOrderValue: number
  growth: number
}
interface BranchSummary {
  branch: string
  sales: number
  revenue: string
}


export default function Statistics() {
  const [refresh, setRefresh] = useState(true)
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [selectedHeader, setSelectedHeader] = useState(StatisticHeaders[0])
  const [headerData, setHeaderData] = useState<number[]>([])
  const [graphData, setGraphData] = useState<graphDataDef>({})
  const [tableData, setTableData] = useState<any[]>([])
  const [paymentTableData, setPaymentTableData] = useState<any[]>([])
  const [expensesTableData, setExpensesTableData] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [branches, setBranches] = useState<Branch[]>(mockBranches)
  const [branchSummaries, setBranchSummaries] = useState<BranchSummary[]>([])
  const [showInactiveBranches, setShowInactiveBranches] = useState(false) 
   const [todayStats, setTodayStats] = useState<TodayStats>({
    revenue: 0,
    orders: 0,
    avgOrderValue: 0,
    growth: 0,
  })
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const { company } = useSelector((state: RootState) => state.company)

  useEffect(() => {
    dispatch(fetchUserFromToken())
  }, [dispatch])

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId))
    }
  }, [dispatch, user?.companyId])
useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getBranches(user?.companyId || "")
        setBranches(response)
        
        
      } catch (err: any) {
        console.error("Failed to fetch branches:", err.response?.data?.error || err.message)
      }
    }

    if (user?.companyId) {
      fetchBranches()
    }
  }, [user?.companyId])

  useEffect(() => {
    if (company) {
      console.log("Selected company:", company)
      setSelectedCompany(company)
    }
  }, [company])
useEffect(() => {
    const fetchTodayStats = async () => {
      if (!selectedCompany?.id) return

      try {
        setLoading(true)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        // Fetch today's branch summaries
        const todayBranchSummaries = await getTodaySalesSummaryOfBranches( selectedCompany.id)
        setBranchSummaries(todayBranchSummaries!)

        // Calculate today's totals
        const todayRevenue = todayBranchSummaries!.reduce((sum, branch) => sum + Number.parseFloat(branch.revenue), 0)
        const todayOrders = todayBranchSummaries!.reduce((sum, branch) => sum + branch.sales, 0)

        // Fetch yesterday's data for growth calculation
        const yesterdayBranchSummaries = await getSalesSummaryOfBranches(yesterday, yesterday, selectedCompany.id)
        const yesterdayRevenue = yesterdayBranchSummaries?.reduce(
          (sum, branch) => sum + Number.parseFloat(branch.revenue),
          0,
        )

        const growth = yesterdayRevenue! > 0 ? ((todayRevenue - yesterdayRevenue!) / yesterdayRevenue!) * 100 : 0
        const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0

        setTodayStats({
          revenue: todayRevenue,
          orders: todayOrders,
          avgOrderValue,
          growth,
        })

        // Update branches with today's data
        setBranches((prevBranches) =>
          prevBranches.map((branch) => {
            const summary = todayBranchSummaries?.find((s) => s.branch === branch.name)
            return {
              ...branch,
              todayRevenue: summary ? Number.parseFloat(summary.revenue) : 0,
              todayOrders: summary ? summary.sales : 0,
            }
          }),
        )
      } catch (error) {
        console.error("Error fetching today's stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodayStats()
  }, [selectedCompany?.id])

  useEffect(() => {
    if (!refresh) return
    setHeaderData([])
    setGraphData({})
    setTableData([])
    setPaymentTableData([])
    setExpensesTableData([])

    const updatePage = async () => {
      if (!date?.from || !date?.to || !selectedCompany) {
        setRefresh(false)
        return
      }

      const fromDate: Date = date.from
      const toDate: Date = date.to

      try {
        const headerPromises = StatisticHeaders.map((header) =>
          header.call(fromDate, toDate, undefined, selectedCompany.id),
        )
        const headerContent: number[] = await Promise.all(headerPromises)

        const orderGraphCalls = StatisticFns.map((fn) =>
          fn.call(fromDate, toDate, undefined, selectedCompany.id).then((data) => ({
            index: fn.index,
            data,
          })),
        )

        const paymentGraphCalls = StatisticFnsP.map((fn) =>
          fn.call(fromDate, toDate, selectedCompany.id, undefined).then((data) => ({
            index: fn.index,
            data,
          })),
        )

        const expensesGraphCalls = StatisticFnsE.map((fn) =>
          fn.call(fromDate, toDate, selectedCompany.id, undefined).then((data) => ({
            index: fn.index,
            data,
          })),
        )

        const graphResults = await Promise.all([...orderGraphCalls, ...paymentGraphCalls, ...expensesGraphCalls])

        const graphContent: graphDataDef = {}
        for (const result of graphResults) {
          graphContent[result.index] = result.data
        }

        const [tableValue, paymentTableValue, expensesTableValue] = await Promise.all([
          getOrderSummaryByDateRangeOwner(fromDate, toDate, selectedCompany.id),
          paymentService.getPaymentSummaryByDateRangeOwner(fromDate, toDate, selectedCompany.id),
          getExpensesSummaryByDateRangeOwner(fromDate, toDate, selectedCompany.id),
        ])

        setHeaderData(headerContent)
        setGraphData(graphContent)
        setTableData(tableValue)
        setPaymentTableData(paymentTableValue)
        setExpensesTableData(expensesTableValue)
      } catch (error) {
        console.error("Error updating page:", error)
      } finally {
        setRefresh(false)
      }
    }

    updatePage()
  }, [refresh, date, selectedCompany])

  useEffect(() => {
    setRefresh(true)
  }, [date, selectedCompany])

  const activeBranches = branches.filter((branch) => branch.status === "active")
  const inactiveBranches = branches.filter((branch) => branch.status === "inactive")
  const displayedBranches = showInactiveBranches ? branches : activeBranches

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Owner&apos;s Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here&apos;s what&apos;s happening with your business today.</p>
        </div>

        {selectedCompany && (
          <Card className="lg:w-auto">
            <CardContent className="flex items-center gap-3 p-4">
              {selectedCompany.logo && (
                <Image
                  src={selectedCompany.logo || "/placeholder.svg"}
                  alt={selectedCompany.name}
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-slate-900">{selectedCompany.name}</h3>
                <p className="text-sm text-slate-500">{activeBranches.length} Active Branches</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Today's Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Today&apos;s Revenue</p>
                {loading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-blue-900">
                    {selectedCompany?.currency}{todayStats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    {todayStats.growth > 0 ? "+" : ""}
                    {todayStats.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Today&apos;s Orders</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-green-900">{todayStats.orders.toLocaleString()}</p>
                )}
                <p className="text-xs text-green-600">Across all branches</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Avg Order Value</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-orange-900">
                  {selectedCompany?.currency}{todayStats.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                )}
                <p className="text-xs text-orange-600">Per transaction</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Overview */}
       <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-600" />
              <CardTitle>Branch Overview</CardTitle>
              <Badge variant="outline">{branches.length} Total</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInactiveBranches(!showInactiveBranches)}
              className="flex items-center gap-2"
            >
              {showInactiveBranches ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showInactiveBranches ? "Hide Inactive" : "Show All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {branches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedBranches.map((branch) => {
                const maxRevenue = Math.max(...activeBranches.map((b) => b.todayRevenue || 0))
                const progressValue = maxRevenue > 0 ? ((branch.todayRevenue || 0) / maxRevenue) * 100 : 0

                return (
                  <Card key={branch.id} className={branch.status === "inactive" ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900">{branch.name}</h4>
                        <Badge variant={branch.status === "active" ? "default" : "secondary"}>{branch.status}</Badge>
                      </div>
                      {branch.status === "active" ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Today&apos;s Revenue:</span>
                            <span className="font-medium">
                              {selectedCompany?.currency}{(branch.todayRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Orders:</span>
                            <span className="font-medium">{(branch.todayOrders || 0).toLocaleString()}</span>
                          </div>
                          <Progress value={progressValue} className="h-2 mt-2" />
                          <p className="text-xs text-slate-500 text-center">
                            {progressValue.toFixed(1)}% of top performer
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Branch is currently inactive</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No branches found</p>
              <p className="text-sm text-slate-400">Add branches to start managing your restaurant chain</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-600" />
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRefresh(true)} disabled={refresh}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refresh ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {StatisticHeaders.map((header, i) => (
          <Card
            key={header.name}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedHeader === header ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-slate-50"
            } ${header.bgColor}`}
            onClick={() => setSelectedHeader(header)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${header.color}`}>{header.name}</p>
                  {i < headerData.length ? (
                    <p className="text-2xl font-bold text-slate-900">{headerData[i]?.toString() || "0"}</p>
                  ) : (
                    <Skeleton className="h-8 w-20 mt-1" />
                  )}
                </div>
                <div className={header.color}>{header.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>  <ResponsiveLineChart
              data={
                Array.isArray(graphData[selectedHeader.graphIndex])
                  ? graphData[selectedHeader.graphIndex]
                  : []
              }
              value={selectedHeader.accessorKey}
            />
          </CardContent>
        </Card>

        {selectedCompany && <BranchStats companyId={selectedCompany.id} currency={selectedCompany.currency} />}
      </div>

      {/* Additional Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedCompany && <ProfitSummaries companyId={selectedCompany.id} currency={selectedCompany?.currency} />}
        {selectedCompany && <TopMenusChart companyId={selectedCompany.id} />}
      </div>

      {/* Data Tables */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columnsRevenueIncome} data={tableData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columnsPayment} data={paymentTableData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columnsExpenses} data={expensesTableData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
