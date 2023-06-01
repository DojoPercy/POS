"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/ui/dataTableColumnHeader"

import { orderProductsSummary } from "@/lib/product"

export type ExpensesList = {

}

export type PaymentsInList = {

}

export const columnsRevenueIncome: ColumnDef<orderProductsSummary | ExpensesList | PaymentsInList>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="name" />
        ),
    },
    {
        accessorKey: "revenue",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="revenue" />
        ),
    },
    {
        accessorKey: "income",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="income" />
        ),
    },
    {
        accessorKey: "sold",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="sold" />
        ),
    },
    {
        accessorKey: "orders",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="orders" />
        ),
    },
]