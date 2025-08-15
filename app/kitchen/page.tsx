'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrder } from '@/redux/orderSlice';
import { OrderStatus } from '@/lib/enums/enums';
import type { OrderType } from '@/lib/types/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { selectUser, fetchUserFromToken } from '@/redux/authSlice';
import KitchenDashboard from '@/components/kitchen/kitchen-dashboard';
import { Menu } from 'lucide-react';
import { getCompanyDetails } from '@/redux/companySlice';
import { getMenuItemsPerCompany } from '@/redux/companyMenuSlice';
import { fetchMenuCategoriesOfCompany } from '@/redux/CompanyCategoryMenuSlice';
import { RootState } from '@/redux';

export default function KitchenPage() {
  const user = useSelector(selectUser);

  const dispatch = useDispatch();

  const { orders, loading } = useSelector((state: any) => state.orders);
  const [activeTab, setActiveTab] = useState('all');
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const { toast } = useToast();
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
      dispatch(fetchOrders(user.branchId) as any);
    } else if (user) {
      dispatch(fetchOrders('default-branch') as any);
    }
  }, [dispatch, user]);

  const handleAcceptOrder = async (order: OrderType) => {
    try {
      const updatedOrder = {
        ...order,
        OrderStatus: OrderStatus.PROCESSING,
      };

      await dispatch(updateOrder(updatedOrder) as any);

      toast({
        title: 'Order Accepted',
        description: `Order #${order.orderNumber} is now being processed`,
      });
    } catch (error) {
      console.error('Failed to accept order:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteOrder = async (order: OrderType) => {
    try {
      const updatedOrder = {
        ...order,
        OrderStatus: OrderStatus.COMPLETED,
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

  const getFilteredOrders = () => {
    if (!orders) return [];
    const filteredOrders = orders.filter(
      (order: OrderType) => order.orderStatus !== OrderStatus.PAID
    );
    console.log(filteredOrders);
    switch (activeTab) {
      case 'pending':
        return orders.filter(
          (order: OrderType) =>
            filteredOrders.orderStatus === OrderStatus.PENDING
        );
      case 'processing':
        return orders.filter(
          (order: OrderType) =>
            filteredOrders.orderStatus === OrderStatus.PROCESSING
        );
      case 'completed':
        return orders.filter(
          (order: OrderType) =>
            filteredOrders.orderStatus === OrderStatus.COMPLETED
        );
      default:
        return filteredOrders;
    }
  };

  return (
    <div className='container mx-auto py-6'>
      <h1 className='text-3xl font-bold mb-6'>Kitchen Dashboard</h1>

      <Tabs
        defaultValue='all'
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-4 mb-8'>
          <TabsTrigger value='all'>All Orders</TabsTrigger>
          <TabsTrigger value='pending'>New Orders</TabsTrigger>
          <TabsTrigger value='processing'>Processing</TabsTrigger>
          <TabsTrigger value='completed'>Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <KitchenDashboard
            company={company}
            Menuitems={menuItems}
            orders={getFilteredOrders()}
            loading={loading}
            onAcceptOrder={handleAcceptOrder}
            onCompleteOrder={handleCompleteOrder}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
