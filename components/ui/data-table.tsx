"use client"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, Eye, Calendar, Store } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMediaQuery } from "@/hooks/use-media-query"
import { format } from "date-fns"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchColumn?: string
  searchPlaceholder?: string
  currency?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn = "orderNumber",
  searchPlaceholder = "Search orders...",
  currency = "USD",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedRow, setSelectedRow] = useState<TData | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Check if we're on mobile
  const isMobile = useMediaQuery("(max-width: 768px)")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Get the column to filter if it exists
  const filterColumn = table.getColumn(searchColumn)

  // Function to open details modal
  const openDetails = (row: TData) => {
    setSelectedRow(row)
    setDetailsOpen(true)
  }

  // Helper to get value from a row safely
  const getRowValue = (row: TData, key: string): any => {
    try {
      // @ts-ignore - We're being dynamic here
      return row[key]
    } catch {
      return undefined
    }
  }

  // Format date values
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return format(date, "MMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  // Format currency values
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return ""
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  // Get status badge variant based on status value
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusLower = status.toLowerCase()
    if (
      statusLower.includes("active") ||
      statusLower.includes("completed") ||
      statusLower.includes("paid") ||
      statusLower.includes("success") ||
      statusLower.includes("ready")
    ) {
      return "default"
    } else if (
      statusLower.includes("pending") ||
      statusLower.includes("processing") ||
      statusLower.includes("preparing")
    ) {
      return "secondary"
    } else if (
      statusLower.includes("cancel") ||
      statusLower.includes("error") ||
      statusLower.includes("failed") ||
      statusLower.includes("rejected")
    ) {
      return "destructive"
    }
    return "outline"
  }

  return (
    <div className="w-full">
      {/* Search and page size controls */}
      <div className="flex flex-col sm:flex-row sm:items-center py-4 gap-3">
        {filterColumn && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(filterColumn.getFilterValue() as string) ?? ""}
              onChange={(event) => filterColumn.setFilterValue(event.target.value)}
              className="w-full pl-8"
            />
          </div>
        )}

        <div className="flex items-center ml-auto gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">Rows per page:</span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table View */}
      {!isMobile && (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      // Get any custom class names from column definition
                      const meta = header.column.columnDef.meta as { className?: string } | undefined

                      return (
                        <TableHead key={header.id} className={meta?.className}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => {
                        // Get any custom class names from column definition
                        const meta = cell.column.columnDef.meta as { className?: string } | undefined

                        return (
                          <TableCell key={cell.id} className={meta?.className}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        )
                      })}
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
        </div>
      )}

      {/* Mobile Card View - Optimized for OrderType */}
      {isMobile && (
        <div className="space-y-3">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const order = row.original

              // Extract key information for the card
              const orderNumber = getRowValue(order, "orderNumber") || "No Order #"
              const orderStatus = getRowValue(order, "orderStatus")
              const finalPrice = getRowValue(order, "finalPrice") || getRowValue(order, "totalPrice")
              const createdAt = getRowValue(order, "createdAt")
              const branchName = getRowValue(order, "branchName")

              return (
                <Card key={row.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">{orderNumber}</h3>
                        {branchName && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Store className="h-3 w-3 mr-1" />
                            {branchName.toString()}
                          </div>
                        )}
                        {createdAt && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(createdAt.toString())}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {orderStatus && (
                          <Badge variant={getStatusVariant(orderStatus.toString())} className="ml-auto">
                            {orderStatus.toString()}
                          </Badge>
                        )}
                        {finalPrice !== undefined && (
                          <span className="font-medium text-sm">{formatCurrency(finalPrice as number)}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 pt-0 flex justify-end border-t">
                    <Button variant="ghost" size="sm" onClick={() => openDetails(order)}>
                      <Eye className="h-4 w-4 mr-1" /> View Details
                    </Button>
                  </CardFooter>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-10 text-muted-foreground">No results found</div>
          )}
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length,
          )}{" "}
          of {table.getFilteredRowModel().rows.length} entries
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0 sm:w-auto sm:px-3"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-2" />
            <span className="sr-only sm:not-sr-only">Previous</span>
          </Button>

          <div className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0 sm:w-auto sm:px-3"
          >
            <span className="sr-only sm:not-sr-only">Next</span>
            <ChevronRight className="h-4 w-4 sm:ml-2" />
          </Button>
        </div>
      </div>

      {/* Details Modal - Shows all OrderType fields */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Order{" "}
              {selectedRow && getRowValue(selectedRow, "orderNumber")
                ? getRowValue(selectedRow, "orderNumber")
                : "Details"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedRow && (
              <div className="space-y-4 py-2">
                {/* Order Number */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium">Order #</div>
                  <div className="text-sm col-span-2">{getRowValue(selectedRow, "orderNumber") || "—"}</div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-sm col-span-2">
                    {getRowValue(selectedRow, "orderStatus") ? (
                      <Badge variant={getStatusVariant(getRowValue(selectedRow, "orderStatus").toString())}>
                        {getRowValue(selectedRow, "orderStatus").toString()}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>

                {/* Branch */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium">Branch</div>
                  <div className="text-sm col-span-2">{getRowValue(selectedRow, "branchName") || "—"}</div>
                </div>

                {/* Created Date */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm col-span-2">
                    {getRowValue(selectedRow, "createdAt")
                      ? formatDate(getRowValue(selectedRow, "createdAt").toString())
                      : "—"}
                  </div>
                </div>

                {/* Ordered Date */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium">Ordered</div>
                  <div className="text-sm col-span-2">
                    {getRowValue(selectedRow, "orderedDate")
                      ? formatDate(getRowValue(selectedRow, "orderedDate").toString())
                      : "—"}
                  </div>
                </div>

                {/* Required Date */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium">Required</div>
                  <div className="text-sm col-span-2">
                    {getRowValue(selectedRow, "requiredDate")
                      ? formatDate(getRowValue(selectedRow, "requiredDate").toString())
                      : "—"}
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-semibold mb-2">Pricing</h3>

                  {/* Total Price */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Total</div>
                    <div className="text-sm col-span-2">
                      {getRowValue(selectedRow, "totalPrice") !== undefined
                        ? formatCurrency(getRowValue(selectedRow, "totalPrice"))
                        : "—"}
                    </div>
                  </div>

                  {/* Discount */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Discount</div>
                    <div className="text-sm col-span-2">
                      {getRowValue(selectedRow, "discount") !== undefined
                        ? formatCurrency(getRowValue(selectedRow, "discount"))
                        : "—"}
                    </div>
                  </div>

                  {/* Rounding */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Rounding</div>
                    <div className="text-sm col-span-2">
                      {getRowValue(selectedRow, "rounding") !== undefined
                        ? formatCurrency(getRowValue(selectedRow, "rounding"))
                        : "—"}
                    </div>
                  </div>

                  {/* Final Price */}
                  <div className="grid grid-cols-3 gap-2 font-medium">
                    <div className="text-sm">Final Price</div>
                    <div className="text-sm col-span-2">
                      {getRowValue(selectedRow, "finalPrice") !== undefined
                        ? formatCurrency(getRowValue(selectedRow, "finalPrice"))
                        : "—"}
                    </div>
                  </div>
                </div>

                {/* IDs Section */}
                <div className="pt-2 border-t">
                  <h3 className="text-sm font-semibold mb-2">Reference IDs</h3>

                  {/* Order ID */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Order ID</div>
                    <div className="text-sm col-span-2 break-all">{getRowValue(selectedRow, "id") || "—"}</div>
                  </div>

                  {/* Waiter ID */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Waiter ID</div>
                    <div className="text-sm col-span-2 break-all">{getRowValue(selectedRow, "waiterId") || "—"}</div>
                  </div>

                  {/* Branch ID */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Branch ID</div>
                    <div className="text-sm col-span-2 break-all">{getRowValue(selectedRow, "branchId") || "—"}</div>
                  </div>

                  {/* Company ID */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Company ID</div>
                    <div className="text-sm col-span-2 break-all">{getRowValue(selectedRow, "companyId") || "—"}</div>
                  </div>
                </div>

                {/* Order Lines Summary */}
                {getRowValue(selectedRow, "orderLines") && getRowValue(selectedRow, "orderLines").length > 0 && (
                  <div className="pt-2 border-t">
                    <h3 className="text-sm font-semibold mb-2">Order Items</h3>
                    <div className="text-sm">{getRowValue(selectedRow, "orderLines").length} item(s) in this order</div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
