'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@reduxjs/toolkit';
import { DecodedToken } from '@/lib/types/types';
import { fetchUsers } from '@/lib/auth';
import { decode } from 'punycode';
import { addCategory } from '@/redux/expensesSlice';

export function AddCategoryDialog() {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [user, setUser] = useState<DecodedToken | null>(null);
  useEffect(() => {
    const fetchUserData = async () => {
      const user = await fetchUsers();
      setUser(user || null);
    };
    fetchUserData();
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user!.branchId == null) {
      console.log('User does not have a branchId');
      return;
    }
    console.log('Adding category:', categoryName);
    const category = {
      name: categoryName,
      branchId: user!.branchId || '',
    };
    dispatch(addCategory(category));

    setCategoryName('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Plus className='mr-2 h-4 w-4' />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category for organizing your expenses.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className='col-span-3'
                placeholder='e.g., Office Supplies'
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>Save Category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
