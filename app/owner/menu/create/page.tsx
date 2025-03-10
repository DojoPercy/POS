"use client";

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
    setRefreshTable((prev) => !prev);
  };

  if (!user) {
    return <p>Loading...</p>; 
  }
  console.log(user);
  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Menu Management</h1>
      <AddMenuItemForm onAddItem={handleAddItem} companyId={user.companyId ?? ""} />
      <Link href="/owner/menu/create/category">
      <Button type="submit" className=" w-2/6">
             {'Add Menu Category'}
          </Button>
          </Link>
    </div>
  );
}
