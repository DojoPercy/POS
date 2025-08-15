'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { RefreshCw, Download, Plus, Filter, Package } from 'lucide-react';
import { getOrders } from '@/lib/order';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/order-columns';
import { DatePickerWithRange } from '@/components/ui/date-time-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { addDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { jwtDecode } from 'jwt-decode';
import { OrderStatus } from '@/lib/enums/enums';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import type { Company, OrderType } from '@/lib/types/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { placeOrder } from '@/redux/orderSlice';

interface DatePickerWithRangeProps {
  range: { from: Date; to: Date };
  setRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
}
interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  [key: string]: any;
}

export default function Orders() {
  const [refresh, setRefresh] = useState(true);
  const [data, setData] = useState<OrderType[]>([]);
  const [filteredData, setFilteredData] = useState<OrderType[]>([]);
  const [showCompleted, setShowCompleted] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [bulkOrderOpen, setBulkOrderOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const company = useSelector((state: any) => state.company.company) as Company;
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch, user?.companyId]);

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId));
    }
  }, [dispatch, user?.companyId]);

  useEffect(() => {
    if (!refresh) return;

    setData([]);
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found');
          return;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        const orders = await getOrders(undefined, decodedToken.branchId ?? '');

        const filteredOrders = orders.filter(
          (order: { branchId: any }) => order.branchId === decodedToken.branchId
        );
        setData(filteredOrders);
        setFilteredData(orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setRefresh(false);
      }
    };
    fetchOrders();
  }, [refresh]);

  useEffect(() => {
    let filtered = data;
    if (!showCompleted) {
      filtered = filtered.filter(
        order => !(order.orderStatus === OrderStatus.PAID)
      );
    }
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt!);
        return orderDate >= dateRange.from! && orderDate <= dateRange.to!;
      });
    }
    setFilteredData(filtered);
  }, [showCompleted, dateRange, data]);

  const handleCreateBulkOrder = async () => {
    if (!totalPrice || Number.parseFloat(totalPrice) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid total price',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const decodedToken: DecodedToken = jwtDecode(token);

      if (!decodedToken.branchId) {
        throw new Error('Branch ID not found in token');
      }

      const bulkOrder: OrderType = {
        waiterId: user?.userId,
        branchId: decodedToken.branchId,
        companyId: user?.companyId,
        totalPrice: Number.parseFloat(totalPrice),
        finalPrice: Number.parseFloat(totalPrice),
        orderStatus: OrderStatus.PAID,
        orderLines: [],
        orderNumber: `BULK-${Date.now().toString().slice(-6)}`,
      };

      await dispatch(placeOrder(bulkOrder) as OrderType);

      toast({
        title: 'Bulk order created',
        description: 'Your bulk order has been created successfully',
      });

      setBulkOrderOpen(false);
      setTotalPrice('');
      setNote('');
      setRefresh(true);
    } catch (error) {
      console.error('Failed to create bulk order:', error);
      toast({
        title: 'Failed to create order',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='py-6 px-10'>
      <div className='flex flex-row mb-6'>
        <div className='mr-auto flex'>
          <h1 className='mr-auto font-bold text-2xl flex items-center'>
            Orders
          </h1>
          <div className='ml-5 my-auto h-4 w-4 items-center flex'>
            <Button
              variant='ghost'
              className={`rounded-full p-3 items-center ${refresh ? 'animate-spin' : ''}`}
              onClick={() => setRefresh(true)}
            >
              <RefreshCw className='w-4 h-4' />
            </Button>
          </div>
        </div>
        <div className='ml-auto flex justify-end gap-5'>
          <Dialog open={bulkOrderOpen} onOpenChange={setBulkOrderOpen}>
            <DialogTrigger asChild>
              <Button variant='outline' className='my-auto'>
                <Package className='w-4 h-4 mr-2' /> Bulk Order
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Create Bulk Order</DialogTitle>
                <DialogDescription>
                  Enter the total amount for this bulk order. No need to specify
                  individual items.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='total-price' className='text-right'>
                    Total Price
                  </Label>
                  <div className='col-span-3 relative'>
                    <span className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                      {company?.currency || '$'}
                    </span>
                    <Input
                      id='total-price'
                      type='number'
                      value={totalPrice}
                      onChange={e => setTotalPrice(e.target.value)}
                      className='pl-8'
                      placeholder='0.00'
                      step='0.01'
                      min='0'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='note' className='text-right'>
                    Note (Optional)
                  </Label>
                  <Input
                    id='note'
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className='col-span-3'
                    placeholder='Add a note for this bulk order'
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='submit'
                  onClick={handleCreateBulkOrder}
                  disabled={isSubmitting || !totalPrice}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Creating...
                    </>
                  ) : (
                    'Create Order'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant='outline'
            className='my-auto'
            onClick={() => (window.location.href = '/orders/create')}
          >
            <Plus className='w-4 h-4 mr-2' /> New Order
          </Button>
          <Button className='my-auto'>
            <Download className='w-4 h-4 mr-2' /> Download
          </Button>
        </div>
      </div>

      <Card className='mb-6'>
        <CardContent className='pt-6'>
          <div className='flex flex-wrap gap-6 items-end'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='show-completed'
                checked={showCompleted}
                onCheckedChange={checked =>
                  setShowCompleted(checked as boolean)
                }
              />
              <Label htmlFor='show-completed'>Show Completed Orders</Label>
            </div>
            <div>
              <Label htmlFor='date-range' className='mb-2 block'>
                Date Range
              </Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <Button variant='secondary'>
              <Filter className='w-4 h-4 mr-2' /> Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className='mx-auto'>
        {refresh ? (
          <div className='flex justify-center py-10'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : company ? (
          <DataTable columns={columns(company.currency)} data={filteredData} />
        ) : (
          <div className='flex justify-center py-10'>
            <p>Loading company details...</p>
          </div>
        )}
      </div>
    </div>
  );
}
