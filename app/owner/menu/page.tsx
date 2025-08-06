'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  Plus,
  Grid,
  List,
  Edit,
  Trash2,
  MoreVertical,
  ChefHat,
  Filter,
  Star,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getMenuItemsPerCompany } from '@/redux/companyMenuSlice';
import type { RootState } from '@reduxjs/toolkit';
import { useIsMobile } from '@/hooks/use-mobile';
import { useErrorHandler } from '@/components/error-boundary';
import { useToast } from '@/hooks/use-toast';
import IngredientDisplay from './menu-indregient';
import MenuCategoryForm from './menu-category';
import MenuItemForm from './menu-form';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: Array<{
    id: string;
    name: string;
    price: number;
    menuItemId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  imageUrl?: string;
  imageBase64?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  ingredients?:
    | Array<{
        id: string;
        menuId: string;
        ingredientId: string;
        amount: number;
        ingredient?: {
          name: string;
        };
      }>
    | string[];
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items?: MenuItem[];
}

// Loading skeleton component
const MenuItemSkeleton = () => (
  <Card className='overflow-hidden'>
    <div className='aspect-square bg-slate-200 animate-pulse' />
    <CardContent className='p-4 space-y-3'>
      <Skeleton className='h-6 w-3/4' />
      <Skeleton className='h-4 w-full' />
      <div className='flex justify-between items-center'>
        <Skeleton className='h-6 w-16' />
        <Skeleton className='h-8 w-20' />
      </div>
    </CardContent>
  </Card>
);

// Mobile menu item card component
const MobileMenuItemCard = ({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}) => {
  const basePrice = item.price?.[0]?.price || 0;

  return (
    <Card className='overflow-hidden'>
      <div className='relative'>
        <div className='aspect-square bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center'>
          {item.imageUrl ? (
            <Avatar className='h-16 w-16'>
              <AvatarImage src={item.imageUrl} alt={item.name} />
              <AvatarFallback>
                <ChefHat className='h-8 w-8' />
              </AvatarFallback>
            </Avatar>
          ) : (
            <ChefHat className='h-16 w-16 text-orange-400' />
          )}
        </div>
        <Badge className='absolute top-2 right-2'>
          ${basePrice.toFixed(2)}
        </Badge>
      </div>
      <CardContent className='p-4 space-y-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-slate-900 truncate'>
              {item.name}
            </h3>
            <p className='text-sm text-slate-600 line-clamp-2 mt-1'>
              {item.description || 'No description available'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className='text-red-600'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='flex items-center justify-between text-sm'>
          <Badge variant='outline' className='text-xs'>
            {item.category?.name || 'Uncategorized'}
          </Badge>
          <div className='flex items-center gap-1'>
            <Star className='h-3 w-3 text-yellow-500' />
            <span className='text-xs'>4.5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Desktop menu item card component
const DesktopMenuItemCard = ({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}) => {
  const basePrice = item.price?.[0]?.price || 0;

  return (
    <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
      <div className='relative'>
        <div className='aspect-square bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center'>
          {item.imageUrl ? (
            <Avatar className='h-20 w-20'>
              <AvatarImage src={item.imageUrl} alt={item.name} />
              <AvatarFallback>
                <ChefHat className='h-10 w-10' />
              </AvatarFallback>
            </Avatar>
          ) : (
            <ChefHat className='h-20 w-20 text-orange-400' />
          )}
        </div>
        <Badge className='absolute top-3 right-3'>
          ${basePrice.toFixed(2)}
        </Badge>
      </div>
      <CardContent className='p-6 space-y-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 min-w-0'>
            <h3 className='text-lg font-semibold text-slate-900 truncate'>
              {item.name}
            </h3>
            <p className='text-sm text-slate-600 mt-1 line-clamp-2'>
              {item.description || 'No description available'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className='h-4 w-4 mr-2' />
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className='text-red-600'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='flex items-center justify-between'>
          <Badge variant='outline'>
            {item.category?.name || 'Uncategorized'}
          </Badge>
          <div className='flex items-center gap-2 text-sm'>
            <div className='flex items-center gap-1'>
              <Star className='h-4 w-4 text-yellow-500' />
              <span>4.5</span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock className='h-4 w-4 text-slate-500' />
              <span>15 min</span>
            </div>
          </div>
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' size='sm' className='flex-1'>
            View Details
          </Button>
          <Button variant='outline' size='sm' className='flex-1'>
            Manage Ingredients
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MenuManagement() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { error, handleError, clearError } = useErrorHandler();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editItemOpen, setEditItemOpen] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { menuItems, isLoading } = useSelector(
    (state: RootState) => state.menu,
  );

  // Initialize user
  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  // Fetch menu items
  useEffect(() => {
    if (user?.companyId) {
      dispatch(getMenuItemsPerCompany(user.companyId));
    }
  }, [dispatch, user?.companyId]);

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    menuItems.forEach((item: { category: { name: string } }) => {
      if (item.category?.name) {
        categorySet.add(item.category.name);
      }
    });
    return Array.from(categorySet);
  }, [menuItems]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    const filtered = menuItems.filter((item: MenuItem) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || item.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort items
    filtered.sort((a: MenuItem, b: MenuItem) => {
      switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        const priceA = a.price?.[0]?.price || 0;
        const priceB = b.price?.[0]?.price || 0;
        return priceA - priceB;
      case 'category':
        return (a.category?.name || '').localeCompare(b.category?.name || '');
      default:
        return 0;
      }
    });

    return filtered;
  }, [menuItems, searchTerm, selectedCategory, sortBy]);

  // Group items by category for list view
  const groupedItems = useMemo(() => {
    return filteredAndSortedItems.reduce(
      (acc: Record<string, MenuItem[]>, item: MenuItem) => {
        const categoryName = item.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
      },
      {},
    );
  }, [filteredAndSortedItems]);

  const handleEditItem = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setEditItemOpen(true);
  }, []);

  const handleDeleteItem = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this menu item?')) return;

      try {
        // Implement delete API call here
        toast({
          title: 'Success',
          description: 'Menu item deleted successfully',
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to delete menu item',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handleItemCreated = useCallback(
    (newItem: MenuItem) => {
      setCreateItemOpen(false);
      toast({
        title: 'Success',
        description: 'Menu item created successfully',
      });
    },
    [toast],
  );

  const handleItemUpdated = useCallback(
    (updatedItem: MenuItem) => {
      setEditItemOpen(false);
      setSelectedItem(null);
      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      });
    },
    [toast],
  );

  if (error) {
    return (
      <div className='p-4'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {error.message}. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-2xl lg:text-3xl font-bold text-slate-900'>
            Menu Management
          </h1>
          <p className='text-slate-600 mt-1'>
            Manage your restaurant menu items and categories
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <Button onClick={() => setCreateCategoryOpen(true)} variant='outline'>
            <Plus className='h-4 w-4 mr-2' />
            Add Category
          </Button>
          <Button onClick={() => setCreateItemOpen(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col lg:flex-row gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
            <Input
              placeholder='Search menu items...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        <div className='flex gap-2'>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='name'>Name</SelectItem>
              <SelectItem value='price'>Price</SelectItem>
              <SelectItem value='category'>Category</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex border rounded-md'>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='rounded-r-none'
            >
              <Grid className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='rounded-l-none'
            >
              <List className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-600'>
                  Total Items
                </p>
                <p className='text-2xl font-bold text-slate-900'>
                  {menuItems.length}
                </p>
              </div>
              <ChefHat className='h-8 w-8 text-orange-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-600'>Categories</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {categories.length}
                </p>
              </div>
              <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center'>
                <Filter className='h-5 w-5 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-600'>Avg Price</p>
                <p className='text-2xl font-bold text-green-600'>
                  $
                  {(
                    menuItems.reduce(
                      (sum: any, item: { price: { price: any }[] }) =>
                        sum + (item.price?.[0]?.price || 0),
                      0,
                    ) / Math.max(menuItems.length, 1)
                  ).toFixed(2)}
                </p>
              </div>
              <div className='h-8 w-8 rounded-full bg-green-100 flex items-center justify-center'>
                <Star className='h-5 w-5 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-600'>
                  With Images
                </p>
                <p className='text-2xl font-bold text-purple-600'>
                  {
                    menuItems.filter((item: { imageUrl: any }) => item.imageUrl)
                      .length
                  }
                </p>
              </div>
              <div className='h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center'>
                <div className='h-5 w-5 bg-purple-600 rounded' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items Grid/List */}
      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <MenuItemSkeleton key={i} />
          ))}
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <ChefHat className='h-12 w-12 text-slate-300 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-slate-900 mb-2'>
              No menu items found
            </h3>
            <p className='text-slate-600 mb-4'>
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first menu item'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button onClick={() => setCreateItemOpen(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Add First Item
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <div className='space-y-6'>
          {Object.entries(groupedItems).map(([categoryName, items]) => (
            <Card key={categoryName}>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ChefHat className='h-5 w-5' />
                  {categoryName}
                  <Badge variant='outline'>
                    {(items as MenuItem[]).length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {(items as MenuItem[]).map(item =>
                    isMobile ? (
                      <MobileMenuItemCard
                        key={item.id}
                        item={item}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                      />
                    ) : (
                      <DesktopMenuItemCard
                        key={item.id}
                        item={item}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                      />
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredAndSortedItems.map((item: MenuItem) =>
            isMobile ? (
              <MobileMenuItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ) : (
              <DesktopMenuItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ),
          )}
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={createItemOpen} onOpenChange={setCreateItemOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Create New Menu Item</DialogTitle>
          </DialogHeader>
          <MenuItemForm onSuccess={() => handleItemCreated} />
        </DialogContent>
      </Dialog>

      <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <MenuItemForm
              item={selectedItem}
              onSuccess={() => handleItemUpdated(selectedItem)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createCategoryOpen} onOpenChange={setCreateCategoryOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <MenuCategoryForm onSuccess={() => setCreateCategoryOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
