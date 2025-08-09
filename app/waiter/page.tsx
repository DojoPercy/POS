'use client';

import type React from 'react';

import { useState, useEffect, useCallback } from 'react';
import { WaiterHeader } from '@/components/waiter-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserById } from '@/lib/auth';
import { getBranchById } from '@/lib/branch';
import { jwtDecode } from 'jwt-decode';
import { format, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Clock,
  MapPin,
  Building,
  Mail,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Edit,
  Settings,
  ChefHat,
  RefreshCw,
  BarChart3,
  Target,
  Plus,
  Users,
  AlertCircle,
  CheckCircle,
  Timer,
  QrCode,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { DatePickerWithRange } from '@/components/date';
import AttendanceQRCode from '@/components/attendance-qr-code';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '@/redux/orderSlice';
import { selectUser, fetchUserFromToken } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import type { RootState } from '@/redux';
import type { OrderType } from '@/lib/types/types';
import { OrderStatus } from '@/lib/enums/enums';
import Pusher from 'pusher-js';
import { IngredientOrderForm } from '@/components/ingredient-order-form';

interface WaiterProfileUser {
  id: string;
  fullname: string;
  status: string;
  email: string;
  role: string;
  branchId?: string;
  name: string;
  createdAt?: string;
}

interface Branch {
  id: string;
  name: string;
  location: string;
  city: string;
  state?: string;
  country: string;
  openingHours: string;
  status: 'active' | 'inactive' | '';
  managerId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface OrderSummary {
  waiterId: string;
  totalOrders: number;
  totalItems: number;
  totalAmount: number;
  averageOrderValue: number;
  averageItemsPerOrder: number;
  dateRange: {
    from: string;
    to: string;
  };
  lastUpdated: string;
}

interface DecodedToken {
  role: string;
  userId?: string;
  [key: string]: any;
}

export default function WaiterDashboard() {
  const [user, setUser] = useState<WaiterProfileUser | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [latestOrder, setLatestOrder] = useState<OrderType | null>(null);

  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state: RootState) => state.orders);
  const userRedux = useSelector(selectUser);
  const { company } = useSelector((state: RootState) => state.company);

  const { toast } = useToast();
  const breadcrumbs = [{ label: 'Dashboard', href: '/waiter' }];

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    if (userRedux?.companyId) {
      dispatch(getCompanyDetails(userRedux.companyId));
    }
  }, [dispatch, userRedux?.companyId]);

  // Real-time order updates with Pusher
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !userRedux?.userId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'ap2',
    });

    const channel = pusher.subscribe('orders');

    channel.bind('order-update', (data: any) => {
      if (data.waiterId === userRedux?.userId && userRedux?.userId) {
        dispatch(fetchOrders(userRedux.userId));
        toast({
          title: 'Order Updated',
          description: `Order #${data.orderNumber} status changed to ${data.orderStatus}`,
        });
      }
    });

    channel.bind('new-order', (data: any) => {
      if (data.waiterId === userRedux?.userId && userRedux?.userId) {
        setNewOrderAlert(true);
        setLatestOrder(data);
        dispatch(fetchOrders(userRedux.userId));
        toast({
          title: 'New Order!',
          description: `Order #${data.orderNumber} has been created`,
        });

        // Auto-hide alert after 5 seconds
        setTimeout(() => setNewOrderAlert(false), 5000);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [dispatch, toast, userRedux?.userId]);

  // Predefined date range options
  const dateRangePresets = [
    {
      label: 'Today',
      range: { from: new Date(), to: new Date() },
    },
    {
      label: 'Yesterday',
      range: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) },
    },
    {
      label: 'Last 7 days',
      range: { from: subDays(new Date(), 6), to: new Date() },
    },
    {
      label: 'Last 30 days',
      range: { from: subDays(new Date(), 29), to: new Date() },
    },
    {
      label: 'This month',
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
  ];

  const fetchOrderSummary = useCallback(
    async (waiterId: string, fromDate: Date, toDate: Date) => {
      try {
        setSummaryLoading(true);
        const from = format(fromDate, 'yyyy-MM-dd');
        const to = format(toDate, 'yyyy-MM-dd');

        const response = await fetch(
          `/api/orders/waiter?waiterId=${waiterId}&from=${from}&to=${to}`,
        );
        if (response.ok) {
          const summary = await response.json();
          setOrderSummary(summary);
          toast({
            title: 'Data Updated',
            description: `Statistics loaded for ${from} to ${to}`,
          });
        } else {
          throw new Error('Failed to fetch order summary');
        }
      } catch (error) {
        console.error('Failed to fetch order summary:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order statistics',
          variant: 'destructive',
        });
      } finally {
        setSummaryLoading(false);
      }
    },
    [toast],
  );

  // Real-time order updates with Pusher
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !userRedux?.userId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'ap2',
    });

    const channel = pusher.subscribe('orders');

    channel.bind('order-update', (data: any) => {
      if (data.waiterId === userRedux?.userId && userRedux?.userId) {
        dispatch(fetchOrders(userRedux.userId));
        toast({
          title: 'Order Updated',
          description: `Order #${data.orderNumber} status changed to ${data.orderStatus}`,
        });
      }
    });

    channel.bind('new-order', (data: any) => {
      if (data.waiterId === userRedux?.userId && userRedux?.userId) {
        setNewOrderAlert(true);
        setLatestOrder(data);
        dispatch(fetchOrders(userRedux.userId));
        toast({
          title: 'New Order!',
          description: `Order #${data.orderNumber} has been created`,
        });

        // Auto-hide alert after 5 seconds
        setTimeout(() => setNewOrderAlert(false), 5000);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [dispatch, toast, userRedux?.userId]);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    if (userRedux?.companyId) {
      dispatch(getCompanyDetails(userRedux.companyId));
    }
  }, [dispatch, userRedux?.companyId]);

  useEffect(() => {
    const fetchUserAndBranch = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found');
          return;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        const userDetails = await getUserById(decodedToken.userId ?? '');
        const branchDetails = await getBranchById(userDetails.branchId ?? '');

        setUser(userDetails);
        setBranch(branchDetails);

        // Fetch orders for this waiter
        dispatch(fetchOrders(decodedToken.userId ?? ''));

        // Fetch order summary for the selected date range
        if (dateRange?.from && dateRange?.to) {
          fetchOrderSummary(
            decodedToken.userId ?? '',
            dateRange.from,
            dateRange.to,
          );
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndBranch();
  }, [dateRange?.from, dateRange?.to, fetchOrderSummary, toast, dispatch]);

  // Fetch order summary when date range changes
  useEffect(() => {
    if (user && dateRange?.from && dateRange?.to) {
      fetchOrderSummary(user.id, dateRange.from, dateRange.to);
    }
  }, [dateRange, fetchOrderSummary, user]);

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  const handlePresetClick = (preset: { label: string; range: DateRange }) => {
    setDateRange(preset.range);
  };

  const handleRefresh = () => {
    if (user && dateRange?.from && dateRange?.to) {
      fetchOrderSummary(user.id, dateRange.from, dateRange.to);
    }
    if (userRedux?.userId) {
      dispatch(fetchOrders(userRedux.userId));
    }
  };

  // Filter orders by status
  const pendingOrders =
    orders?.filter(
      (order: OrderType) => order.orderStatus === OrderStatus.PENDING,
    ) || [];
  const processingOrders =
    orders?.filter(
      (order: OrderType) => order.orderStatus === OrderStatus.PROCESSING,
    ) || [];
  const completedOrders =
    orders?.filter(
      (order: OrderType) => order.orderStatus === OrderStatus.COMPLETED,
    ) || [];
  const paidOrders =
    orders?.filter(
      (order: OrderType) => order.orderStatus === OrderStatus.PAID,
    ) || [];

  if (isLoading) {
    return (
      <div className='flex flex-col h-full'>
        <WaiterHeader title='Dashboard' breadcrumbs={breadcrumbs} />
        <div className='flex-1 overflow-auto p-6 bg-gray-50'>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!user || !branch) {
    return (
      <div className='flex flex-col h-full'>
        <WaiterHeader title='Dashboard' breadcrumbs={breadcrumbs} />
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <ChefHat className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Failed to load dashboard
            </h3>
            <p className='text-gray-500'>Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  const getDateRangeLabel = () => {
    if (!dateRange?.from || !dateRange?.to) return 'Select date range';
    if (dateRange.from.toDateString() === dateRange.to.toDateString()) {
      return format(dateRange.from, 'MMM dd, yyyy');
    }
    return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
  };

  const stats = [
    {
      title: 'Total Orders',
      value: summaryLoading
        ? '...'
        : orderSummary?.totalOrders.toString() || '0',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
    },
    {
      title: 'Items Served',
      value: summaryLoading
        ? '...'
        : orderSummary?.totalItems.toString() || '0',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
    },
    {
      title: 'Total Sales',
      value: summaryLoading
        ? '...'
        : `$${orderSummary?.totalAmount.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%',
    },
    {
      title: 'Avg Order Value',
      value: summaryLoading ? '...' : '',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+5%',
    },
  ];

  return (
    <div className='flex flex-col h-full'>
      <WaiterHeader title='Dashboard' breadcrumbs={breadcrumbs} />

      <div className='flex-1 overflow-auto p-6 bg-gray-50'>
        <div className='max-w-6xl mx-auto space-y-6'>
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className='overflow-hidden'>
              <div className='bg-gradient-to-r from-blue-600 to-indigo-600 h-32'></div>
              <CardContent className='relative pt-0 pb-6'>
                <div className='flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16'>
                  <Avatar className='w-24 h-24 border-4 border-white shadow-lg'>
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.fullname}`}
                      alt={user.fullname}
                    />
                    <AvatarFallback className='text-2xl font-semibold bg-gray-100'>
                      {user.fullname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1 sm:ml-4'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                      <div>
                        <h1 className='text-2xl font-bold text-gray-900'>
                          Welcome back, {user.name || user.fullname}!
                        </h1>
                        <p className='text-gray-600 flex items-center gap-1 mt-1'>
                          <Building className='h-4 w-4' />
                          {branch.name}
                        </p>
                        <div className='flex items-center gap-2 mt-2'>
                          <Badge
                            variant='secondary'
                            className='bg-blue-100 text-blue-800'
                          >
                            {user.role}
                          </Badge>
                          <Badge
                            variant={
                              user.status === 'active'
                                ? 'default'
                                : 'destructive'
                            }
                            className={
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : ''
                            }
                          >
                            {user.status.charAt(0).toUpperCase() +
                              user.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <Link href='/waiter/order/new'>
                          <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
                            <Plus className='h-4 w-4 mr-2' />
                            New Order
                          </Button>
                        </Link>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            // Scroll to ingredient order form
                            const element = document.getElementById(
                              'ingredient-order-form',
                            );
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          <Package className='h-4 w-4 mr-2' />
                          Ingredient Order
                        </Button>
                        <Button variant='outline' size='sm'>
                          <QrCode className='h-4 w-4 mr-2' />
                          Attendance QR
                        </Button>
                        <Button variant='outline' size='sm'>
                          <Settings className='h-4 w-4 mr-2' />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* New Order Alert */}
          {newOrderAlert && latestOrder && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='bg-green-50 border border-green-200 rounded-lg p-4'
            >
              <div className='flex items-center gap-3'>
                <div className='flex-shrink-0'>
                  <AlertCircle className='h-6 w-6 text-green-600' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-sm font-medium text-green-800'>
                    New Order Received!
                  </h3>
                  <p className='text-sm text-green-700 mt-1'>
                    Order #{latestOrder.orderNumber} has been created and is
                    ready for processing.
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setNewOrderAlert(false)}
                  className='text-green-600 hover:text-green-800'
                >
                  ×
                </Button>
              </div>
            </motion.div>
          )}

          {/* Date Range Picker and Analytics Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
                  <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-700'>
                        Date Range:
                      </label>
                      <DatePickerWithRange
                        date={dateRange}
                        onDateChange={handleDateRangeChange}
                        placeholder='Select date range'
                      />
                    </div>

                    <div className='flex flex-wrap gap-2'>
                      {dateRangePresets.map(preset => (
                        <Button
                          key={preset.label}
                          variant='outline'
                          size='sm'
                          onClick={() => handlePresetClick(preset)}
                          className='text-xs'
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleRefresh}
                      disabled={summaryLoading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${summaryLoading ? 'animate-spin' : ''}`}
                      />
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-600'>
                    <span className='font-medium'>Viewing data for:</span>{' '}
                    {getDateRangeLabel()}
                  </p>
                  {orderSummary?.lastUpdated && (
                    <p className='text-xs text-gray-500 mt-1'>
                      Last updated:{' '}
                      {format(
                        new Date(orderSummary.lastUpdated),
                        'MMM dd, yyyy \'at\' HH:mm',
                      )}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                <Card className='hover:shadow-md transition-shadow'>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-600'>
                          {stat.title}
                        </p>
                        <p className='text-2xl font-bold text-gray-900 mt-1'>
                          {stat.value}
                        </p>
                        <p className='text-xs text-green-600 mt-1 flex items-center'>
                          <TrendingUp className='h-3 w-3 mr-1' />
                          {stat.change} from last period
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Current Orders Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Clock className='h-5 w-5' />
                    Current Orders Status
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='text-center p-4 bg-yellow-50 rounded-lg'>
                      <div className='text-2xl font-bold text-yellow-600'>
                        {pendingOrders.length}
                      </div>
                      <div className='text-sm text-yellow-700'>New Orders</div>
                    </div>
                    <div className='text-center p-4 bg-blue-50 rounded-lg'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {processingOrders.length}
                      </div>
                      <div className='text-sm text-blue-700'>Processing</div>
                    </div>
                    <div className='text-center p-4 bg-orange-50 rounded-lg'>
                      <div className='text-2xl font-bold text-orange-600'>
                        {completedOrders.length}
                      </div>
                      <div className='text-sm text-orange-700'>Ready</div>
                    </div>
                    <div className='text-center p-4 bg-green-50 rounded-lg'>
                      <div className='text-2xl font-bold text-green-600'>
                        {paidOrders.length}
                      </div>
                      <div className='text-sm text-green-700'>Completed</div>
                    </div>
                  </div>
                  <div className='text-center'>
                    <Link href='/waiter/order/view'>
                      <Button variant='outline' className='w-full'>
                        View All Orders
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Target className='h-5 w-5' />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <Link href='/waiter/order/new'>
                      <Button className='w-full h-16 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700'>
                        <Plus className='h-5 w-5' />
                        Create New Order
                      </Button>
                    </Link>
                    <Link href='/waiter/order/view'>
                      <Button
                        variant='outline'
                        className='w-full h-16 flex flex-col gap-2'
                      >
                        <ShoppingBag className='h-5 w-5' />
                        View Orders
                      </Button>
                    </Link>
                    <Link href='/waiter/order/history'>
                      <Button
                        variant='outline'
                        className='w-full h-16 flex flex-col gap-2'
                      >
                        <Clock className='h-5 w-5' />
                        Order History
                      </Button>
                    </Link>
                    <Link href='/waiter/settings'>
                      <Button
                        variant='outline'
                        className='w-full h-16 flex flex-col gap-2'
                      >
                        <Settings className='h-5 w-5' />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Attendance QR Code */}
          {branch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <QrCode className='h-5 w-5' />
                    Staff Attendance QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AttendanceQRCode
                    branchId={branch.id}
                    branchName={branch.name}
                    branchAddress={`${branch.location}, ${branch.city}, ${branch.country}`}
                    employeeCount={0}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Timer className='h-5 w-5' />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className='space-y-3'>
                    {orders.slice(0, 5).map((order: OrderType) => (
                      <div
                        key={order.id}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold'>
                            {order.orderNumber?.slice(-2) || 'AA'}
                          </div>
                          <div>
                            <p className='font-medium'>
                              Order #{order.orderNumber}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {format(
                                new Date(order.createdAt || ''),
                                'MMM dd, HH:mm',
                              )}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant='outline'
                          className={
                            order.orderStatus === OrderStatus.PAID
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : order.orderStatus === OrderStatus.COMPLETED
                                ? 'bg-orange-100 text-orange-800 border-orange-200'
                                : order.orderStatus === OrderStatus.PROCESSING
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                          }
                        >
                          {order.orderStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <ShoppingBag className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      No orders yet
                    </h3>
                    <p className='text-gray-500'>
                      Start by creating your first order
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Ingredient Order Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            id='ingredient-order-form'
          >
            <IngredientOrderForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Welcome Header Skeleton */}
      <Card className='overflow-hidden'>
        <div className='bg-gradient-to-r from-gray-200 to-gray-300 h-32'></div>
        <CardContent className='relative pt-0 pb-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16'>
            <Skeleton className='w-24 h-24 rounded-full border-4 border-white' />
            <div className='flex-1 sm:ml-4 space-y-2'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-4 w-64' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-16' />
                <Skeleton className='h-6 w-16' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Range Picker Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-48' />
        </CardHeader>
        <CardContent>
          <div className='flex flex-col lg:flex-row gap-4'>
            <Skeleton className='h-10 w-80' />
            <div className='flex gap-2'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-8 w-16' />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-8 w-16' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <Skeleton className='h-12 w-12 rounded-lg' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-6 w-40' />
            </CardHeader>
            <CardContent className='space-y-4'>
              {[...Array(4)].map((_, j) => (
                <div key={j} className='flex items-center space-x-3'>
                  <Skeleton className='w-4 h-4' />
                  <div className='flex-1 space-y-1'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-3 w-32' />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
