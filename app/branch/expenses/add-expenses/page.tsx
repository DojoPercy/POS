'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FrequentItemSelector } from '@/components/frequent-item-selector';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../redux/index';
import { DecodedToken, Expense } from '@/lib/types/types';
import { fetchUsers } from '@/lib/auth';
import { addExpense, fetchCategories } from '@/redux/expensesSlice';
import { Category } from '../../../../lib/types/types';

export default function AddExpensePage() {
  const [useFrequentItem, setUseFrequentItem] = useState(false);
  const [selectedFrequentItem, setSelectedFrequentItem] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 1,
    categoryId: '',
    amount: '',
    isFrequent: false,
  });
  const dispatch = useDispatch<AppDispatch>();
  const [users, setUsers] = useState<DecodedToken>();
  const { status, error, Frequent, categories } = useSelector(
    (state: RootState) => state.expenses,
  );

  useEffect(() => {
    async () => {
      const user = await fetchUsers();
      console.log(user?.branchId);
      setUsers(user);
    };
    console.log(users?.branchId);
    dispatch(fetchCategories(users?.branchId || ''));
  }, [dispatch, users]);

  const handleFrequentItemSelect = (
    itemId: string,
    itemName: string,
    categoryId: string,
    quantity: number,
  ) => {
    setSelectedFrequentItem(itemId);
    setFormData({
      ...formData,
      itemName,
      categoryId,
      quantity,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newexpense: Expense = {
      isFrequent: formData.isFrequent,
      itemName: formData.itemName,
      categoryId: formData.categoryId,
      quantity: formData.quantity,

      amount: parseFloat(formData.amount),
    };
    dispatch(addExpense(newexpense));
    setFormData({
      itemName: '',
      quantity: 1,
      categoryId: '',
      amount: '',
      isFrequent: false,
    });

    console.log('Saving expense:', formData);
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='icon' asChild>
          <Link href='/branch/expenses'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <h1 className='text-3xl font-bold tracking-tight'>Add Expense</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>
            Enter the details of your new expense
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='useFrequentItem'
                checked={useFrequentItem}
                onCheckedChange={checked =>
                  setUseFrequentItem(checked as boolean)
                }
              />
              <Label htmlFor='useFrequentItem'>Use a frequent item</Label>
            </div>

            {useFrequentItem ? (
              <div className='space-y-6'>
                <FrequentItemSelector onSelect={handleFrequentItemSelect} />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='quantity'>Quantity</Label>
                    <Input
                      id='quantity'
                      name='quantity'
                      type='number'
                      min='1'
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='amount'>Amount</Label>
                    <Input
                      id='amount'
                      name='amount'
                      type='number'
                      step='0.01'
                      min='0'
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className='grid gap-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='itemName'>Item Name</Label>
                    <Input
                      id='itemName'
                      name='itemName'
                      value={formData.itemName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='categoryId'>Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={value =>
                        handleSelectChange('categoryId', value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories && categories.length > 0 ? (
                          categories.map((category: Category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id || ''}
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value=''>No category found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='quantity'>Quantity</Label>
                    <Input
                      id='quantity'
                      name='quantity'
                      type='number'
                      min='1'
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='amount'>Amount</Label>
                    <Input
                      id='amount'
                      name='amount'
                      type='number'
                      step='0.01'
                      min='0'
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {!useFrequentItem && (
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='isFrequent'
                  name='isFrequent'
                  checked={formData.isFrequent}
                  onCheckedChange={checked =>
                    setFormData({ ...formData, isFrequent: checked as boolean })
                  }
                />
                <Label htmlFor='isFrequent'>Save as frequent item</Label>
              </div>
            )}

            <div className='flex justify-end gap-2'>
              <Button variant='outline' asChild>
                <Link href='/'>Cancel</Link>
              </Button>
              <Button type='submit'>Save Expense</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
