'use client';

import AddMenuItemForm from '@/components/addmenu';
import { Button } from '@/components/ui/button';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function MenuPage() {
  const [refreshTable, setRefreshTable] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);
  const handleAddItem = () => {
    setRefreshTable(prev => !prev);
  };

  if (!user) {
    return <p>Loading...</p>;
  }
  console.log(user);
  return (
    <div className='container mx-auto py-10 space-y-10'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Menu Management</h1>
        <Link href='/owner/menu/create/category' className='w-2/6'>
          <Button type='submit' className=' w-3/6'>
            {'Add New Menu Category'}
          </Button>
        </Link>
      </div>

      <AddMenuItemForm
        onAddItem={handleAddItem}
        companyId={user.companyId ?? ''}
      />
    </div>
  );
}
