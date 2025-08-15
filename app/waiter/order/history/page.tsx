'use client';

import { useState, useEffect } from 'react';
import { WaiterHeader } from '@/components/waiter-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-time-picker';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/order-columns';
import { RefreshCw, Download, Search, Filter } from 'lucide-react';
import { addDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '@/redux/orderSlice';
import type { RootState, AppDispatch } from '../../../../redux/index';
import { Company, OrderType } from '@/lib/types/types';
import { OrderStatus } from '@/lib/enums/enums';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  [key: string]: any;
}

export default function OrderHistory() {
  const [refresh, setRefresh] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const user = useSelector(selectUser);
  const company = useSelector((state: any) => state.company.company) as Company;

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId));
    }
  }, [dispatch, user?.companyId]);

  // Fetch Orders on Refresh
  useEffect(() => {
    if (!refresh) return;

    const fetchOrdersHandler = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found');
          return;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        await dispatch(fetchOrders(decodedToken.userId ?? ''));
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setRefresh(false);
      }
    };
    fetchOrdersHandler();
  }, [dispatch, refresh]);

  const handleRefresh = () => {
    setRefresh(true);
  };

  const handleExport = () => {
    // Export functionality
    console.log('Export orders');
  };

  // Filter orders based on search, status, and date range
  const filteredOrders =
    orders?.filter((order: OrderType) => {
      const matchesSearch = order.orderNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || order.orderStatus === statusFilter;
      const matchesDateRange =
        !dateRange?.from ||
        !dateRange?.to ||
        (new Date(order.createdAt || '') >= dateRange.from &&
          new Date(order.createdAt || '') <= dateRange.to);

      return matchesSearch && matchesStatus && matchesDateRange;
    }) || [];

  const breadcrumbs = [
    { label: 'Dashboard', href: '/waiter' },
    { label: 'Orders', href: '/waiter/order/view' },
    { label: 'History' },
  ];

  return (
    <div className='flex flex-col h-full'>
      <WaiterHeader title='Order History' breadcrumbs={breadcrumbs} />

      <div className='flex-1 overflow-auto p-6 bg-gray-50'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Header */}
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Order History
              </h1>
              <p className='text-gray-600 mt-1'>
                View and manage your past orders
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button variant='outline' onClick={handleExport}>
                <Download className='h-4 w-4 mr-2' />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5' />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Search Orders</label>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                      placeholder='Search by order number...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder='All statuses' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Statuses</SelectItem>
                      <SelectItem value={OrderStatus.PENDING}>New</SelectItem>
                      <SelectItem value={OrderStatus.PROCESSING}>
                        Processing
                      </SelectItem>
                      <SelectItem value={OrderStatus.COMPLETED}>
                        Ready
                      </SelectItem>
                      <SelectItem value={OrderStatus.PAID}>
                        Completed
                      </SelectItem>
                      <SelectItem value={OrderStatus.CANCELED}>
                        Canceled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Date Range</label>
                  {/* <DatePickerWithRange
                    setParentDate={setDateRange}
                  /> */}
                  <div className='p-2 border rounded'>
                    <p className='text-sm text-gray-500'>
                      Date picker temporarily disabled
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Show Completed</label>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='showCompleted'
                      checked={showCompleted}
                      onChange={e => setShowCompleted(e.target.checked)}
                      className='rounded border-gray-300'
                    />
                    <label
                      htmlFor='showCompleted'
                      className='text-sm text-gray-600'
                    >
                      Include completed orders
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Orders
                    </p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {filteredOrders.length}
                    </p>
                  </div>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <div className='w-6 h-6 bg-blue-600 rounded'></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Completed
                    </p>
                    <p className='text-2xl font-bold text-green-600'>
                      {
                        filteredOrders.filter(
                          (order: OrderType) =>
                            order.orderStatus === OrderStatus.PAID
                        ).length
                      }
                    </p>
                  </div>
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <div className='w-6 h-6 bg-green-600 rounded'></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Revenue
                    </p>
                    <p className='text-2xl font-bold text-purple-600'>
                      $
                      {filteredOrders
                        .reduce(
                          (sum: number, order: OrderType) =>
                            sum + (order.finalPrice || 0),
                          0
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className='p-2 bg-purple-100 rounded-lg'>
                    <div className='w-6 h-6 bg-purple-600 rounded'></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Avg Order Value
                    </p>
                    <p className='text-2xl font-bold text-orange-600'>
                      $
                      {filteredOrders.length > 0
                        ? (
                            filteredOrders.reduce(
                              (sum: number, order: OrderType) =>
                                sum + (order.finalPrice || 0),
                              0
                            ) / filteredOrders.length
                          ).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                  <div className='p-2 bg-orange-100 rounded-lg'>
                    <div className='w-6 h-6 bg-orange-600 rounded'></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex justify-center items-center h-40'>
                  <RefreshCw className='h-8 w-8 animate-spin text-gray-400' />
                </div>
              ) : (
                <DataTable
                  columns={columns('USD')}
                  data={filteredOrders}
                  searchColumn='orderNumber'
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
