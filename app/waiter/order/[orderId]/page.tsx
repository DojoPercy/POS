'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchOrders } from '@/redux/orderSlice';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import OrderScreen from '@/components/orderScreen';

export default function EditOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);

  const { loading, error } = useSelector((state: any) => state.orders);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);
  useEffect(() => {
    dispatch(fetchOrders(user?.userId!) as any);
  }, [dispatch, user?.userId]);

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <h1 className='text-3xl font-bold mb-6'>Error</h1>
        <p className='text-red-500 mb-4'>{error}</p>
        <Button onClick={() => router.push('/orders')}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <main className='container mx-auto p-4'>
      <div className='flex items-center mb-6'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => router.push('/orders')}
          className='mr-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' /> Back to Orders
        </Button>
        <h1 className='text-3xl font-bold'>Edit Order</h1>
      </div>

      {loading ? (
        <div className='flex justify-center py-12'>
          <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
        </div>
      ) : (
        <OrderScreen orderId={orderId} />
      )}
    </main>
  );
}
