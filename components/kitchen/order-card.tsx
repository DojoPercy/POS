'use client';

import type { OrderType } from '@/lib/types/types';
import { OrderStatus } from '@/lib/enums/enums';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, ChefHat } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getMenuItemsPerCompany } from '@/redux/companyMenuSlice';
import { fetchMenuCategoriesOfCompany } from '@/redux/CompanyCategoryMenuSlice';
import { selectUser, fetchUserFromToken } from '@/redux/authSlice';
import { RootState } from '@/redux';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { MenuItem } from '../menu-columns';

interface OrderCardProps {
  order: OrderType;
  onViewDetails: (order: OrderType) => void;
  onAccept: (order: OrderType) => void;
  onComplete: (order: OrderType) => void;
}

export default function OrderCard({
  order,
  onViewDetails,
  onAccept,
  onComplete,
}: OrderCardProps) {
  const dispatch = useDispatch();
  const { menuItems } = useSelector((state: RootState) => state.menu);

  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getMenuItemsPerCompany(user.companyId));
      dispatch(fetchMenuCategoriesOfCompany(user.companyId));
    }
  }, [dispatch, user?.companyId]);
  const getStatusBadge = (status: string) => {
    switch (status) {
    case OrderStatus.PENDING:
      return (
        <Badge
          variant='outline'
          className='bg-yellow-100 text-yellow-800 border-yellow-300'
        >
            New
        </Badge>
      );
    case OrderStatus.PROCESSING:
      return (
        <Badge
          variant='outline'
          className='bg-blue-100 text-blue-800 border-blue-300'
        >
            Processing
        </Badge>
      );
    case OrderStatus.COMPLETED:
      return (
        <Badge
          variant='outline'
          className='bg-green-100 text-green-800 border-green-300'
        >
            Completed
        </Badge>
      );
    case OrderStatus.PAID:
      return (
        <Badge
          variant='outline'
          className='bg-purple-100 text-purple-800 border-purple-300'
        >
            Paid
        </Badge>
      );
    default:
      return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Unknown time';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getOrderItems = (order: OrderType) => {
    if (!order.orderLines || order.orderLines.length === 0) return 'No items';

    return order.orderLines
      .reduce((acc, line) => {
        const menuItem = menuItems.find(
          (item: MenuItem) => item.id === line.menuItemId,
        );
        return (
          acc +
          (line.quantity > 1 ? `${line.quantity}× ` : '') +
          (menuItem.name || `Item #${line.menuItemId}`) +
          ', '
        );
      }, '')
      .slice(0, -2);
  };

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${
        order.orderStatus === OrderStatus.PENDING
          ? 'border-yellow-300 bg-yellow-50/50'
          : order.orderStatus === OrderStatus.PROCESSING
            ? 'border-blue-300 bg-blue-50/50'
            : ''
      }`}
    >
      <CardContent className='p-0'>
        <div className='p-4'>
          <div className='flex justify-between items-start mb-3'>
            <div>
              <h3 className='font-semibold text-lg'>
                Order #{order.orderNumber}
              </h3>
              <div className='flex items-center text-sm text-muted-foreground mt-1'>
                <Clock className='h-3.5 w-3.5 mr-1' />
                {getTimeAgo(order.createdAt || order.orderedDate)}
              </div>
            </div>
            {getStatusBadge(order.orderStatus || '')}
          </div>

          <div className='mb-4'>
            <p className='text-sm font-medium'>Items:</p>
            <p className='text-sm text-muted-foreground line-clamp-2'>
              {getOrderItems(order)}
            </p>
          </div>

          <div className='flex justify-between items-center'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onViewDetails(order)}
            >
              View Details
            </Button>

            <div className='space-x-2'>
              {order.orderStatus === OrderStatus.PENDING && (
                <Button
                  size='sm'
                  className='bg-blue-600 hover:bg-blue-700'
                  onClick={() => onAccept(order)}
                >
                  <ChefHat className='h-4 w-4 mr-1' /> Accept
                </Button>
              )}

              {order.orderStatus === OrderStatus.PROCESSING && (
                <Button
                  size='sm'
                  className='bg-green-600 hover:bg-green-700'
                  onClick={() => onComplete(order)}
                >
                  <CheckCircle2 className='h-4 w-4 mr-1' /> Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
