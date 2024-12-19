"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

export const columnsRevenueIncome: ColumnDef<any>[] = [
    {
        accessorKey: "date",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date" />
        ),
    },
    {
        accessorKey: "sales",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Orders" />
        ),
    },
    {
        accessorKey: "revenue",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Revenue" />
        ),
    },
]

