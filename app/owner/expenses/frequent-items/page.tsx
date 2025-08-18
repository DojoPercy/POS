'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import { RootState } from '@/redux';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Tag,
  Building,
  Search,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

interface FrequentItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  categoryName: string;
  branchId: string;
  branchName: string;
  description?: string;
  usageCount: number;
}

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface Category {
  id: string;
  name: string;
}

export default function FrequentItemsPage() {
  const [frequentItems, setFrequentItems] = useState<FrequentItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FrequentItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    branchId: '',
    description: '',
  });

  const dispatch = useDispatch();
  const { toast } = useToast();
  const user = useSelector(selectUser);
  const { company } = useSelector((state: RootState) => state.company);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId));
    }
  }, [dispatch, user?.companyId]);

  useEffect(() => {
    const fetchBranches = async () => {
      setIsLoadingBranches(true);
      try {
        const response = await fetch(`/api/branches?companyId=${company?.id}`);
        if (!response.ok) throw new Error('Failed to fetch branches');
        const data = await response.json();
        setBranches(data);
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
    };

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch(
          `/api/expenses/category?companyId=${company?.id}`
        );
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch categories',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    const fetchFrequentItems = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/expenses/frequent-items?companyId=${company?.id}`
        );
        if (!response.ok) throw new Error('Failed to fetch frequent items');
        const data = await response.json();
        setFrequentItems(data);
      } catch (error) {
        console.error('Error fetching frequent items:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch frequent items',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (company?.id) {
      fetchBranches();
      fetchCategories();
      fetchFrequentItems();
    }
  }, [company?.id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.amount ||
      !formData.category ||
      !formData.branchId
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/expenses/frequent-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          companyId: company?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create frequent item');
      }

      toast({
        title: 'Success',
        description: 'Frequent item created successfully',
      });

      setIsAddDialogOpen(false);
      setFormData({
        title: '',
        amount: '',
        category: '',
        branchId: '',
        description: '',
      });

      // Refresh the list
      const refreshResponse = await fetch(
        `/api/expenses/frequent-items?companyId=${company?.id}`
      );
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setFrequentItems(data);
      }
    } catch (error) {
      console.error('Error creating frequent item:', error);
      toast({
        title: 'Error',
        description: 'Failed to create frequent item',
        variant: 'destructive',
      });
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !editingItem ||
      !formData.title ||
      !formData.amount ||
      !formData.category ||
      !formData.branchId
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/expenses/frequent-items/${editingItem.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            amount: parseFloat(formData.amount),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update frequent item');
      }

      toast({
        title: 'Success',
        description: 'Frequent item updated successfully',
      });

      setIsEditDialogOpen(false);
      setEditingItem(null);
      setFormData({
        title: '',
        amount: '',
        category: '',
        branchId: '',
        description: '',
      });

      // Refresh the list
      const refreshResponse = await fetch(
        `/api/expenses/frequent-items?companyId=${company?.id}`
      );
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setFrequentItems(data);
      }
    } catch (error) {
      console.error('Error updating frequent item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update frequent item',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this frequent item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/frequent-items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete frequent item');
      }

      toast({
        title: 'Success',
        description: 'Frequent item deleted successfully',
      });

      // Refresh the list
      const refreshResponse = await fetch(
        `/api/expenses/frequent-items?companyId=${company?.id}`
      );
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setFrequentItems(data);
      }
    } catch (error) {
      console.error('Error deleting frequent item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete frequent item',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (item: FrequentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      amount: item.amount.toString(),
      category: item.category,
      branchId: item.branchId,
      description: item.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const filteredItems = frequentItems.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = !selectedBranch || item.branchId === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className='container mx-auto py-6 space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'
      >
        <div className='flex items-center gap-4'>
          <Link href='/owner/expenses'>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Expenses
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Frequent Items
            </h1>
            <p className='text-muted-foreground'>
              Manage frequently used expense items for quick access
            </p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Frequent Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Frequent Item</DialogTitle>
              <DialogDescription>
                Create a new frequently used expense item
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddItem} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Title *</Label>
                <Input
                  id='title'
                  name='title'
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder='Enter item title'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='amount'>Amount *</Label>
                <Input
                  id='amount'
                  name='amount'
                  type='number'
                  step='0.01'
                  min='0'
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder='0.00'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={value => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
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
              <div className='space-y-2'>
                <Label htmlFor='branchId'>Branch *</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={value => handleSelectChange('branchId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a branch' />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} - {branch.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Input
                  id='description'
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Enter description'
                />
              </div>
              <div className='flex gap-2 pt-4'>
                <Button type='submit' className='flex-1'>
                  Add Item
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='grid grid-cols-1 md:grid-cols-3 gap-4'
      >
        <div className='space-y-2'>
          <Label className='flex items-center gap-2'>
            <Search className='h-4 w-4' />
            Search
          </Label>
          <Input
            placeholder='Search items...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label className='flex items-center gap-2'>
            <Building className='h-4 w-4' />
            Branch
          </Label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger>
              <SelectValue placeholder='All branches' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All branches</SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Items Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className='p-6'>
                  <div className='space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/3'></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <DollarSign className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No frequent items found
              </h3>
              <p className='text-gray-500 mb-4'>
                {searchTerm || selectedBranch
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first frequent item'}
              </p>
              {!searchTerm && !selectedBranch && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add First Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredItems.map(item => (
              <Card key={item.id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-lg'>{item.title}</CardTitle>
                      <CardDescription>{item.categoryName}</CardDescription>
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        Amount:
                      </span>
                      <span className='font-semibold'>
                        ${item.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        Branch:
                      </span>
                      <span className='text-sm'>{item.branchName}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        Usage:
                      </span>
                      <span className='text-sm'>{item.usageCount} times</span>
                    </div>
                    {item.description && (
                      <div className='pt-2 border-t'>
                        <p className='text-sm text-muted-foreground'>
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Frequent Item</DialogTitle>
            <DialogDescription>
              Update the details of this frequent item
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditItem} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-title'>Title *</Label>
              <Input
                id='edit-title'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                placeholder='Enter item title'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-amount'>Amount *</Label>
              <Input
                id='edit-amount'
                name='amount'
                type='number'
                step='0.01'
                min='0'
                value={formData.amount}
                onChange={handleInputChange}
                placeholder='0.00'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-category'>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={value => handleSelectChange('category', value)}
              >
                <SelectTrigger>
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
            <div className='space-y-2'>
              <Label htmlFor='edit-branchId'>Branch *</Label>
              <Select
                value={formData.branchId}
                onValueChange={value => handleSelectChange('branchId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a branch' />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-description'>Description</Label>
              <Input
                id='edit-description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='Enter description'
              />
            </div>
            <div className='flex gap-2 pt-4'>
              <Button type='submit' className='flex-1'>
                Update Item
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
