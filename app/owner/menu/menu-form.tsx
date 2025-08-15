'use client';

import { useState, useEffect, Key } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Loader2, Plus } from 'lucide-react';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  imageUrl: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  priceOptions: z
    .array(
      z.object({
        name: z.string().min(1, 'Price option name is required'),
        price: z.number().min(0, 'Price must be positive'),
      })
    )
    .min(1, 'At least one price option is required'),
});

interface MenuItemFormProps {
  item?: any;
  onSuccess: () => void;
  isEdit?: boolean;
}

export default function MenuItemForm({
  item,
  onSuccess,
  isEdit = false,
}: MenuItemFormProps) {
  const [ingredients, setIngredients] = useState<string[]>(
    item?.ingredients || []
  );
  const [newIngredient, setNewIngredient] = useState('');
  const [priceOptions, setPriceOptions] = useState(
    item?.priceOptions || [{ name: 'Regular', price: 0 }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      categoryId: item?.categoryId || '',
      imageUrl: item?.imageUrl || '',
      ingredients: item?.ingredients || [],
      priceOptions: item?.priceOptions || [{ name: 'Regular', price: 0 }],
    },
  });

  useEffect(() => {
    dispatch(fetchUserFromToken());
    // Fetch categories here
  }, [dispatch]);

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      const updatedIngredients = [...ingredients, newIngredient.trim()];
      setIngredients(updatedIngredients);
      form.setValue('ingredients', updatedIngredients);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    const updatedIngredients = ingredients.filter(ing => ing !== ingredient);
    setIngredients(updatedIngredients);
    form.setValue('ingredients', updatedIngredients);
  };

  const addPriceOption = () => {
    const newOptions = [...priceOptions, { name: '', price: 0 }];
    setPriceOptions(newOptions);
    form.setValue('priceOptions', newOptions);
  };

  const removePriceOption = (index: any) => {
    if (priceOptions.length > 1) {
      const newOptions = priceOptions.filter(
        (_: any, i: number) => i !== index
      );
      setPriceOptions(newOptions);
      form.setValue('priceOptions', newOptions);
    }
  };

  const updatePriceOption = (
    index: any,
    field: 'name' | 'price',
    value: string | number
  ) => {
    const newOptions = [...priceOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setPriceOptions(newOptions);
    form.setValue('priceOptions', newOptions);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...values,
        companyId: user?.companyId,
        ingredients,
      };

      // API call here
      console.log('Submitting:', payload);

      toast.success(
        `Menu item ${isEdit ? 'updated' : 'created'} successfully!`
      );
      onSuccess();
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} menu item`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 gap-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder='e.g., Margherita Pizza' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Describe your menu item...'
                  className='resize-none'
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='categoryId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='appetizers'>Appetizers</SelectItem>
                  <SelectItem value='mains'>Main Courses</SelectItem>
                  <SelectItem value='desserts'>Desserts</SelectItem>
                  <SelectItem value='drinks'>Drinks</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='imageUrl'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <div className='space-y-2'>
                  <Input
                    placeholder='https://example.com/image.jpg'
                    {...field}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full bg-transparent'
                  >
                    <Upload className='h-4 w-4 mr-2' />
                    Upload Image
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-3'>
          <FormLabel>Ingredients</FormLabel>
          <div className='flex gap-2'>
            <Input
              placeholder='Add ingredient...'
              value={newIngredient}
              onChange={e => setNewIngredient(e.target.value)}
              onKeyPress={e =>
                e.key === 'Enter' && (e.preventDefault(), addIngredient())
              }
            />
            <Button type='button' onClick={addIngredient} variant='outline'>
              Add
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {ingredients.map((ingredient: any) => (
              <Badge
                key={
                  typeof ingredient === 'string'
                    ? ingredient
                    : (ingredient?.id ?? ingredient?.name)
                }
                variant='secondary'
                className='flex items-center gap-1'
              >
                {typeof ingredient === 'string'
                  ? ingredient
                  : (ingredient?.ingredient.name ?? 'Unknown')}
                <X
                  className='h-3 w-3 cursor-pointer hover:text-red-500'
                  onClick={() => removeIngredient(ingredient)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Price Options Section */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <FormLabel>Price Options</FormLabel>
            <Button
              type='button'
              onClick={addPriceOption}
              variant='outline'
              size='sm'
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Option
            </Button>
          </div>

          <div className='space-y-3'>
            {priceOptions.map(
              (
                option: {
                  name: string | number | readonly string[] | undefined;
                  price: string | number | readonly string[] | undefined;
                },
                index: Key | null | undefined
              ) => (
                <div key={index} className='flex gap-3 items-end'>
                  <div className='flex-1'>
                    <FormLabel className='text-sm'>Option Name</FormLabel>
                    <Input
                      placeholder='e.g., Regular, Large, Small'
                      value={option.name}
                      onChange={e =>
                        updatePriceOption(index, 'name', e.target.value)
                      }
                    />
                  </div>
                  <div className='flex-1'>
                    <FormLabel className='text-sm'>Price ($)</FormLabel>
                    <Input
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                      value={option.price}
                      onChange={e =>
                        updatePriceOption(
                          index,
                          'price',
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  {priceOptions.length > 1 && (
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={() => removePriceOption(index)}
                      className='text-red-600 hover:text-red-700'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <div className='flex gap-3 pt-4'>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='flex-1 bg-purple-500 hover:bg-purple-600'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEdit ? 'Update Item' : 'Create Item'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
