"use client"
import { useState, useEffect } from "react"
import { RefreshCw, Download, Plus, Filter, Edit, Trash2, User, Package } from "lucide-react"
import { getOrders } from "@/lib/order"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "@/components/ui/date-time-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { jwtDecode } from "jwt-decode"
import type { Company, OrderType } from "@/lib/types/types"
import { OrderStatus } from "@/lib/enums/enums"
import { useDispatch, useSelector } from "react-redux"
import { fetchUserFromToken, selectUser } from "@/redux/authSlice"
import { getCompanyDetails } from "@/redux/companySlice"

interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  companyId?: string
  [key: string]: any
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
    case "PAID":
      return "bg-green-100 text-green-800 border-green-200"
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200"
    case "PROCESSING":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "PAID":
      return "Completed"
    case "PENDING":
      return "Pending"
    case "CANCELLED":
      return "Error"
    case "PROCESSING":
      return "Processing"
    default:
      return status
  }
}

export default function OrdersManagement() {
  const [refresh, setRefresh] = useState(true)
  const [data, setData] = useState<OrderType[]>([])
  const [filteredData, setFilteredData] = useState<OrderType[]>([])
  const [showCompleted, setShowCompleted] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })

  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const company = useSelector((state: any) => state.company.company) as Company

  useEffect(() => {
    dispatch(fetchUserFromToken())
  }, [dispatch])

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId))
    }
  }, [dispatch, user?.companyId])

  useEffect(() => {
    if (!refresh) return
    setData([])
    fetchOrdersData()
  }, [refresh])

  useEffect(() => {
    applyFilters()
  }, [showCompleted, dateRange, data, searchTerm])

  const fetchOrdersData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Token not found")
        return
      }

      const decodedToken: DecodedToken = jwtDecode(token)
      const orders = await getOrders(decodedToken.companyId ?? "", undefined)

      const updatedOrders = orders
        .map((order: any) => ({
          ...order,
          branchName: order.branch?.name || "Unknown Branch",
          customerName: `Customer #${order.orderNumber?.slice(-3) || order.id?.slice(-4)}`,
          pickupNumber: order.orderNumber || `P${Math.floor(Math.random() * 9000) + 1000}`,
          // Map orderLines to include menu item details
          orderLines:
            order.orderLines?.map((line: any) => ({
              ...line,
              menu: line.menuItem, // Map menuItem to menu for consistency
              sellUnitPrice: line.price,
            })) || [],
        }))
        .reverse()

      setData(updatedOrders)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setRefresh(false)
    }
  }

  const applyFilters = () => {
    let filtered = data

    if (!showCompleted) {
      filtered = filtered.filter((order) => !(order.orderStatus === OrderStatus.PAID))
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.branchName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt!)
        return orderDate >= dateRange.from! && orderDate <= dateRange.to!
      })
    }

    setFilteredData(filtered)
  }

  const handleOrderClick = (order: OrderType) => {
    setSelectedOrder(order)
    setSidebarOpen(true)
  }

  const handleStatusChange = (newStatus: string) => {
    if (selectedOrder) {
      const updatedOrder = { ...selectedOrder, orderStatus: newStatus as any }
      setSelectedOrder(updatedOrder)
      setData(data.map((order) => (order.id === selectedOrder.id ? updatedOrder : order)))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all restaurant orders</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setRefresh(true)} disabled={refresh}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refresh ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {/* <Button className="bg-gradient-to-br from-blue-500 to-purple-500 hover:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button> */}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Orders</Label>
                <Input
                  id="search"
                  placeholder="Order number, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Date Range</Label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="show-completed"
                  checked={showCompleted}
                  onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
                />
                <Label htmlFor="show-completed">Show Completed Orders</Label>
              </div>

              <div className="flex items-end">
                <Button variant="secondary" onClick={applyFilters} className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">ORDER</TableHead>
                    <TableHead className="font-semibold">PICKUP</TableHead>
                    <TableHead className="font-semibold">CUSTOMER</TableHead>
                    <TableHead className="font-semibold">BRANCH</TableHead>
                    <TableHead className="font-semibold">ITEM</TableHead>
                    <TableHead className="font-semibold">PRICE</TableHead>
                    <TableHead className="font-semibold">DESCRIPTION</TableHead>
                    <TableHead className="font-semibold">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleOrderClick(order)}
                    >
                      <TableCell className="font-medium text-gray-900">{order.orderNumber}</TableCell>
                      <TableCell className="text-gray-600">{order.orderNumber || ''}</TableCell>
                      <TableCell className="text-gray-600">{ "walk in"}</TableCell>
                      <TableCell className="text-gray-600">{order.branchName}</TableCell>
                      <TableCell className="text-gray-600">
                        {order.orderLines?.[0]?.menuItem?.name || "No items"}
                        {order.orderLines?.length! > 1 && ` +${order.orderLines!.length - 1} more`}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {company?.currency || "$"}
                        {order.finalPrice || order.totalPrice}
                      </TableCell>
                      <TableCell className="text-gray-500 max-w-xs truncate">
                        {order.orderLines?.[0]?.notes || "No special instructions"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.orderStatus?.toString() || "PENDING")} border`}>
                          {getStatusText(order.orderStatus?.toString() || "PENDING")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your filters or create a new order</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {selectedOrder && (
              <>
                <SheetHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-2xl font-bold">{selectedOrder.orderNumber}</SheetTitle>
                    <Badge className={`${getStatusColor(selectedOrder.orderStatus?.toString() || "PENDING")} border`}>
                      {getStatusText(selectedOrder.orderStatus?.toString() || "PENDING")}
                    </Badge>
                  </div>
                  <p className="text-gray-500">
                    {new Date(selectedOrder.createdAt!).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    • {new Date(selectedOrder.createdAt!).toLocaleTimeString()}
                  </p>
                </SheetHeader>

                <div className="space-y-6">
                  {/* Order Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Order Details
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order number</span>
                        <span className="font-medium">{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date</span>
                        <span className="font-medium">
                          {new Date(selectedOrder.orderedDate || selectedOrder.createdAt!).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Required Date</span>
                        <span className="font-medium">{new Date(selectedOrder.requiredDate!).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Branch</span>
                        <span className="font-medium">{selectedOrder.branchName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Price</span>
                        <span className="font-medium text-lg">
                          {company?.currency || "$"}
                          {selectedOrder.finalPrice || selectedOrder.totalPrice}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status</span>
                        <Select value={selectedOrder.orderStatus} onValueChange={handleStatusChange}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="PAID">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Customer Details
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer name</span>
                        <span className="font-medium">{"walk in"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pickup number</span>
                        <span className="font-medium">{selectedOrder.orderNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {selectedOrder.orderLines && selectedOrder.orderLines.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.orderLines.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{item.menuItem?.name || "Menu Item"}</h4>
                                <p className="text-sm text-gray-500">{item.menuItem?.description}</p>
                              </div>
                              <span className="font-medium">
                                {company?.currency || "$"}
                                {item.price}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Quantity: {item.quantity}</span>
                              <span>
                                Total: {company?.currency || "$"}
                                {item.totalPrice}
                              </span>
                            </div>
                            {item.notes && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Notes: </span>
                                {item.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Order
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
