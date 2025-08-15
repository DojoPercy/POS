'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Skeleton } from '@/components/ui/skeleton';
import { IngredientTable } from '@/components/indregient/ingredient-table';
import { AddIngredientDialog } from '@/components/indregient/add-ingredient-dialog';
import { IngredientGrid } from '@/components/indregient/ingredient-grid';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  const fetchIngredients = useCallback(async () => {
    if (!user?.companyId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/ingredient?companyId=${user.companyId}`
      );
      if (!response.ok) throw new Error('Failed to fetch ingredients');
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    if (user?.companyId) {
      fetchIngredients();
    }
  }, [fetchIngredients, user?.companyId]);

  const filteredIngredients = ingredients.filter((ingredient: any) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Ingredients</h1>
          <p className='text-muted-foreground mt-1'>
            Manage your companys ingredients inventory
          </p>
        </div>
        <div className='flex items-center gap-2 w-full md:w-auto'>
          <Button
            onClick={() => setShowAddDialog(true)}
            className='flex items-center gap-2 bg-gradient-to-br from-blue-500 to-purple-500'
          >
            <Plus className='h-4 w-4' />
            <span>Add Ingredient</span>
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={fetchIngredients}
            title='Refresh ingredients'
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='flex flex-col md:flex-row gap-4 items-center'>
        <div className='relative w-full md:w-80'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search ingredients...'
            className='pl-8 w-full'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='text-sm text-muted-foreground ml-auto'>
          {!isLoading && `${filteredIngredients.length} ingredients found`}
        </div>
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle>Ingredients Inventory</CardTitle>
          <CardDescription>
            View and manage all ingredients for your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='table'>
            <TabsList className='mb-4'>
              <TabsTrigger value='table'>Table View</TabsTrigger>
              <TabsTrigger value='grid'>Grid View</TabsTrigger>
            </TabsList>
            <TabsContent value='table' className='space-y-4'>
              {isLoading ? (
                <div className='space-y-2'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className='h-12 w-full' />
                  ))}
                </div>
              ) : (
                <IngredientTable
                  ingredients={filteredIngredients}
                  onRefresh={fetchIngredients}
                />
              )}
            </TabsContent>
            <TabsContent value='grid'>
              {isLoading ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className='h-40 w-full' />
                  ))}
                </div>
              ) : (
                <IngredientGrid
                  ingredients={filteredIngredients}
                  onRefresh={fetchIngredients}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddIngredientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchIngredients}
      />
    </div>
  );
}
