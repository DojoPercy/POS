'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChefHat, CheckCircle2, Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Company, MenuItem, OrderType } from '@/lib/types/types';
import { OrderStatus } from '@/lib/enums/enums';

interface OrderDetailViewProps {
  order: OrderType;
  company: Company;
  Menuitems: MenuItem[];
  onAccept: (order: OrderType) => void;
  onComplete: (order: OrderType) => void;
}

export default function OrderDetailView({
  order,
  company,
  Menuitems,
  onAccept,
  onComplete,
}: OrderDetailViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return (
          <Badge
            variant='outline'
            className='bg-amber-100 text-amber-800 border-amber-300 font-medium'
          >
            New
          </Badge>
        );
      case OrderStatus.PROCESSING:
        return (
          <Badge
            variant='outline'
            className='bg-blue-100 text-blue-800 border-blue-300 font-medium'
          >
            Processing
          </Badge>
        );
      case OrderStatus.COMPLETED:
        return (
          <Badge
            variant='outline'
            className='bg-emerald-100 text-emerald-800 border-emerald-300 font-medium'
          >
            Completed
          </Badge>
        );
      case OrderStatus.PAID:
        return (
          <Badge
            variant='outline'
            className='bg-violet-100 text-violet-800 border-violet-300 font-medium'
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

  const getMenuItemName = (menuItemId: string) => {
    const menuItem = Menuitems.find(item => item.id === menuItemId);
    return menuItem ? menuItem.name : `Item #${menuItemId}`;
  };

  const calculateTotal = () => {
    if (!order.orderLines) return 0;
    return order.orderLines.reduce(
      (total, line) => total + (line.totalPrice || 0),
      0
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-start'>
        <div>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-semibold text-gray-800'>
              Order #{order.orderNumber}
            </h2>
            {getStatusBadge(order.orderStatus || '')}
          </div>
          <p className='text-sm text-gray-500 mt-1 flex items-center'>
            <Clock className='h-3.5 w-3.5 mr-1.5' />
            {getTimeAgo(order.createdAt || order.orderedDate)}
          </p>
        </div>

        <div className='space-x-2'>
          {order.orderStatus === OrderStatus.PENDING && (
            <Button
              className='bg-blue-600 hover:bg-blue-700 text-white'
              onClick={() => onAccept(order)}
            >
              <ChefHat className='h-4 w-4 mr-2' /> Accept Order
            </Button>
          )}

          {order.orderStatus === OrderStatus.PROCESSING && (
            <Button
              className='bg-emerald-600 hover:bg-emerald-700 text-white'
              onClick={() => onComplete(order)}
            >
              <CheckCircle2 className='h-4 w-4 mr-2' /> Complete Order
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <ScrollArea className='h-[300px] pr-4'>
        <div className='space-y-4'>
          {order.orderLines?.map((line, index) => (
            <Card key={index} className='overflow-hidden border-gray-200'>
              <CardContent className='p-4'>
                <div className='flex justify-between items-start'>
                  <div>
                    <div className='flex items-center'>
                      <span className='font-medium text-gray-800'>
                        {line.quantity}×
                      </span>
                      <h3 className='font-medium text-gray-800 ml-2'>
                        {getMenuItemName(line.menuItemId || '')}
                      </h3>
                    </div>

                    {line.notes && (
                      <div className='mt-2 bg-gray-50 p-2 rounded-md border border-gray-100'>
                        <p className='text-xs font-medium text-gray-700 flex items-center mb-1'>
                          <FileText className='h-3.5 w-3.5 mr-1.5 text-gray-500' />
                          Special Instructions:
                        </p>
                        <p className='text-sm text-gray-600'>{line.notes}</p>
                      </div>
                    )}
                  </div>

                  <p className='font-medium text-gray-800'>
                    {company.currency}
                    {line.totalPrice?.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className='flex justify-between items-center font-medium text-lg'>
        <span>Total</span>
        <span>
          {company.currency}
          {calculateTotal().toFixed(2)}
        </span>
      </div>
    </div>
  );
}
