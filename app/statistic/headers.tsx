"use client"

import {
    Boxes,
    Banknote,
    Coins,
    Receipt,
    Wallet
} from "lucide-react"

import {
    getOrderCountByDateRange,
    getOrderRevenueByDateRange,
    getOrderIncomeByDateRange,
    getOrderSummaryByDateRange,
    orderSummaryByDate
} from "@/lib/order"
import { expenseSummaryByDate, getExpenseSumByDateRange, getExpenseSummaryByDateRange } from "@/lib/expense"
import { getPaymentSumByDateRange, getPaymentSummaryByDateRange, paymentSummaryByDate } from "@/lib/payment"

enum StatisticGraph {
    ordersGraph,
    expensesGraph,
    paymentsGraph,
}

export type StatisticHeaderDef = {
    name: string
    icon: JSX.Element
    call: (from: Date, to: Date) => Promise<number>
    graphIndex: number
    accessorKey: string
}

type StatisticFnDef<TValue> = {
    index: number,
    call: (from: Date, to: Date) => Promise<TValue>
} 

export const StatisticHeaders: StatisticHeaderDef[] = [
    {
        name: "Sales",
        icon: <Boxes className="w-4 h-4" />,
        call: getOrderCountByDateRange,
        graphIndex: StatisticGraph.ordersGraph,
        accessorKey: "sales",
    },
    {
        name: "Revenue",
        icon: <Banknote className="w-4 h-4" />,
        call: getOrderRevenueByDateRange,
        graphIndex: StatisticGraph.ordersGraph,
        accessorKey: "revenue",
    },
    {
        name: "Income",
        icon: <Coins className="w-4 h-4" />,
        call: getOrderIncomeByDateRange,
        graphIndex: StatisticGraph.ordersGraph,
        accessorKey: "income",
    },
    {
        name: "Expenses",
        icon: <Receipt className="w-4 h-4" />,
        call: getExpenseSumByDateRange,
        graphIndex: StatisticGraph.expensesGraph,
        accessorKey: "expenses",
    },
    {
        name: "Payments In",
        icon: <Wallet className="w-4 h-4" />,
        call: getPaymentSumByDateRange,
        graphIndex: StatisticGraph.paymentsGraph,
        accessorKey: "paymentsIn",
    }
]

export const StatisticFns: StatisticFnDef<orderSummaryByDate[] | expenseSummaryByDate[] | paymentSummaryByDate[]>[] = [
    {
        index: StatisticGraph.ordersGraph,
        call: getOrderSummaryByDateRange,
    },
    {
        index: StatisticGraph.expensesGraph,
        call: getExpenseSummaryByDateRange,
    },
    {
        index: StatisticGraph.paymentsGraph,
        call: getPaymentSummaryByDateRange,
    },
]