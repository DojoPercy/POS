/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTablePagination } from "./dataTablePagination";
import { DataTableViewOptions } from "./dataTableViewOptions";

// MenuItem type definition
export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageBase64: string;
  imageUrl: string;
  category: string;
  available: boolean;
};

// Define columns for MenuItem
export const columns: ColumnDef<MenuItem>[] = [
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
        aria-label="Select"
      />
    ),
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "imageBase64",
    header: "Image",
    cell: ({ row }) => {
      const imageBase64 = row.getValue<string>("imageBase64");
      console.log(imageBase64);
      return (
        <div className="flex items-center justify-center bg-red-600">
          <img
            src={imageBase64}
            alt="Menu Item"
            className="h-16 w-16 object-cover rounded-md"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue<string | null>("description");
      return description ? (
        <span>{description}</span>
      ) : (
        <span className="text-zinc-400">N/A</span>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue<number>("price");
      return <span>${price.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "available",
    header: "Available",
    cell: ({ row }) => {
      const available = row.getValue<boolean>("available");
      return <span>{available ? "Yes" : "No"}</span>;
    },
  },
];

// DataTable component for MenuItem
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div>
      {/* Search and View Options */}
      <div className="flex relative gap-5">
        <Search className="absolute left-3 h-full flex items-center pointer-events-none transition-colors duration-300 ease-linear ml-2 w-4" />
        <Input
          type="text"
          className="max-full rounded-full bg-zinc-200 text-sm font-medium py-3 pl-12 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-300 focus:outline-none transition-colors duration-300 ease-linear"
          placeholder="Search"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
        />
        <div className="flex my-auto ml-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border mt-10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-2">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
