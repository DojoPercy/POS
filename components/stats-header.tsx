"use client"

import { Utensils, DollarSign, TrendingUp, Users, Clock } from 'lucide-react'

import {
    getHighestOrderInBranch,
    getOrderCountByDateRange,
    getOrderRevenueByDateRange,
    
    getOrderSummaryByDateRange,
} from "@/lib/order"
import { paymentService } from '@/lib/payment'

enum StatisticGraph {
    ordersGraph,
    customersGraph,
    serviceTimeGraph,
    paymentGraph,
}

export type StatisticHeaderDef = {
    name: string
    icon: JSX.Element
    call: (from: Date, to: Date, branchId?: string, companyId?: string) => Promise<number>
    graphIndex: number
    accessorKey: string
}

type StatisticFnDef<TValue> = {
    index: number,
    call: (from: Date, to: Date, branchId?: string, companyId?: string) => Promise<TValue>
} 
type StatisticFnDefP<TValue> = {
    index: number,
    call: (from: Date, to: Date, companyId: string, branchId?: string) => Promise<TValue>
} 

export const StatisticHeaders: StatisticHeaderDef[] = [
    {
        name: "Total Orders",
        icon: <Utensils className="w-4 h-4" />,
        call: getOrderCountByDateRange,
        graphIndex: StatisticGraph.ordersGraph,
        accessorKey: "sales",
    },
    {
        name: "Revenue",
        icon: <DollarSign className="w-4 h-4" />,
        call: getOrderRevenueByDateRange,
        graphIndex: StatisticGraph.ordersGraph,
        accessorKey: "revenue",
    },
    {
        name: "Payments",
        icon: <TrendingUp className="w-4 h-4" />,
        call: paymentService.getPaymentByDateRange,
        graphIndex: StatisticGraph.paymentGraph,
        accessorKey: "payments"
    }
  
]

export const StatisticFns: StatisticFnDef<any[]>[] = [
    {
        index: StatisticGraph.ordersGraph,
        call: getOrderSummaryByDateRange,
    },
    
   
]


export const StatisticFnsP: StatisticFnDefP<any[]>[] = [
    {
        index: StatisticGraph.paymentGraph,
        call: paymentService.getPaymentSummaryByDateRangeOwner,
    },
    
   
]

