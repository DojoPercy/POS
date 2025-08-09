'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { createOrder, getOrderCounter } from '@/lib/order';
import { fetchUsers } from '@/lib/auth';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stocks?: Array<{
    quantity: number;
    branchId: string;
  }>;
}

interface DecodedToken {
  role: string;
  branchId?: string;
  userId?: string;
  companyId?: string;
  [key: string]: any;
}

interface OrderLine {
  ingredientId: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  unit: string;
}

export function IngredientOrderForm() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingIngredients, setLoadingIngredients] = useState<boolean>(true);
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingIngredients(true);
        const token = await fetchUsers();
        setDecodedToken(token as DecodedToken);

        const ingredientsResponse = await fetch(
          `/api/ingredient?companyId=${token?.companyId}&branchId=${token?.branchId}`,
        );

        if (ingredientsResponse.ok) {
          const ingredientsData = await ingredientsResponse.json();
          setIngredients(ingredientsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load ingredients',
          variant: 'destructive',
        });
      } finally {
        setLoadingIngredients(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    const newTotalPrice = orderLines.reduce(
      (sum, line) => sum + line.totalPrice,
      0,
    );
    setTotalPrice(newTotalPrice);
  }, [orderLines]);

  const handleAddIngredient = () => {
    if (!selectedIngredient || quantity <= 0 || price <= 0) {
      toast({
        title: 'Error',
        description: 'Please select an ingredient, enter quantity and price',
        variant: 'destructive',
      });
      return;
    }

    const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
    if (ingredient) {
      const newOrderLine: OrderLine = {
        ingredientId: ingredient.id,
        name: ingredient.name,
        quantity: quantity,
        price: price,
        totalPrice: price * quantity,
        unit: ingredient.unit,
      };

      // Check if ingredient already exists in order
      const existingIndex = orderLines.findIndex(
        line => line.ingredientId === ingredient.id,
      );
      if (existingIndex !== -1) {
        // Update existing ingredient quantity and price
        const updatedOrderLines = [...orderLines];
        updatedOrderLines[existingIndex].quantity += quantity;
        updatedOrderLines[existingIndex].price = price; // Update to new price
        updatedOrderLines[existingIndex].totalPrice =
          price * updatedOrderLines[existingIndex].quantity;
        setOrderLines(updatedOrderLines);
      } else {
        // Add new ingredient
        setOrderLines([...orderLines, newOrderLine]);
      }

      setSelectedIngredient('');
      setQuantity(1);
      setPrice(0);

      toast({
        title: 'Added to Order',
        description: `${quantity} ${ingredient.unit} of ${ingredient.name} at $${price.toFixed(2)} added`,
      });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const newOrderLines = [...orderLines];
    newOrderLines.splice(index, 1);
    setOrderLines(newOrderLines);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveIngredient(index);
      return;
    }

    const newOrderLines = [...orderLines];
    newOrderLines[index].quantity = newQuantity;
    newOrderLines[index].totalPrice = newOrderLines[index].price * newQuantity;
    setOrderLines(newOrderLines);
  };

  const handleUpdatePrice = (index: number, newPrice: number) => {
    if (newPrice <= 0) {
      return;
    }

    const newOrderLines = [...orderLines];
    newOrderLines[index].price = newPrice;
    newOrderLines[index].totalPrice = newPrice * newOrderLines[index].quantity;
    setOrderLines(newOrderLines);
  };

  const handleCreateOrder = async () => {
    if (orderLines.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one ingredient to the order',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const orderNumber = await getOrderCounter(decodedToken?.branchId || '');

      const order = {
        waiterId: decodedToken?.userId,
        branchId: decodedToken?.branchId,
        orderLines: orderLines.map(line => ({
          ingredientId: line.ingredientId,
          quantity: line.quantity,
          price: line.price,
          totalPrice: line.totalPrice,
        })),
        totalPrice,
        discount: 0,
        rounding: 0,
        finalPrice: totalPrice,
        orderStatus: 'PAID', // Automatically set to PAID
        requiredDate: new Date().toISOString(),
        orderNumber: orderNumber,
        // Add payment information
        payment: {
          amount: totalPrice,
          paymentMethod: 'cash', // Default to cash for ingredient orders
          paymentStatus: 'Completed',
          currency: 'GHS', // Default currency
        },
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        toast({
          title: 'Order Completed',
          description: `Ingredient order #${orderNumber} has been completed and paid`,
        });

        // Reset form
        setOrderLines([]);
        setTotalPrice(0);
        setSelectedIngredient('');
        setQuantity(1);
        setPrice(0);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create ingredient order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStock = (ingredientId: string) => {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (ingredient?.stocks && ingredient.stocks.length > 0) {
      return ingredient.stocks[0].quantity;
    }
    return 0;
  };

  if (loadingIngredients) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Ingredient Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Package className='h-5 w-5' />
          Ingredient Purchase
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Ingredient Selection */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <Label htmlFor='ingredient'>Select Ingredient</Label>
            <Select
              value={selectedIngredient}
              onValueChange={setSelectedIngredient}
            >
              <SelectTrigger id='ingredient'>
                <SelectValue placeholder='Choose an ingredient' />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map(ingredient => (
                  <SelectItem key={ingredient.id} value={ingredient.id}>
                    <div className='flex items-center justify-between w-full'>
                      <span>{ingredient.name}</span>
                      <Badge variant='outline' className='ml-2'>
                        {getAvailableStock(ingredient.id)} {ingredient.unit}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='quantity'>Quantity</Label>
            <Input
              id='quantity'
              type='number'
              min='0.1'
              step='0.1'
              value={quantity}
              onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
              placeholder='Enter amount'
            />
          </div>

          <div>
            <Label htmlFor='price'>
              Price per{' '}
              {selectedIngredient
                ? ingredients.find(ing => ing.id === selectedIngredient)
                  ?.unit || 'unit'
                : 'unit'}
            </Label>
            <Input
              id='price'
              type='number'
              min='0.01'
              step='0.01'
              value={price}
              onChange={e => setPrice(parseFloat(e.target.value) || 0)}
              placeholder='Enter price'
            />
          </div>

          <div className='flex items-end'>
            <Button
              onClick={handleAddIngredient}
              disabled={!selectedIngredient || quantity <= 0 || price <= 0}
              className='w-full'
            >
              <Plus className='h-4 w-4 mr-2' />
              Add to Order
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        {orderLines.length > 0 && (
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <ShoppingCart className='h-5 w-5' />
              <h3 className='font-semibold'>Order Summary</h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price per Unit</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderLines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell className='font-medium'>{line.name}</TableCell>
                    <TableCell>{line.unit}</TableCell>
                    <TableCell>
                      <Input
                        type='number'
                        min='0.1'
                        step='0.1'
                        value={line.quantity}
                        onChange={e =>
                          handleUpdateQuantity(
                            index,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className='w-20'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type='number'
                        min='0.01'
                        step='0.01'
                        value={line.price}
                        onChange={e =>
                          handleUpdatePrice(
                            index,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className='w-24'
                      />
                    </TableCell>
                    <TableCell className='font-medium'>
                      ${line.totalPrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveIngredient(index)}
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className='flex items-center justify-between pt-4 border-t'>
              <div className='text-lg font-semibold'>
                Total: ${totalPrice.toFixed(2)}
              </div>
              <Button
                onClick={handleCreateOrder}
                disabled={loading}
                className='bg-blue-600 hover:bg-blue-700'
              >
                {loading ? 'Processing Payment...' : 'Complete & Pay Order'}
              </Button>
            </div>
          </div>
        )}

        {orderLines.length === 0 && (
          <div className='text-center py-8 text-gray-500'>
            <Package className='h-12 w-12 mx-auto mb-4 text-gray-300' />
            <p>No ingredients added to order yet</p>
            <p className='text-sm'>
              Select an ingredient, quantity, and price above to create a
              completed transaction
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
