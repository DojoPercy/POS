"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"

import Link from "next/link"
import { OrderType } from "@/lib/types/types"



export const columns: ColumnDef<OrderType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order Number" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("orderNumber")}</div>,
  },
  {
    accessorKey: "waiterId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Waiter ID" />,
  },
  {
    accessorKey: "branchName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Branch" />,
    cell: ({ row }) => {
      console.log(row.getValue(""))
      return <div className="font-medium">{row.getValue("branchName")}</div>;
    }
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Price" />,
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("totalPrice"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "finalPrice",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Final Price" />,
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("finalPrice"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "isCompleted",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Completed" />,
    cell: ({ row }) => {
      const isCompleted = row.getValue("isCompleted")
      return (
        <div className={`font-medium ${isCompleted ? "text-green-600" : "text-red-600"}`}>
          {isCompleted ? "Yes" : "No"}
        </div>
      )
    },
  },
  {
    accessorKey: "isCheckedOut",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Checked Out" />,
    cell: ({ row }) => {
      const isCheckedOut = row.getValue("isCheckedOut")
      return (
        <div className={`font-medium ${isCheckedOut ? "text-green-600" : "text-red-600"}`}>
          {isCheckedOut ? "Yes" : "No"}
        </div>
      )
    },
  },
  {
    accessorKey: "requiredDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Required Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("requiredDate"))
      return <div>{date.toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div>{date.toLocaleString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original

      return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.orderNumber!)}>
            Copy Order Number
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem >
            <Link href={`/waiter/order/${order.id}`} passHref>
            <Eye className="mr-2 h-4 w-4" />
            View Order Details</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Update Order Status</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      )
    },
  },
]

