'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BranchSelector } from '@/components/inventory/branch-selector';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { InventoryGrid } from '@/components/inventory/inventory-grid';
import { InventoryStats } from '@/components/inventory/inventory-stats';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Clipboard,
  Download,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import { RootState } from '@/redux';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  stockId: string | null;
  minStock?: number;
  maxStock?: number;
  category?: string;
}

interface Branch {
  id: string;
  name: string;
  location: string;
}

export default function InventoryPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [inventoryStock, setInventoryStock] = useState<any[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [companyIdState, setCompanyIdState] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('table');

  const companyId = useSelector(
    (state: any) => state.company?.currentCompanyId,
  );
  const { company } = useSelector((state: RootState) => state.company);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);
  const fetchBranches = useCallback(async () => {
    setIsLoadingBranches(true);
    try {
      const response = await fetch(`/api/branches?companyId=${company?.id}`);
      if (!response.ok) throw new Error('Failed to fetch branches');
      const data = await response.json();
      setBranches(data);
      if (data.length > 0 && !selectedBranch) {
        setSelectedBranch(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch branches',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBranches(false);
    }
  }, [company?.id, selectedBranch, toast]);

  const fetchIngredients = useCallback(async () => {
    setIsLoadingIngredients(true);
    try {
      const response = await fetch(`/api/ingredient?companyId=${company?.id}`);
      if (!response.ok) throw new Error('Failed to fetch ingredients');
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch ingredients',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingIngredients(false);
    }
  }, [company?.id, toast]);

  const fetchInventoryStock = useCallback(async () => {
    if (!selectedBranch) return;
    setIsLoadingStock(true);
    try {
      const response = await fetch(
        `/api/inventory_stock?branchId=${selectedBranch}`,
      );
      if (!response.ok) throw new Error('Failed to fetch inventory stock');
      const data = await response.json();
      setInventoryStock(data);
    } catch (error) {
      console.error('Error fetching inventory stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory stock',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStock(false);
    }
  }, [selectedBranch, toast]);

  // Fetch company details when user is loaded
  useEffect(() => {
    if (user && user.companyId) {
      dispatch(getCompanyDetails(user.companyId));
    }
  }, [dispatch, user]);

  // Fetch branches and ingredients when company is loaded
  useEffect(() => {
    if (company?.id) {
      fetchBranches();
      fetchIngredients();
    }
  }, [company?.id, fetchBranches, fetchIngredients]);

  // Fetch inventory stock when branch is selected
  useEffect(() => {
    if (selectedBranch) {
      fetchInventoryStock();
    }
  }, [fetchInventoryStock, selectedBranch]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
  };

  const handleRefresh = () => {
    fetchInventoryStock();
    toast({
      title: 'Refreshed',
      description: 'Inventory data has been updated',
    });
  };

  const handleUpdateStock = async (ingredientId: string, quantity: number) => {
    try {
      const response = await fetch('/api/inventory_stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredientId,
          branchId: selectedBranch,
          quantity,
        }),
      });

      if (!response.ok) throw new Error('Failed to update stock');

      toast({
        title: 'Success',
        description: 'Inventory stock updated successfully',
      });
      fetchInventoryStock();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inventory stock',
        variant: 'destructive',
      });
    }
  };

  // Prepare data for display - merge ingredients with their stock information
  const prepareInventoryData = (): InventoryItem[] => {
    return ingredients.map((ingredient: any) => {
      const stockItem = inventoryStock.find(
        (stock: any) => stock.ingredientId === ingredient.id,
      );
      return {
        ...ingredient,
        stock: stockItem ? stockItem.quantity : 0,
        stockId: stockItem ? stockItem.id : null,
      };
    });
  };

  // Filter and sort the inventory data
  const getFilteredAndSortedData = (): InventoryItem[] => {
    const data = prepareInventoryData();

    // Filter
    const filtered = filterValue
      ? data.filter((item: any) =>
        item.name.toLowerCase().includes(filterValue.toLowerCase()),
      )
      : data;

    // Sort
    return filtered.sort((a: any, b: any) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'stock') {
        return sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      }
      return 0;
    });
  };

  const inventoryData = getFilteredAndSortedData();

  const exportToCSV = () => {
    const headers = ['Ingredient Name', 'Unit', 'Current Stock'];
    const csvData = inventoryData.map((item: any) => [
      item.name,
      item.unit,
      item.stock,
    ]);
    const csvContent = [
      headers.join(','),
      ...csvData.map((row: any) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `inventory-${new Date().toISOString().split('T')[0]}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Exported',
      description: 'Inventory data exported to CSV',
    });
  };

  const copyToClipboard = () => {
    const headers = ['Ingredient Name', 'Unit', 'Current Stock'];
    const textData = inventoryData.map((item: any) => [
      item.name,
      item.unit,
      item.stock,
    ]);
    const textContent = [
      headers.join('\t'),
      ...textData.map((row: any) => row.join('\t')),
    ].join('\n');

    navigator.clipboard.writeText(textContent);
    toast({
      title: 'Copied',
      description: 'Inventory data copied to clipboard',
    });
  };

  const isLoading = isLoadingBranches || isLoadingIngredients || isLoadingStock;

  return (
    <div className='container mx-auto py-6 space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'
      >
        <div>
          <div className='flex items-center gap-2 mb-2'>
            <Package className='h-8 w-8 text-primary' />
            <h1 className='text-3xl font-bold tracking-tight'>
              Inventory Management
            </h1>
          </div>
          <p className='text-muted-foreground'>
            Track and manage ingredient stock across all branches
          </p>
        </div>

        <div className='flex items-center gap-2 w-full md:w-auto'>
          <Button
            variant='outline'
            size='icon'
            onClick={handleRefresh}
            disabled={isLoading}
            title='Refresh inventory'
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={copyToClipboard}
            title='Copy to clipboard'
          >
            <Clipboard className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={exportToCSV}
            title='Export to CSV'
          >
            <Download className='h-4 w-4' />
          </Button>
        </div>
      </motion.div>

      {/* Branch Selection and Stats */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5' />
                Branch Selection
              </CardTitle>
              <CardDescription>
                Select a branch to manage inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBranches ? (
                <Skeleton className='h-10 w-full' />
              ) : (
                <BranchSelector
                  branches={branches}
                  selectedBranch={selectedBranch}
                  onBranchChange={handleBranchChange}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className='lg:col-span-3'
        >
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Inventory Statistics</CardTitle>
              <CardDescription>
                Overview of your current inventory status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Skeleton className='h-24 w-full' />
                  <Skeleton className='h-24 w-full' />
                  <Skeleton className='h-24 w-full' />
                </div>
              ) : (
                <InventoryStats inventoryData={inventoryData} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex flex-col md:flex-row justify-between md:items-center gap-4'>
              <div>
                <CardTitle>Inventory Stock</CardTitle>
                <CardDescription>
                  Manage ingredient stock levels for{' '}
                  {branches.find((branch: any) => branch.id === selectedBranch)
                    ?.name || 'selected branch'}
                </CardDescription>
              </div>
              <InventoryFilters
                filterValue={filterValue}
                onFilterChange={setFilterValue}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
              />
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  <InventoryTable
                    inventoryData={inventoryData}
                    onUpdateStock={handleUpdateStock}
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
                  <InventoryGrid
                    inventoryData={inventoryData}
                    onUpdateStock={handleUpdateStock}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
