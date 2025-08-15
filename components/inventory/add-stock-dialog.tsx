'use client';

import type React from 'react';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  category?: string;
}

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableIngredients: Ingredient[];
  onAddStock: (ingredientId: string, quantity: number) => void;
}

export function AddStockDialog({
  open,
  onOpenChange,
  availableIngredients,
  onAddStock,
}: AddStockDialogProps) {
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIngredient && quantity) {
      onAddStock(selectedIngredient, Number.parseInt(quantity));
      setSelectedIngredient('');
      setQuantity('');
    }
  };

  const selectedIngredientData = availableIngredients.find(
    ing => ing.id === selectedIngredient
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Plus className='h-5 w-5 text-emerald-600' />
            Add New Stock
          </DialogTitle>
          <DialogDescription>
            Add a new ingredient to your branch inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='ingredient'>Ingredient</Label>
            <Select
              value={selectedIngredient}
              onValueChange={setSelectedIngredient}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select an ingredient' />
              </SelectTrigger>
              <SelectContent>
                {availableIngredients.map(ingredient => (
                  <SelectItem key={ingredient.id} value={ingredient.id}>
                    <div className='flex flex-col'>
                      <span className='font-medium'>{ingredient.name}</span>
                      <span className='text-xs text-muted-foreground'>
                        Unit: {ingredient.unit}{' '}
                        {ingredient.category && `• ${ingredient.category}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='quantity'>
              Initial Quantity{' '}
              {selectedIngredientData && `(${selectedIngredientData.unit})`}
            </Label>
            <Input
              id='quantity'
              type='number'
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder='Enter quantity'
              min='1'
              required
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!selectedIngredient || !quantity}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              Add Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
