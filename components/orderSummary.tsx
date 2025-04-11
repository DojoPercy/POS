"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
  Printer,
  Check,
  FileText,
  CreditCard,
  Banknote,
  Receipt,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { PriceType, MenuItem, OrderType, Company, CreatePaymentRequest } from "../lib/types/types"
import { useDispatch, useSelector } from "react-redux"
import { placeOrder, updateOrder } from "../redux/orderSlice"
import { selectUser, fetchUserFromToken } from "../redux/authSlice"
import { getOrderCounter } from "../lib/order"
import type { OrderLine } from "../lib/types/types"
import { OrderStatus } from "../lib/enums/enums"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RestaurantReceipt } from "./receipt"
import { useRouter } from "next/navigation"
import { sendPayment } from "@/redux/paymentSlice"
import { getCompanyDetails } from "@/redux/companySlice"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"

type CartItem = {
  menuItem: MenuItem
  selectedPrice: PriceType
  quantity: number
  notes?: string
}

type OrderSummaryProps = {
  cart: CartItem[]
  updateQuantity: (index: number, quantity: number) => void
  updateNotes: (index: number, notes: string) => void
  onClose?: () => void
  onCheckout?: () => void
  orderId?: string
  isEditingExistingOrder?: boolean
  orderNumber?: string
}

export default function OrderSummary({
  cart,
  updateQuantity,
  updateNotes,
  onClose,
  onCheckout,
  orderId,
  orderNumber,
  isEditingExistingOrder = false,
}: OrderSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receivedAmount, setReceivedAmount] = useState<number>(0)
  const [paymentType, setPaymentType] = useState<string>("Cash")
  const [discount, setDiscount] = useState<number>(0)
  const [rounding, setRounding] = useState<number>(0)
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null)
  const [noteText, setNoteText] = useState<string>("")
  const receiptRef = useRef<HTMLDivElement | null>(null)
  const [paymentTypeSelected, setPaymentTypeSelected] = useState<string[]>([])

  const { toast } = useToast()
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector(selectUser)

  const company = useSelector((state: any) => state.company.company) as Company

  useEffect(() => {
    dispatch(fetchUserFromToken())
  }, [dispatch, user?.companyId])

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId))
    }
  }, [dispatch, user?.companyId])

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.selectedPrice.price * item.quantity, 0)
  }, [cart])

  const tax = useMemo(() => (company ? subtotal * company.taxRate : 0), [subtotal, company])
  const totalWithTax = useMemo(() => subtotal + tax, [subtotal, tax])
  const finalPrice = useMemo(() => totalWithTax - discount + rounding, [totalWithTax, discount, rounding])
  const balance = useMemo(() => receivedAmount - finalPrice, [receivedAmount, finalPrice])

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Order",
        description: "Please add items to your order first",
        variant: "destructive",
      })
      return
    }

    if (onCheckout) {
      onCheckout()
    } else if (isEditingExistingOrder) {
      const newOrder: OrderType = {
        waiterId: user?.userId,
        branchId: user?.branchId,
        orderLines: cart.map(
          (line) =>
            ({
              menuItemId: line.menuItem.id,
              quantity: line.quantity,
              price: line.selectedPrice.price,
              totalPrice: line.selectedPrice.price * line.quantity,
              notes: line.notes || "",
            }) as OrderLine,
        ),
        totalPrice: totalWithTax,
        orderStatus: OrderStatus.PENDING,
        requiredDate: new Date().toISOString(),
      }

      dispatch(updateOrder(newOrder))
      setReceivedAmount(finalPrice) // Set default received amount

      toast({
        title: "Order Updated",
        description: `Order #${orderNumber} has been updated`,
      })
    } else {
      setIsProcessing(true)
      const orderNum = await getOrderCounter(user?.branchId || "")

      toast({
        title: `Order #${orderNum}`,
        description: "Order Creating...",
        variant: "default",
      })

      const newOrder: OrderType = {
        waiterId: user?.userId,
        branchId: user?.branchId,
        companyId: user?.companyId,
        orderLines: cart.map(
          (line) =>
            ({
              menuItemId: line.menuItem.id,
              quantity: line.quantity,
              price: line.selectedPrice.price,
              totalPrice: line.selectedPrice.price * line.quantity,
              notes: line.notes || "",
            }) as OrderLine,
        ),
        totalPrice: totalWithTax,
        orderStatus: OrderStatus.PENDING,
        requiredDate: new Date().toISOString(),
        orderNumber: orderNum,
      }

      dispatch(placeOrder(newOrder))

      setTimeout(() => {
        toast({
          title: "Order Placed!",
          description: `Your order total is ${company?.currency || "$"}${totalWithTax.toFixed(2)}`,
        })
        setIsProcessing(false)
      }, 1500)
    }
  }

  const handleCheckOutOrder = () => {
    // Open checkout modal
    setShowCheckoutModal(true)
    setReceivedAmount(finalPrice)
  }

  const handleCompleteCheckout = async () => {
    try {
      setIsProcessing(true)

      // Create payment record
      const payment: CreatePaymentRequest = {
        amount: receivedAmount,
        orderId: orderId || "",
        currency: company.currency,
        paymentStatus: "Completed",
        companyId: user?.companyId || "",
        branchId: user?.branchId || "",
      }

      dispatch(sendPayment(payment))

      const checkOutOrder: OrderType = {
        id: orderId,
        waiterId: user?.userId,
        branchId: user?.branchId,
        companyId: user?.companyId,
        orderLines: cart.map(
          (line) =>
            ({
              menuItemId: line.menuItem.id,
              quantity: line.quantity,
              price: line.selectedPrice.price,
              totalPrice: line.selectedPrice.price * line.quantity,
              notes: line.notes || "",
            }) as OrderLine,
        ),
        totalPrice: subtotal,
        discount: discount,
        rounding: rounding,
        finalPrice: finalPrice,
        orderStatus: OrderStatus.PAID,
        updatedAt: new Date().toISOString(),
      }

      await dispatch(updateOrder(checkOutOrder))

      // Close checkout modal and show receipt
      setShowCheckoutModal(false)
      setShowReceipt(true)

      toast({
        title: "Order Checked Out!",
        description: `Order #${orderNumber} has been completed`,
      })
    } catch (error) {
      console.error("Error checking out order:", error)
      toast({
        title: "Error",
        description: "Failed to checkout order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "", "width=600,height=600")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                @media print {
                  body { width: 300px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; }
                  h1, h2, h3 { margin: 8px 0; }
                  table { width: 100%; border-collapse: collapse; }
                  th, td { padding: 4px 0; text-align: left; }
                  .text-right { text-align: right; }
                  .border-top { border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px; }
                  img { display: block !important; max-width: 100px !important; }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const handleDone = () => {
    setShowReceipt(false)
    router.push("/")
  }

  const handlePaymentTypeChange = (paymentType: string) => {
    setPaymentTypeSelected((prevSelected) => {
      if (prevSelected.includes(paymentType)) {
        return prevSelected.filter((type) => type !== paymentType)
      }
      return [...prevSelected, paymentType]
    })
  }

  const openNoteDialog = (index: number) => {
    setEditingNoteIndex(index)
    setNoteText(cart[index].notes || "")
  }

  const saveNote = () => {
    if (editingNoteIndex !== null) {
      updateNotes(editingNoteIndex, noteText)
      setEditingNoteIndex(null)
      setNoteText("")
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return <Banknote className="h-4 w-4 mr-2" />
      case "credit card":
      case "card":
        return <CreditCard className="h-4 w-4 mr-2" />
      default:
        return <Receipt className="h-4 w-4 mr-2" />
    }
  }

  return (
    <>
      <Card className="h-[85%] flex flex-col shadow-md border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-gray-50">
          <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
            <ShoppingCart className="h-5 w-5" />
            {isEditingExistingOrder ? `Order #${orderNumber}` : "Your Order"}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex-1 p-0 h-[90vh]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Your order is empty</p>
              <p className="text-sm text-gray-400 mt-2">Add items from the menu to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(91vh-350px)] lg:h-[calc(91vh-250px)]">
              <div className="px-4 py-2">
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${item.menuItem.id}-${item.selectedPrice.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      className="py-3"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.menuItem.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.selectedPrice.name} - {company?.currency || "$"}
                            {item.selectedPrice.price.toFixed(2)}
                          </p>
                          {item.notes && (
                            <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded-md border border-gray-100 flex items-start">
                              <FileText className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{item.notes}</span>
                            </div>
                          )}
                        </div>
                        <p className="font-medium text-gray-800">
                          {company?.currency || "$"}
                          {(item.selectedPrice.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <div className="flex items-center border rounded-md shadow-sm">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="h-3 w-3 text-red-500" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </Button>
                            <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-7 text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => openNoteDialog(index)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {item.notes ? "Edit note" : "Add note"}
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(index, 0)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <Separator className="mt-3" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>

        <CardFooter className="flex-col p-4 pt-2 bg-gray-50 border-t">
          <div className="w-full space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {company ? company.currency : ""}
                {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({(company?.taxRate * 100).toFixed(0)}%)</span>
              <span className="font-medium">
                {company ? company.currency : ""}
                {tax.toFixed(2)}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                {company ? company.currency : ""}
                {totalWithTax.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
            size="lg"
            disabled={cart.length === 0 || isProcessing}
            onClick={handlePlaceOrder}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Processing...
              </div>
            ) : isEditingExistingOrder ? (
              "Update Order"
            ) : (
              "Place Order"
            )}
          </Button>

          {isEditingExistingOrder && (
            <Button
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckOutOrder}
            >
              <Check className="mr-2 h-4 w-4" /> Checkout Order
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Note Dialog */}
      <Dialog open={editingNoteIndex !== null} onOpenChange={(open) => !open && setEditingNoteIndex(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Item Note</DialogTitle>
            <DialogDescription>Add special instructions or notes for this item</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="E.g., No onions, extra spicy, etc."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNoteIndex(null)}>
              Cancel
            </Button>
            <Button onClick={saveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditingExistingOrder ? `Checkout Order #${orderNumber}` : "Checkout"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-gray-700">
                Discount
              </Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                className="border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rounding" className="text-gray-700">
                Rounding
              </Label>
              <Input
                id="rounding"
                type="number"
                step="0.01"
                value={rounding}
                onChange={(e) => setRounding(Number.parseFloat(e.target.value) || 0)}
                className="border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Payment Method</Label>
              <div className="space-y-2 mt-1">
                {company?.paymentMethods?.map((paymentMethod: string) => (
                  <div
                    key={paymentMethod}
                    className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                      paymentTypeSelected.includes(paymentMethod)
                        ? "bg-primary/10 border-primary"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handlePaymentTypeChange(paymentMethod)}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center mr-2 ${
                        paymentTypeSelected.includes(paymentMethod) ? "bg-primary text-white" : "border border-gray-300"
                      }`}
                    >
                      {paymentTypeSelected.includes(paymentMethod) && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex items-center">
                      {getPaymentMethodIcon(paymentMethod)}
                      <span>{paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="received-amount" className="text-gray-700">
                Received Amount
              </Label>
              <Input
                id="received-amount"
                type="number"
                min={finalPrice}
                step="0.01"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(Number.parseFloat(e.target.value) || 0)}
                className="border-gray-200"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {company ? company.currency : ""}
                  {subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({(company?.taxRate * 100).toFixed(0)}%):</span>
                <span className="font-medium">
                  {company ? company.currency : ""}
                  {tax.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-500">
                  -{company ? company.currency : ""}
                  {discount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rounding:</span>
                <span className="font-medium">
                  {company ? company.currency : ""}
                  {rounding.toFixed(2)}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>
                  {company ? company.currency : ""}
                  {finalPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between font-medium">
                <span>Balance:</span>
                <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
                  {company ? company.currency : ""}
                  {balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckoutModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCompleteCheckout}
              disabled={isProcessing || receivedAmount < finalPrice || paymentTypeSelected.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center">
                  <Check className="mr-2 h-4 w-4" /> Complete Order
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Receipt</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div ref={receiptRef} className="bg-white p-4 rounded-lg">
              <RestaurantReceipt
                order={{
                  orderLines: cart.map((item) => ({
                    name: item.menuItem.name,
                    quantity: item.quantity,
                    price: item.selectedPrice.price,
                    totalPrice: item.selectedPrice.price * item.quantity,
                    notes: item.notes,
                  })),
                  totalPrice: subtotal,
                  discount: discount,
                  rounding: rounding,
                  finalPrice: finalPrice,
                  paymentType: paymentTypeSelected.join(", "),
                  receivedAmount: receivedAmount,
                  balance: balance,
                }}
                company={company}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" /> Print Receipt
            </Button>
            <Button className="w-full sm:w-auto bg-primary" onClick={handleDone}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

