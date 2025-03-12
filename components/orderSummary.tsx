"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PriceType, MenuItem, OrderType } from '@/lib/types/types';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder } from "@/redux/orderSlice"
import { selectUser, fetchUserFromToken } from '@/redux/authSlice';
import { getOrderCounter } from '@/lib/order';
import { OrderLine } from '../lib/types/types';
import { OrderStatus } from "@/lib/enums/enums"




type CartItem = {
  menuItem: MenuItem
  selectedPrice: PriceType
  quantity: number
}

type OrderSummaryProps = {
  cart: CartItem[]
  updateQuantity: (index: number, quantity: number) => void
  onClose?: () => void
}

export default function OrderSummary({ cart, updateQuantity, onClose }: OrderSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);




  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + item.selectedPrice.price * item.quantity, 0)

  // Calculate tax (assuming 8%)
  const tax = subtotal * 0.08

  // Calculate total
  const total = subtotal + tax

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Order",
        description: "Please add items to your order first",
        variant: "destructive",
      })
      return
    }
    const orderNumber = await getOrderCounter(user?.branchId || "")
    setIsProcessing(true)
    const newOrder: OrderType = {
        waiterId: user?.userId,
        branchId: user?.branchId,
        orderLines: cart.map((line) => ({
          menuItemId: line.menuItem.id,
          quantity: line.quantity,
          price: line.selectedPrice.price,
          totalPrice: line.selectedPrice.price * line.quantity,
        } as OrderLine)),
        totalPrice: total,
        OrderStatus: OrderStatus.PENDING,
        requiredDate: new Date().toISOString(),
        orderNumber: orderNumber,
      }
    dispatch(placeOrder(newOrder))
    // Simulate order processing
    setTimeout(() => {
      toast({
        title: "Order Placed!",
        description: `Your order total is $${total.toFixed(2)}`,
      })
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Your Order
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your order is empty</p>
            <p className="text-sm text-muted-foreground mt-2">Add items from the menu to get started</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-350px)] lg:h-[calc(100vh-250px)]">
            <div className="px-4 py-2">
              {cart.map((item, index) => (
                <div key={`${item.menuItem.id}-${item.selectedPrice.id}`} className="py-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <p className="font-medium">{item.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.selectedPrice.name} - ${item.selectedPrice.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">${(item.selectedPrice.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="h-3 w-3 text-destructive" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                      </Button>
                      <span className="w-7 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(index, 0)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter className="flex-col p-4 pt-2">
        <div className="w-full space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <Button className="w-full" size="lg" disabled={cart.length === 0 || isProcessing} onClick={handlePlaceOrder}>
          {isProcessing ? "Processing..." : "Place Order"}
        </Button>
      </CardFooter>
    </Card>
  )
}

