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
    getOrderIncomeByDateRange
} from "@/lib/order"
import { getExpenseSumByDateRange } from "@/lib/expense"
import { getPaymentSumByDateRange } from "@/lib/payment"

enum StatisticGraph {
    ordersGraph,
    expensesGraph,
    paymentsGraph,
}

type StatisticHeader = {
    name: string
    icon: JSX.Element
    fn: (from: Date, to: Date) => Promise<number>
    graphIndex: number
}

export const StatisticHeader: StatisticHeader[] = [
    {
        name: "Sales",
        icon: <Boxes className="w-4 h-4" />,
        fn: getOrderCountByDateRange,
        graphIndex: StatisticGraph.ordersGraph,
    },
    {
        name: "Revenue",
        icon: <Banknote className="w-4 h-4" />,
        fn: getOrderRevenueByDateRange,
        graphIndex: StatisticGraph.ordersGraph,
    },
    {
        name: "Income",
        icon: <Coins className="w-4 h-4" />,
        fn: getOrderIncomeByDateRange,
        graphIndex: StatisticGraph.ordersGraph,
    },
    {
        name: "Expenses",
        icon: <Receipt className="w-4 h-4" />,
        fn: getExpenseSumByDateRange,
        graphIndex: StatisticGraph.expensesGraph,
    },
    {
        name: "Payments In",
        icon: <Wallet className="w-4 h-4" />,
        fn: getPaymentSumByDateRange,
        graphIndex: StatisticGraph.paymentsGraph,
    }
]
