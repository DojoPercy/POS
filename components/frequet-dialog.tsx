'use client';

import type React from 'react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

// Mock data for demonstration
const categories = [
  { id: '1', name: 'Supplies' },
  { id: '2', name: 'Food & Beverages' },
  { id: '3', name: 'Utilities' },
  { id: '4', name: 'Rent' },
  { id: '5', name: 'Salaries' },
];

interface AddFrequentItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFrequentItemDialog({
  open,
  onOpenChange,
}: AddFrequentItemDialogProps) {
  // Update the form data state to include quantity
  const [formData, setFormData] = useState({
    itemName: '',
    categoryId: '',
    quantity: 1, // Add default quantity
  });

  // Update the handleInputChange function to handle number inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number.parseInt(value) || 1 : value,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      categoryId: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would add the logic to save the frequent item
    console.log('Saving frequent item:', formData);
    // Reset quantity in the form reset
    setFormData({ itemName: '', categoryId: '', quantity: 1 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Frequent Item
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Frequent Item</DialogTitle>
            <DialogDescription>
              Create a new frequent item for quick expense entry.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='itemName' className='text-right'>
                Item Name
              </Label>
              <Input
                id='itemName'
                name='itemName'
                value={formData.itemName}
                onChange={handleInputChange}
                className='col-span-3'
                required
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='category' className='text-right'>
                Category
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={handleSelectChange}
                required
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Add quantity field to the form */}
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='quantity' className='text-right'>
                Quantity
              </Label>
              <Input
                id='quantity'
                name='quantity'
                type='number'
                min='1'
                value={formData.quantity}
                onChange={handleInputChange}
                className='col-span-3'
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>Save Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
