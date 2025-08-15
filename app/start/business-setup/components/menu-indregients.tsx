'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Utensils } from 'lucide-react';
import { IngredientsManagement } from './ingredient-management';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Ingredient, MenuIngredient } from '@/lib/types/types';
import { is } from 'date-fns/locale';

interface MenuIngredientsProps {
  companyId: string;
  menuId?: string;
  initialIngredients?: MenuIngredient[];
  allIngredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
  onChange: (ingredients: MenuIngredient[]) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}

export function MenuIngredients(
  this: any,
  {
    companyId,
    menuId,
    initialIngredients = [],
    allIngredients = [],
    onIngredientsChange,
    onChange,
    isDialogOpen,
    setIsDialogOpen,
  }: MenuIngredientsProps
) {
  const [menuIngredients, setMenuIngredients] =
    useState<MenuIngredient[]>(initialIngredients);

  useEffect(() => {
    if (initialIngredients.length > 0) {
      setMenuIngredients(initialIngredients);
    }
  }, [initialIngredients]);

  const handleIngredientSelect = (ingredient: Ingredient) => {
    const exists = menuIngredients.some(
      item =>
        item.ingredientId === ingredient.id ||
        item.ingredient.id === ingredient.id
    );

    if (!exists && ingredient.id) {
      const newIngredient: MenuIngredient = {
        ingredientId: ingredient.id,
        menuId: menuId,
        amount: 0,
        ingredient: ingredient,
      };

      const updatedIngredients = [...menuIngredients, newIngredient];
      setMenuIngredients(updatedIngredients);
      onChange(updatedIngredients);
    }
  };

  const handleAmountChange = (index: number, amount: number) => {
    const updatedIngredients = [...menuIngredients];
    updatedIngredients[index].amount = amount;
    setMenuIngredients(updatedIngredients);
    onChange(updatedIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...menuIngredients];
    updatedIngredients.splice(index, 1);
    setMenuIngredients(updatedIngredients);
    onChange(updatedIngredients);
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h3 className='text-lg font-medium mb-4'>Ingredients List</h3>
          <IngredientsManagement
            companyId={companyId}
            ingredients={allIngredients}
            onIngredientsChange={onIngredientsChange}
            onIngredientSelect={handleIngredientSelect}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />
        </div>

        <div>
          <h3 className='text-lg font-medium mb-4'>Recipe Ingredients</h3>
          <Card>
            <CardContent className='p-4'>
              {menuIngredients.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8 text-center'>
                  <Utensils className='h-12 w-12 text-muted-foreground mb-4' />
                  <p className='text-muted-foreground'>
                    No ingredients added yet
                  </p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Select ingredients from the list to add them to this menu
                    item
                  </p>
                </div>
              ) : (
                <ScrollArea className='h-[400px] pr-4'>
                  <div className='space-y-3'>
                    {menuIngredients.map((menuIngredient, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-3 border rounded-md hover:border-primary transition-colors'
                      >
                        <div className='flex-1'>
                          <div className='font-medium'>
                            {menuIngredient.ingredient.name}
                          </div>
                          <Badge variant='outline' className='mt-1'>
                            {menuIngredient.ingredient.unit}
                          </Badge>
                        </div>
                        <div className='flex items-center space-x-3'>
                          <div className='w-24'>
                            <Label
                              htmlFor={`amount-${index}`}
                              className='sr-only'
                            >
                              Amount
                            </Label>
                            <Input
                              id={`amount-${index}`}
                              type='number'
                              min='0'
                              step='0.01'
                              value={menuIngredient.amount || ''}
                              onChange={e =>
                                handleAmountChange(
                                  index,
                                  Number.parseFloat(e.target.value) || 0
                                )
                              }
                              className='text-right'
                            />
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleRemoveIngredient(index)}
                            className='h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
