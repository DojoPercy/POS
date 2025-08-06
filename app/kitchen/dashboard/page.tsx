'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBranchOrders,
  updateOrder,
  updateOrderLocally,
} from '@/redux/orderSlice';
import { OrderStatus } from '@/lib/enums/enums';
import type { OrderType } from '@/lib/types/types';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { selectUser, fetchUserFromToken } from '@/redux/authSlice';
import { Bell, Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import KitchenStats from '@/components/kitchen/kitchen-stats';
import KitchenDashboard from '@/components/kitchen/kitchen-dashboard';
import { getCompanyDetails } from '@/redux/companySlice';
import { getMenuItemsPerCompany } from '@/redux/companyMenuSlice';
import type { RootState } from '@/redux';
import Pusher from 'pusher-js';
import { motion, AnimatePresence } from 'framer-motion';

export default function KitchenDashboardPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const user = useSelector(selectUser);
  const { orders, loading } = useSelector((state: any) => state.orders);
  const [activeTab, setActiveTab] = useState('all');
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [latestOrder, setLatestOrder] = useState<OrderType | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { menuItems } = useSelector((state: RootState) => state.menu);
  const { company } = useSelector((state: RootState) => state.company);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCompanyDetails(user?.companyId ?? ''));
  }, [dispatch, user?.companyId]);

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getMenuItemsPerCompany(user.companyId));
    }
  }, [dispatch, user?.companyId]);

  useEffect(() => {
    if (user?.branchId) {
      dispatch(fetchBranchOrders(user?.branchId ?? '') as any);

      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'ap2',
      });

      const channel = pusher.subscribe('orders');

      channel.bind('order-update', (data: any) => {
        console.log('New order update received:', data);
        dispatch(updateOrderLocally(data));
        console.log('Updated order:', data);
        // Check if this is a new pending order
        if (data.orderStatus === OrderStatus.PENDING) {
          setNewOrderAlert(true);
          setLatestOrder(data);
          setShowNotification(true);

          // Play sound
          if (audioRef.current) {
            audioRef.current
              .play()
              .catch(e => console.error('Error playing sound:', e));
          }
        }

        dispatch(updateOrderLocally(data));
        console.log('Updated order:', data);
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [dispatch, user?.branchId, toast]);

  // For demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orders && orders.length > 0) {
        const pendingOrder = orders.find(
          (order: OrderType) => order.orderStatus === OrderStatus.PENDING,
        );
        if (pendingOrder) {
          setNewOrderAlert(true);
          setLatestOrder(pendingOrder);
          setShowNotification(true);

          // Play sound
          if (audioRef.current) {
            audioRef.current
              .play()
              .catch(e => console.error('Error playing sound:', e));
          }
        }
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [orders]);

  const handleAcceptOrder = async (order: OrderType) => {
    try {
      const updatedOrder = {
        ...order,

        orderStatus: OrderStatus.PROCESSING,
      };

      await dispatch(updateOrder(updatedOrder) as any);

      toast({
        title: 'Order Accepted',
        description: `Order #${order.orderNumber} is now being processed`,
      });

      if (latestOrder && latestOrder.id === order.id) {
        setNewOrderAlert(false);
        setShowNotification(false);
      }
    } catch (error) {
      console.error('Failed to accept order:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Similarly update the handleCompleteOrder function:

  const handleCompleteOrder = async (order: OrderType) => {
    try {
      const updatedOrder = {
        ...order,

        orderStatus: OrderStatus.COMPLETED,
      };

      await dispatch(updateOrder(updatedOrder) as any);

      toast({
        title: 'Order Completed',
        description: `Order #${order.orderNumber} has been completed`,
      });
    } catch (error) {
      console.error('Failed to complete order:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const dismissNotification = () => {
    setShowNotification(false);
  };
  const getFilteredOrders = () => {
    if (!orders) return [];

    switch (activeTab) {
    case 'pending':
      return orders.filter(
        (order: OrderType) => order.orderStatus === OrderStatus.PENDING,
      );
    case 'processing':
      return orders.filter(
        (order: OrderType) => order.orderStatus === OrderStatus.PROCESSING,
      );
    case 'completed':
      return orders.filter(
        (order: OrderType) => order.orderStatus === OrderStatus.COMPLETED,
      );
    default:
      return orders;
    }
  };

  // Add a mock new order for demonstration
  const mockOrders = [...(getFilteredOrders() || [])];

  return (
    <div className='container mx-auto py-6'>
      {/* Audio element for bell sound */}
      <audio ref={audioRef} preload='auto'>
        <source
          src='https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
          type='audio/mpeg'
        />
        Your browser does not support the audio element.
      </audio>

      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>
            Kitchen Dashboard
          </h1>
          <p className='text-gray-500'>Manage and track kitchen orders</p>
        </div>

        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <Button
              variant='outline'
              size='icon'
              className='relative border-gray-200 text-gray-700 hover:text-gray-900'
            >
              <Bell className='h-5 w-5' />
              {newOrderAlert && (
                <span className='absolute -top-1 -right-1 flex h-4 w-4'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-4 w-4 bg-red-500'></span>
                </span>
              )}
            </Button>
          </div>
          <Button
            variant='outline'
            size='icon'
            className='border-gray-200 text-gray-700 hover:text-gray-900'
          >
            <Settings className='h-5 w-5' />
          </Button>
        </div>
      </div>

      {/* New Order Notification */}
      <AnimatePresence>
        {showNotification && latestOrder && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className='mb-6'
          >
            <Card className='border-amber-300 bg-amber-50 shadow-md'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div className='mr-4 bg-amber-100 p-2 rounded-full'>
                      <AlertTriangle className='h-6 w-6 text-amber-600' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-amber-800'>
                        New Order Received!
                      </h3>
                      <p className='text-sm text-amber-700'>
                        Order #{latestOrder.orderNumber} is waiting to be
                        accepted
                      </p>
                    </div>
                  </div>
                  <div className='flex space-x-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='border-amber-300 text-amber-800 hover:bg-amber-100'
                      onClick={dismissNotification}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size='sm'
                      className='bg-amber-600 hover:bg-amber-700 text-white'
                      onClick={() => {
                        if (latestOrder) {
                          handleAcceptOrder(latestOrder);
                          dismissNotification();
                        }
                      }}
                    >
                      Accept Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kitchen Stats */}
      <KitchenStats orders={orders || []} />

      <Tabs
        defaultValue='all'
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full mt-8'
      >
        <TabsList className='grid w-full grid-cols-4 mb-8'>
          <TabsTrigger value='all'>All Orders</TabsTrigger>
          <TabsTrigger value='pending' className='relative'>
            New Orders
            {newOrderAlert && (
              <span className='absolute -top-1 -right-1 flex h-3 w-3'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-red-500'></span>
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value='processing'>Processing</TabsTrigger>
          <TabsTrigger value='completed'>Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <KitchenDashboard
            company={company}
            Menuitems={menuItems}
            orders={mockOrders || []}
            loading={loading}
            onAcceptOrder={handleAcceptOrder}
            onCompleteOrder={handleCompleteOrder}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
