"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/dataTableColumnHeader"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu"

import { Order, OrderLine, Payment } from "@prisma/client"

export type TransactionList = Order & {
    orderTotal: number,
    paidStatus: number,
    customer: {
        name: string
    } | null
    employee: {
        name: string
    }
    orderLine: OrderLine[]
    payment: Payment[]
}

export const columns: ColumnDef<TransactionList>[] = [
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
                aria-label="Select all"
            />
        )
    },
    {
        accessorKey: "id",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="id" />
        ),
    },
    {
        accessorKey: "customer",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="customer" />
        ),
        cell: ({ row }) => {
            const customer : {
                name: string
            } | null = row.getValue("customer")
            if (customer !== null) {
                return <div> {customer.name} </div>
            }
            return <div className="text-zinc-400">N/A</div>
        }
    },
    {
        accessorKey: "employee.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="employee" />
        ),
    },
    {
        accessorKey: "orderTotal",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="total" />
        ),
    },
    {
        accessorKey: "orderedDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ordered" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("orderedDate"))
            const formatted = date.toLocaleString("id").replaceAll(".", ":")

            return (
                <div className="h-full flex flex-col">
                    <div>
                        {formatted.split(", ")[0]}
                    </div>
                    <div className="text-zinc-400">
                        {formatted.split(", ")[1]}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "requiredDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="required" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("requiredDate"))
            const formatted = date.toLocaleString("id").replaceAll(".", ":")

            return (
                <div className="h-full flex flex-col">
                    <div>
                        {formatted.split(", ")[0]}
                    </div>
                    <div className="text-zinc-400">
                        {formatted.split(", ")[1]}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "shipmentDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="shipment" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("shipmentDate"))
            const formatted = date.toLocaleString("id").replaceAll(".", ":")

            return (
                <div className="h-full flex flex-col">
                    <div>
                        {formatted.split(", ")[0]}
                    </div>
                    <div className="text-zinc-400">
                        {formatted.split(", ")[1]}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "paymentStatus",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="paid" />
        ),
    },
    {
        id: "actions",
        header: ({ column }) => (
            <MoreHorizontal className="h-4 w-4 mx-auto" />
        ),
        cell: ({ row }) => {
            const data = row.original
 
            return (
                <div className="mx-auto text-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(data.id.toString())} >
                                Copy payment ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View transaction</DropdownMenuItem>
                            <DropdownMenuItem>Cancel transaction</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]