"use client"

import { Utensils, DollarSign, TrendingUp, Clock, Banknote } from "lucide-react"
import {
  getExpectedRevenueByDataRange,
  getOrderCountByDateRange,
  getOrderRevenueByDateRange,
  getOrderSummaryByDateRange,
} from "@/lib/order"
import { paymentService } from "@/lib/payment"
import { getExpensesSummaryByDateRangeOwner, getExpenseSumByDateRange } from "@/lib/expense"
import type { JSX } from "react" // Declare JSX variable

enum StatisticGraph {
  ordersGraph = 0,
  customersGraph = 1,
  serviceTimeGraph = 2,
  paymentGraph = 3,
  expensesGraph = 4,
}

export type StatisticHeaderDef = {
  name: string
  icon: JSX.Element
  call: (from: Date, to: Date, branchId?: string, companyId?: string) => Promise<number>
  graphIndex: number
  accessorKey: string
  color: string
  bgColor: string
}

type StatisticFnDef<TValue> = {
  index: number
  call: (from: Date, to: Date, branchId?: string, companyId?: string) => Promise<TValue>
}

type StatisticFnDefP<TValue> = {
  index: number
  call: (from: Date, to: Date, companyId: string, branchId?: string) => Promise<TValue>
}

type StatisticFnDefE<TValue> = {
  index: number
  call: (from: Date, to: Date, companyId: string, branchId?: string) => Promise<TValue>
}

export const StatisticHeaders: StatisticHeaderDef[] = [
  {
    name: "Total Orders",
    icon: <Utensils className="w-5 h-5" />,
    call: getOrderCountByDateRange,
    graphIndex: StatisticGraph.ordersGraph,
    accessorKey: "sales",
    color: "text-blue-700",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
  },
  {
    name: "Revenue",
    icon: <DollarSign className="w-5 h-5" />,
    call: getOrderRevenueByDateRange,
    graphIndex: StatisticGraph.ordersGraph,
    accessorKey: "revenue",
    color: "text-green-700",
    bgColor: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
  },
  {
    name: "Receivables",
    icon: <Clock className="w-5 h-5" />,
    call: getExpectedRevenueByDataRange,
    graphIndex: StatisticGraph.ordersGraph,
    accessorKey: "revenue",
    color: "text-orange-700",
    bgColor: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
  },
  {
    name: "Payments",
    icon: <TrendingUp className="w-5 h-5" />,
    call: paymentService.getPaymentByDateRange,
    graphIndex: StatisticGraph.paymentGraph,
    accessorKey: "payments",
    color: "text-purple-700",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
  },
  {
    name: "Expenses",
    icon: <Banknote className="w-5 h-5" />,
    call: getExpenseSumByDateRange,
    graphIndex: StatisticGraph.expensesGraph,
    accessorKey: "totalExpenses",
    color: "text-red-700",
    bgColor: "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
  },
]

export const StatisticFns: StatisticFnDef<any[]>[] = [
  {
    index: StatisticGraph.ordersGraph,
    call: getOrderSummaryByDateRange,
  },
]

export const StatisticFnsE: StatisticFnDefE<any[]>[] = [
  {
    index: StatisticGraph.expensesGraph,
    call: getExpensesSummaryByDateRangeOwner,
  },
]

export const StatisticFnsP: StatisticFnDefP<any[]>[] = [
  {
    index: StatisticGraph.paymentGraph,
    call: paymentService.getPaymentSummaryByDateRangeOwner,
  },
]
