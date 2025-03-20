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

export const columnsPayment: ColumnDef<any>[] = [
    
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
    },
    {
      accessorKey: "transactions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment" />
      ),
    },
    {
      accessorKey: "payments",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Amount" />
      ),
    },
  ];

  export const columnsExpenses: ColumnDef<any>[] = [
    
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
    },
    {
      accessorKey: "totalExpenses",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Amount" />
      ),
    },
    {
      accessorKey: "totalExpensesCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Count" />
      ),
    },
  ];
  
  