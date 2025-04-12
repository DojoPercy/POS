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
import Image from "next/image"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Check, X } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableViewOptions } from "./dataTableViewOptions"
import { DataTablePagination } from "./dataTablePagination"
import { PriceType } from "@prisma/client"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [selectedItem, setSelectedItem] = useState<TData | null>(null)
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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  // Function to open details modal
  const openDetails = (item: TData) => {
    setSelectedItem(item)
    setDetailsOpen(true)
  }

  // Helper to get value from a row safely
  const getItemValue = (item: TData, key: string): any => {
    try {
      // @ts-ignore - We're being dynamic here
      return item[key]
    } catch {
      return undefined
    }
  }

  const formatPrice = (price?: PriceType[]) => {
    if (!price || price.length === 0) return ""
  
    const formattedPrices = price
      .filter(p => p.price !== null && p.price !== undefined)
      .map(p => p.price === 0 ? "Free" : `${p.price}`)
  
    return formattedPrices.join(" - ")
  }
  

  return (
    <div className="w-full">
      {/* Search and View Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            className="pl-10 w-full"
            placeholder="Search menu items..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          />
        </div>
        <div className="flex items-center ml-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Desktop Table View */}
      {!isMobile && (
        <div className="rounded-md border mt-6 overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
      )}

      {/* Mobile Card View */}
      {isMobile && (
        <div className="space-y-4 mt-6">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const item = row.original
              const name = getItemValue(item, "name") || "Unnamed Item"
              const price = getItemValue(item, "price")
              const category = getItemValue(item, "category")
              const available = true
              const isAvailable = true
              const imageUrl = getItemValue(item, "imageUrl")
              

              return (
                <Card key={row.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Image */}
                      <div className="w-24 h-24 flex-shrink-0">
                        {imageUrl ? (
                          <Image
                          width={96}
                          height={96}
                            src={imageUrl || "/placeholder.svg"}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                     {/* Content */}
                     <div className="p-3 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-base">{name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {typeof category === "object" && category !== null
                                ? category.name || "Uncategorized"
                                : category || "Uncategorized"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {price !== undefined && <span className="font-medium">{formatPrice(price)}</span>}
                            <Badge variant={available ? "default" : "outline"}>
                              {isAvailable ? (
                                <span className="flex items-center">
                                  <Check className="w-3 h-3 mr-1" /> Available
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <X className="w-3 h-3 mr-1" /> Unavailable
                                </span>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 flex justify-between border-t">
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label="Select"
                    />
                    <Button variant="ghost" size="sm" onClick={() => openDetails(item)}>
                      <Eye className="h-4 w-4 mr-1" /> View Details
                    </Button>
                  </CardFooter>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-10 text-muted-foreground">No menu items found</div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedItem ? getItemValue(selectedItem, "name") : "Menu Item Details"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedItem && (
              <div className="space-y-6">
                {/* Image */}
                <div className="flex justify-center">
                  {getItemValue(selectedItem, "imageUrl") ? (
                    <Image
                    width={96}
                    height={96}
                      src={getItemValue(selectedItem, "imageUrl") || "/placeholder.svg"}
                      alt={getItemValue(selectedItem, "name")}
                      className="h-40 w-40 object-cover rounded-md"
                    />
                  ) : (
                    <div className="h-40 w-40 bg-muted flex items-center justify-center rounded-md">
                      No image available
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  {/* Name */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Name</div>
                    <div className="text-sm col-span-2">{getItemValue(selectedItem, "name") || "—"}</div>
                  </div>

                  {/* Price */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Price</div>
                    <div className="text-sm col-span-2">
                      {getItemValue(selectedItem, "price") !== undefined
                        ? formatPrice(getItemValue(selectedItem, "price"))
                        : "—"}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Category</div>
                    <div className="text-sm col-span-2">
                      {(() => {
                        const category = getItemValue(selectedItem, "category")
                        if (typeof category === "object" && category !== null) {
                          return category.name || "—"
                        }
                        return category || "—"
                      })()}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Availability</div>
                    <div className="text-sm col-span-2">
                      {getItemValue(selectedItem, "available") !== undefined ? (
                        <Badge variant={true? "default" : "outline"}>
                          {true? "Available" : "Unavailable"}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">Description</div>
                    <div className="text-sm col-span-2">
                      {getItemValue(selectedItem, "description") || "No description available"}
                    </div>
                  </div>

                  {/* ID */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium">ID</div>
                    <div className="text-sm col-span-2 break-all">{getItemValue(selectedItem, "id") || "—"}</div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
