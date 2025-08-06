'use client';

import type React from 'react';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClipLoader } from 'react-spinners';
import { fetchMenuCategoriesOfCompany } from '@/redux/CompanyCategoryMenuSlice';
import { Plus, Trash2, Utensils } from 'lucide-react';
import { uploadBase64Image } from '@/lib/cloudnary';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { clearMenuitems } from '@/lib/dexie/actions';
import Image from 'next/image';

interface PriceOption {
  name: string;
  price: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

interface IngredientWithAmount extends Ingredient {
  amount: number;
}

interface MenuItemFormData {
  name: string;
  description: string;
  prices: PriceOption[];
  imageBase64: string;
  imageUrl: string;
  categoryId: string;
  useIngredients: boolean;
  ingredients: IngredientWithAmount[];
}

export default function AddMenuItemForm({
  companyId,
  onAddItem,
}: {
  companyId: string;
  onAddItem: () => void;
}) {
  const dispatch = useDispatch();
  const { categories, status, error } = useSelector(
    (state: any) => state.menuCategories,
  );

  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    prices: [{ name: 'Regular', price: '' }], // Default price option
    imageBase64: '',
    imageUrl: '',
    categoryId: '',
    useIngredients: false,
    ingredients: [],
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);
  const [loadingIngredients, setLoadingIngredients] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (companyId) {
      dispatch(fetchMenuCategoriesOfCompany(companyId));
    }
  }, [companyId, dispatch]);
  const fetchIngredients = useCallback(async () => {
    setLoadingIngredients(true);
    try {
      const response = await fetch(`/api/ingredient?companyId=${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch ingredients');
      const data = await response.json();
      setAvailableIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoadingIngredients(false);
    }
  }, [companyId]);

  const handleChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    if (formData.useIngredients && companyId) {
      fetchIngredients();
    }
  }, [formData.useIngredients, companyId, fetchIngredients]);

  const handlePriceChange = (
    index: number,
    field: 'name' | 'price',
    value: string,
  ) => {
    setFormData(prev => {
      const updatedPrices = [...prev.prices];
      updatedPrices[index] = { ...updatedPrices[index], [field]: value };
      return { ...prev, prices: updatedPrices };
    });
  };

  const addPriceOption = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { name: '', price: '' }],
    }));
  };

  const removePriceOption = (index: number) => {
    if (formData.prices.length > 1) {
      setFormData(prev => {
        const updatedPrices = [...prev.prices];
        updatedPrices.splice(index, 1);
        return { ...prev, prices: updatedPrices };
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageBase64: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = (ingredient: Ingredient) => {
    if (formData.ingredients.some(i => i.id === ingredient.id)) return;

    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...ingredient, amount: 1 }],
    }));
  };

  const removeIngredient = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i.id !== id),
    }));
  };

  const updateIngredientAmount = (id: string, amount: number) => {
    if (amount <= 0) return;

    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(i =>
        i.id === id ? { ...i, amount } : i,
      ),
    }));
  };

  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    // Validate prices
    if (formData.prices.some(p => !p.name || !p.price)) {
      setFormError('All price options must have both a name and price');
      setLoading(false);
      return;
    }

    // Validate ingredients if enabled
    if (formData.useIngredients && formData.ingredients.length === 0) {
      setFormError('Please add at least one ingredient or disable ingredients');
      setLoading(false);
      return;
    }

    try {
      // Format prices for API
      const formattedPrices = formData.prices.map(p => ({
        name: p.name,
        price: Number.parseFloat(p.price),
      }));

      const url = await uploadBase64Image(formData.imageBase64);

      // Create the menu item first
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          prices: formattedPrices,
          categoryId: formData.categoryId,
          imageUrl: url,
          companyId,
        }),
      });

      await clearMenuitems();
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add menu item');
      }

      const menuItem = await response.json();

      // If ingredients are enabled, add them to the menu item
      if (formData.useIngredients && formData.ingredients.length > 0) {
        const ingredientPromises = formData.ingredients.map(ingredient =>
          fetch('/api/menu_ingredient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              menuId: menuItem.id,
              ingredientId: ingredient.id,
              amount: ingredient.amount,
            }),
          }),
        );

        await Promise.all(ingredientPromises);
      }

      setSuccessMessage('Menu item added successfully');
      setTimeout(() => setSuccessMessage(null), 2000);

      // Reset form
      setFormData({
        name: '',
        description: '',
        prices: [{ name: 'Regular', price: '' }],
        imageBase64: '',
        imageUrl: '',
        categoryId: '',
        useIngredients: false,
        ingredients: [],
      });

      onAddItem();
    } catch (err: any) {
      setFormError(
        err.message || 'An error occurred while adding the menu item',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-3xl mx-auto shadow-lg border-muted'>
      <CardHeader className='bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
        <CardTitle className='text-2xl font-bold text-center flex items-center justify-center gap-2'>
          <Utensils className='h-6 w-6' />
          Add Menu Item
        </CardTitle>
        <CardDescription className='text-center'>
          Create a new item for your menu
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Tabs defaultValue='basic' className='w-full'>
            <TabsList className='grid grid-cols-2 mb-4'>
              <TabsTrigger value='basic'>Basic Information</TabsTrigger>
              <TabsTrigger
                value='ingredients'
                disabled={!formData.useIngredients}
              >
                Ingredients
              </TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder='Enter item name'
                    className='border-slate-300'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='category'>Category</Label>
                  <Select
                    onValueChange={value => handleChange('categoryId', value)}
                    value={formData.categoryId}
                    required
                  >
                    <SelectTrigger className='border-slate-300'>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      {status === 'loading' ? (
                        <SelectItem disabled value={''}>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem disabled value={''}>
                          No categories found
                        </SelectItem>
                      ) : (
                        categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description || ''}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder='Describe your menu item'
                  className='min-h-[100px] border-slate-300'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='image'>Image</Label>
                <Input
                  id='image'
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='border-slate-300'
                  required
                />
                {formData.imageBase64 && (
                  <div className='mt-2 relative w-32 h-32 rounded-md overflow-hidden border border-slate-300'>
                    <Image
                      src={formData.imageBase64 || '/placeholder.svg'}
                      alt='Preview'
                      className='w-full h-full object-cover'
                    />
                  </div>
                )}
              </div>

              <Accordion
                type='single'
                collapsible
                defaultValue='prices'
                className='w-full'
              >
                <AccordionItem value='prices'>
                  <AccordionTrigger className='text-base font-medium'>
                    Price Options
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='space-y-4'>
                      <div className='flex justify-end'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={addPriceOption}
                          className='flex items-center gap-1'
                        >
                          <Plus className='h-4 w-4' /> Add Price Option
                        </Button>
                      </div>

                      {formData.prices.map((price, index) => (
                        <div
                          key={index}
                          className='flex gap-3 items-start p-3 rounded-md border border-slate-200 bg-slate-50 dark:bg-slate-900'
                        >
                          <div className='flex-1'>
                            <Label
                              htmlFor={`price-name-${index}`}
                              className='text-xs mb-1 block'
                            >
                              Option Name
                            </Label>
                            <Input
                              id={`price-name-${index}`}
                              placeholder='e.g., Small, Medium, Large'
                              value={price.name}
                              onChange={e =>
                                handlePriceChange(index, 'name', e.target.value)
                              }
                              className='border-slate-300'
                              required
                            />
                          </div>
                          <div className='flex-1'>
                            <Label
                              htmlFor={`price-value-${index}`}
                              className='text-xs mb-1 block'
                            >
                              Price
                            </Label>
                            <Input
                              id={`price-value-${index}`}
                              type='number'
                              step='0.01'
                              placeholder='0.00'
                              value={price.price}
                              onChange={e =>
                                handlePriceChange(
                                  index,
                                  'price',
                                  e.target.value,
                                )
                              }
                              className='border-slate-300'
                              required
                            />
                          </div>
                          {formData.prices.length > 1 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='mt-6'
                              onClick={() => removePriceOption(index)}
                            >
                              <Trash2 className='h-4 w-4 text-destructive' />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className='flex items-center space-x-2 pt-2'>
                <Switch
                  id='use-ingredients'
                  checked={formData.useIngredients}
                  onCheckedChange={checked =>
                    handleChange('useIngredients', checked)
                  }
                />
                <Label htmlFor='use-ingredients' className='font-medium'>
                  Enable Ingredients
                </Label>
              </div>
            </TabsContent>

            <TabsContent value='ingredients' className='space-y-4'>
              {formData.useIngredients && (
                <>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Card className='border-slate-200'>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-lg'>
                          Available Ingredients
                        </CardTitle>
                        <div className='mt-2'>
                          <Input
                            placeholder='Search ingredients...'
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className='border-slate-300'
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className='h-[300px] pr-4'>
                          {loadingIngredients ? (
                            <div className='flex justify-center items-center h-full'>
                              <ClipLoader size={24} />
                            </div>
                          ) : filteredIngredients.length === 0 ? (
                            <div className='text-center py-8 text-muted-foreground'>
                              {searchQuery
                                ? 'No matching ingredients found'
                                : 'No ingredients available'}
                            </div>
                          ) : (
                            <div className='space-y-2'>
                              {filteredIngredients.map(ingredient => (
                                <div
                                  key={ingredient.id}
                                  className='flex justify-between items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                                >
                                  <div>
                                    <div className='font-medium'>
                                      {ingredient.name}
                                    </div>
                                    <div className='text-xs text-muted-foreground'>
                                      Unit: {ingredient.unit}
                                    </div>
                                  </div>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => addIngredient(ingredient)}
                                    disabled={formData.ingredients.some(
                                      i => i.id === ingredient.id,
                                    )}
                                  >
                                    {formData.ingredients.some(
                                      i => i.id === ingredient.id,
                                    )
                                      ? 'Added'
                                      : 'Add'}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card className='border-slate-200'>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-lg'>
                          Selected Ingredients
                        </CardTitle>
                        <CardDescription>
                          {formData.ingredients.length} ingredient
                          {formData.ingredients.length !== 1 ? 's' : ''}{' '}
                          selected
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className='h-[300px] pr-4'>
                          {formData.ingredients.length === 0 ? (
                            <div className='text-center py-8 text-muted-foreground'>
                              No ingredients selected
                            </div>
                          ) : (
                            <div className='space-y-3'>
                              {formData.ingredients.map(ingredient => (
                                <div
                                  key={ingredient.id}
                                  className='p-3 rounded-md border border-slate-200 bg-slate-50 dark:bg-slate-900'
                                >
                                  <div className='flex justify-between items-center mb-2'>
                                    <div className='font-medium'>
                                      {ingredient.name}
                                    </div>
                                    <Badge variant='outline'>
                                      {ingredient.unit}
                                    </Badge>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <Button
                                      type='button'
                                      variant='outline'
                                      size='icon'
                                      className='h-8 w-8'
                                      onClick={() =>
                                        updateIngredientAmount(
                                          ingredient.id,
                                          ingredient.amount - 1,
                                        )
                                      }
                                      disabled={ingredient.amount <= 1}
                                    >
                                      -
                                    </Button>
                                    <Input
                                      type='number'
                                      min='1'
                                      value={ingredient.amount}
                                      onChange={e =>
                                        updateIngredientAmount(
                                          ingredient.id,
                                          Number(e.target.value),
                                        )
                                      }
                                      className='w-20 text-center border-slate-300'
                                    />
                                    <Button
                                      type='button'
                                      variant='outline'
                                      size='icon'
                                      className='h-8 w-8'
                                      onClick={() =>
                                        updateIngredientAmount(
                                          ingredient.id,
                                          ingredient.amount + 1,
                                        )
                                      }
                                    >
                                      +
                                    </Button>
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='icon'
                                      className='h-8 w-8 ml-auto text-destructive'
                                      onClick={() =>
                                        removeIngredient(ingredient.id)
                                      }
                                    >
                                      <Trash2 className='h-4 w-4' />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <Separator className='my-4' />

          {formError && (
            <Alert variant='destructive'>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => onAddItem()}>
              Cancel
            </Button>
            <Button type='submit' className='min-w-[120px]'>
              {loading ? (
                <ClipLoader color={'#fff'} loading={loading} size={20} />
              ) : (
                'Add Menu Item'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
