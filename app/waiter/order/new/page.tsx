'use client';

import OrderListScreen from '@/components/orders_list_sidebar';
import OrderScreen from '@/components/orderScreen';
import { WaiterHeader } from '@/components/waiter-header';

export default function NewOrderPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/waiter' },
    { label: 'Orders', href: '/waiter/order/view' },
    { label: 'New Order' },
  ];

  return (
    <div className='flex flex-col h-full'>
      <WaiterHeader
        title='New Order'
        breadcrumbs={breadcrumbs}
        showSearch={true}
        showOrderList={true}
      />

      <div className='flex-1 overflow-hidden'>
        <OrderListScreen />
      </div>
    </div>
  );
}
