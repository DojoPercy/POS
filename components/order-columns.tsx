"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";
import Link from "next/link";
import { OrderType } from "@/lib/types/types";

export const columns = (companyCurrency: string): ColumnDef<OrderType>[] => [
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
    cell: ({ row }) => <div className="font-medium">{row.getValue("branchName")}</div>,
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Price" />,
    cell: ({ row }) => {
      const amount = Number(row.getValue("totalPrice")) || 0;
     
      return <div className="font-medium">{companyCurrency}{amount}</div>;
    },
  },
  {
    accessorKey: "finalPrice",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Final Price" />,
    cell: ({ row }) => {
      const amount = Number(row.getValue("finalPrice")) || 0;
      const supportedCurrencies = ["USD", "EUR", "NGN", "GBP", "CAD", "GHS"];
      const currency = supportedCurrencies.includes(companyCurrency) ? companyCurrency : "USD";
  
      
      return <div className="font-medium">{currency}{amount}</div>;
    },
  },
  
  {
    accessorKey: "orderStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Completed" />,
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;
      const isCompleted = status === "PAID" || status === "COMPLETED";
      return (
        <div className={`font-medium ${isCompleted ? "text-green-600" : "text-red-600"}`}>
          {isCompleted ? "Yes" : "No"}
        </div>
      );
    },
  },
  {
    accessorKey: "orderStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Checked Out" />,
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;
      const isCheckedOut = status === "PAID";
      return (
        <div className={`font-medium ${isCheckedOut ? "text-green-600" : "text-red-600"}`}>
          {isCheckedOut ? "Yes" : "No"}
        </div>
      );
    },
  },
  {
    accessorKey: "requiredDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Required Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("requiredDate") || "");
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") || "");
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.orderNumber || "")}>
              Copy Order Number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/waiter/order/${order.id}`} passHref className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                View Order Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Update Order Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
