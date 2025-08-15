'use client';

import type React from 'react';

import type { OrderType } from '@/lib/types/types';
import { OrderStatus } from '@/lib/enums/enums';
import { Card, CardContent } from '@/components/ui/card';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  Utensils,
} from 'lucide-react';
import { differenceInMinutes } from 'date-fns';

interface KitchenStatsProps {
  orders: OrderType[];
}

export default function KitchenStats({ orders }: KitchenStatsProps) {
  // Count orders by status
  const pendingCount = orders.filter(
    order => order.orderStatus === OrderStatus.PENDING
  ).length;
  const processingCount = orders.filter(
    order => order.orderStatus === OrderStatus.PROCESSING
  ).length;
  const completedTodayCount = orders.filter(order => {
    const isCompleted = order.orderStatus === OrderStatus.COMPLETED;
    const completedDate = order.updatedAt ? new Date(order.updatedAt) : null;
    const isToday = completedDate
      ? completedDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
      : false;
    return isCompleted && isToday;
  }).length;

  // Calculate average preparation time
  const completedOrders = orders.filter(
    order =>
      order.orderStatus === OrderStatus.COMPLETED &&
      order.createdAt &&
      order.updatedAt
  );

  let avgPrepTimeMinutes = 0;
  if (completedOrders.length > 0) {
    const totalPrepTime = completedOrders.reduce((total, order) => {
      const startTime = new Date(order.createdAt || Date.now());
      const endTime = new Date(order.updatedAt || Date.now());
      return total + differenceInMinutes(endTime, startTime);
    }, 0);
    avgPrepTimeMinutes = Math.round(totalPrepTime / completedOrders.length);
  }

  // Count total items being prepared
  const totalItemsInPreparation = orders
    .filter(order => order.orderStatus === OrderStatus.PROCESSING)
    .reduce((total, order) => {
      return (
        total + order.orderLines!.reduce((sum, line) => sum + line.quantity, 0)
      );
    }, 0);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
      <StatCard
        title='New Orders'
        value={pendingCount}
        description='Waiting to be accepted'
        icon={<AlertTriangle className='h-5 w-5' />}
        color='yellow'
      />

      <StatCard
        title='In Progress'
        value={processingCount}
        description='Currently being prepared'
        icon={<ChefHat className='h-5 w-5' />}
        color='blue'
      />

      <StatCard
        title='Completed Today'
        value={completedTodayCount}
        description='Orders ready for pickup'
        icon={<CheckCircle2 className='h-5 w-5' />}
        color='green'
      />

      <StatCard
        title='Avg. Prep Time'
        value={`${avgPrepTimeMinutes} min`}
        description='Average preparation time'
        icon={<Clock className='h-5 w-5' />}
        color='purple'
      />

      <StatCard
        title='Items in Prep'
        value={totalItemsInPreparation}
        description='Total items being prepared'
        icon={<Utensils className='h-5 w-5' />}
        color='orange'
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  color: 'yellow' | 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, description, icon, color }: StatCardProps) {
  const colorMap = {
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  const iconColorMap = {
    yellow: 'bg-yellow-200 text-yellow-700',
    blue: 'bg-blue-200 text-blue-700',
    green: 'bg-green-200 text-green-700',
    purple: 'bg-purple-200 text-purple-700',
    orange: 'bg-orange-200 text-orange-700',
  };

  return (
    <Card className={`border ${colorMap[color]}`}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-medium text-sm'>{title}</h3>
          <div className={`p-2 rounded-full ${iconColorMap[color]}`}>
            {icon}
          </div>
        </div>
        <div className='text-3xl font-bold mb-1'>{value}</div>
        <p className='text-xs opacity-70'>{description}</p>
      </CardContent>
    </Card>
  );
}
