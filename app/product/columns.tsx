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

import { Product, ProductCategory } from "@prisma/client"

export type ProductList = Product & {
    productCategory: ProductCategory
}

export const columns: ColumnDef<ProductList>[] = [
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
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="name" />
        ),
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="description" />
        ),
        cell: ({ row }) => {
            const description: (string | null) = row.getValue("description")
            if (description !== null) {
                return <div>{description}</div>
            }
            return <div className="text-zinc-400">N/A</div>
        }
    },
    {
        accessorKey: "buyUnitPrice",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="unit price (buy)" />
        ),
    },
    {
        accessorKey: "suggestedUnitPrice",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="unit price (suggested)" />
        ),
    },
    {
        accessorKey: "inStock",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="in stock" />
        ),
    },
    {
        accessorKey: "onOrder",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="on order" />
        ),
    },
    {
        accessorKey: "reorderLevel",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="reorder level" />
        ),
    },
    {
        accessorKey: "productCategory.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="category" />
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