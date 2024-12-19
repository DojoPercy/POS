"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createOrder } from "@/lib/order";
import { getMenuItems } from "@/lib/menu";

import { fetchUsers } from "@/lib/auth";
import { ClipLoader } from "react-spinners";
import Alert from "@mui/material/Alert/Alert";
import { AlertDescription } from "./ui/alert";
import { RestaurantReceipt } from "./receipt";


interface MenuItem {
  id: string;
  name: string;
  price: number;
}
interface User {
  id: string;
  email: string;
  role: string;
  branchId?: string;
}
interface DecodedToken {
  role: string;
  branchId?: string;
  userId?: string; // Additional properties if available
  [key: string]: any;
}

interface OrderLine {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

type PaymentType = "Cash" | "Mobile Money" | "Cash and Mobile Money";

const dummyMenuItems: MenuItem[] = [
  { id: "1", name: "Burger", price: 10 },
  { id: "2", name: "Pizza", price: 12 },
  { id: "3", name: "Salad", price: 8 },
  { id: "4", name: "Soda", price: 2 },
];

export function OrderForm() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [rounding, setRounding] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<PaymentType>("Cash");
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [decodedToken, setDecodedToken] = useState<DecodedToken>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const receiptRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoadingMenu(true);
    (async () => {
      try {
        const menuItems = await getMenuItems();
        const decodedToken = await fetchUsers();
        setDecodedToken(decodedToken);
        setLoadingMenu(false);
        setMenuItems(menuItems);
      } catch {
        console.log("Failed to fetch menu items");
      }
    })();
  }, []);

  useEffect(() => {
    const newTotalPrice = orderLines.reduce(
      (sum, line) => sum + line.totalPrice,
      0
    );
    setTotalPrice(newTotalPrice);
    updateFinalPrice(newTotalPrice, discount, rounding);
  }, [orderLines, discount, rounding]);

  useEffect(() => {
    setBalance(receivedAmount - finalPrice);
  }, [receivedAmount, finalPrice]);

  const updateFinalPrice = (total: number, disc: number, round: number) => {
    const finalPrice = Math.max(0, total - disc + round);
    setFinalPrice(finalPrice);
  };

  const handleAddItem = () => {
    const item = menuItems.find((item) => item.id === selectedItem);
    if (item) {
      const newOrderLine: OrderLine = {
        menuItemId: item.id,
        name: item.name,
        quantity: quantity,
        price: item.price,
        totalPrice: item.price * quantity,
      };
      setOrderLines([...orderLines, newOrderLine]);
      setSelectedItem("");
      setQuantity(1);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newOrderLines = [...orderLines];
    newOrderLines.splice(index, 1);
    setOrderLines(newOrderLines);
  };
  const handlePrint = () => {
  if (receiptRef.current && orderLines.length > 0) {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @media print {
                body { width: 300px; }
              }
            </style>
          </head>
          <body>
            ${receiptRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();

      setBalance(0);
      setDiscount(0);
      setRounding(0);
      setOrderLines([]);
      setReceivedAmount(0);
      setTotalPrice(0);
      setQuantity(1);
      setSelectedItem(""); 
      
    }
  } else {
    console.error("Receipt is not ready for printing.");
  }
};

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const order = {
        waiterId: decodedToken?.userId,
        branchId: decodedToken?.branchId,
        orderLines: orderLines.map((line) => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          price: line.price,
          totalPrice: line.totalPrice,
        })),
        totalPrice,
        discount,
        rounding,
        finalPrice,
        paymentType,
        receivedAmount,
        balance,
        isCompleted: false,
        isCheckedOut: false,
        requiredDate: new Date().toISOString(),
      };
      
      if (
        orderLines.length !== 0 &&
        receivedAmount >= finalPrice 
      ) {
        console.log("Creating order:", order);
        const result = await createOrder(order);
        console.log("Order created:", result);
        setSuccessMessage("Order created successfully.");
       setShowReceipt(true);
       setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
      setLoading(false);
       setFinalPrice(0);
      
      } else {
        setError("Please check the order details and try again.");
        setTimeout(() => {
          setError(null);
        }, 2000);
        setLoading(false);
      }

     
     
    } catch (error) {
      console.error("Failed to create order:", error);
      // Here you would typically show an error message to the user
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="menu-item">Menu Item</Label>
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger id="menu-item">
                    <SelectValue placeholder="Select a menu item" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingMenu ? (
                      <ClipLoader
                        color={"#000"}
                        loading={loading}
                        cssOverride={{}}
                        size={20}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    ) : (
                      menuItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} - ${item.price}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddItem}>Add to Order</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderLines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>{line.name}</TableCell>
                    <TableCell>{line.quantity}</TableCell>
                    <TableCell>${line.price.toFixed(2)}</TableCell>
                    <TableCell>${line.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="discount">Discount:</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="rounding">Rounding:</Label>
                <Input
                  id="rounding"
                  type="number"
                  value={rounding}
                  onChange={(e) => setRounding(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Payment Type:</Label>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(value: string) =>
                    setPaymentType(value as PaymentType)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Cash" id="cash" />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Mobile Money" id="mobile-money" />
                    <Label htmlFor="mobile-money">Mobile Money</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Cash and Mobile Money"
                      id="cash-and-mobile"
                    />
                    <Label htmlFor="cash-and-mobile">
                      Cash and Mobile Money
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="received-amount">Received Amount:</Label>
                <Input
                  id="received-amount"
                  type="number"
                  min="0"
                  value={receivedAmount}
                  onChange={(e) =>
                    setReceivedAmount(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Price:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Rounding:</span>
                <span>${rounding.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Final Price:</span>
                <span>${finalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Type:</span>
                <span>{paymentType}</span>
              </div>
              <div className="flex justify-between">
                <span>Received Amount:</span>
                <span>${receivedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Balance:</span>
                <span>${balance.toFixed(2)}</span>
              </div>
            </div>
            {successMessage && (
              <Alert>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
             {error && (
              <Alert severity="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleCreateOrder} className="w-full mt-4">
              {loading ? (<ClipLoader
                  color={"#fff"}
                  loading={loading}
                  cssOverride={{}}
                  size={20}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />) : 'Create Order'}
            </Button>
          </CardContent>
        </Card>
      </div>
      {showReceipt && (
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={receiptRef}>
                <RestaurantReceipt order={orderLines.length > 0 ? {
                  orderLines,
                  totalPrice,
                  discount,
                  rounding,
                  finalPrice,
                  paymentType,
                  receivedAmount,
                  balance,
                } : undefined} />
              </div>
              <Button onClick={handlePrint} className="mt-4">Print Receipt</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

