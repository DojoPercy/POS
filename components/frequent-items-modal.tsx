'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import { RootState } from '@/redux';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Tag,
  Building,
  Save,
  X,
  Search,
  RefreshCw,
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface Category {
  id: string;
  name: string;
}

interface FrequentItem {
  id: string;
  itemName: string;
  categoryId: string;
  category: {
    name: string;
  };
  branchId: string;
  branch: {
    name: string;
  };
  quantity: number;
  createdAt: string;
  usageCount?: number;
}

interface FrequentItemsModalProps {
  onItemAdded?: () => void;
}

export function FrequentItemsModal({ onItemAdded }: FrequentItemsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [frequentItems, setFrequentItems] = useState<FrequentItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<FrequentItem | null>(null);

  const [formData, setFormData] = useState({
    itemName: '',
    categoryId: '',
    branchId: '',
    quantity: '1',
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

    if (company?.id) {
      fetchBranches();
      fetchCategories();
    }
  }, [company?.id, toast]);

  useEffect(() => {
    const fetchFrequentItems = async () => {
      setIsLoadingItems(true);
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
        setIsLoadingItems(false);
      }
    };

    if (company?.id && isOpen) {
      fetchFrequentItems();
    }
  }, [company?.id, isOpen, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemName || !formData.categoryId || !formData.branchId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = editingItem
        ? `/api/expenses/frequent-items/${editingItem.id}`
        : '/api/expenses/frequent-items';

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          companyId: company?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${editingItem ? 'update' : 'create'} frequent item`
        );
      }

      toast({
        title: 'Success',
        description: `Frequent item ${editingItem ? 'updated' : 'created'} successfully`,
      });

      // Reset form and refresh items
      setFormData({
        itemName: '',
        categoryId: '',
        branchId: '',
        quantity: '1',
      });
      setEditingItem(null);
      setIsAddingItem(false);

      // Refresh the list
      const refreshResponse = await fetch(
        `/api/expenses/frequent-items?companyId=${company?.id}`
      );
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setFrequentItems(data);
      }

      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error) {
      console.error('Error saving frequent item:', error);
      toast({
        title: 'Error',
        description: `Failed to ${editingItem ? 'update' : 'create'} frequent item`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: FrequentItem) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      categoryId: item.categoryId,
      branchId: item.branchId,
      quantity: item.quantity.toString(),
    });
    setIsAddingItem(true);
  };

  const handleDelete = async (itemId: string) => {
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

  const resetForm = () => {
    setFormData({
      itemName: '',
      categoryId: '',
      branchId: '',
      quantity: '1',
    });
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const filteredItems = frequentItems.filter(item => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.branch.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = !selectedBranch || item.branchId === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Settings className='mr-2 h-4 w-4' />
          Manage Frequent Items
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Manage Frequent Items
          </DialogTitle>
          <DialogDescription>
            Create and manage frequently used expense items for quick access
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Filters */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search items...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className='w-full sm:w-[200px]'>
                <SelectValue placeholder='All Branches' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant='outline'
              onClick={() => {
                setSearchTerm('');
                setSelectedBranch('');
              }}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Clear
            </Button>
          </div>

          {/* Add/Edit Form */}
          {isAddingItem && (
            <div className='p-4 border rounded-lg bg-gray-50'>
              <h3 className='font-semibold mb-4'>
                {editingItem ? 'Edit Frequent Item' : 'Add New Frequent Item'}
              </h3>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='itemName'>Item Name *</Label>
                    <Input
                      id='itemName'
                      name='itemName'
                      value={formData.itemName}
                      onChange={handleInputChange}
                      placeholder='Enter item name'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='quantity'>Quantity</Label>
                    <Input
                      id='quantity'
                      name='quantity'
                      type='number'
                      min='1'
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder='1'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='categoryId'>Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={value =>
                        handleSelectChange('categoryId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select category' />
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
                      onValueChange={value =>
                        handleSelectChange('branchId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select branch' />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button type='submit' disabled={isLoading}>
                    <Save className='mr-2 h-4 w-4' />
                    {isLoading
                      ? 'Saving...'
                      : editingItem
                        ? 'Update'
                        : 'Create'}
                  </Button>
                  <Button type='button' variant='outline' onClick={resetForm}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Add Button */}
          {!isAddingItem && (
            <Button onClick={() => setIsAddingItem(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Add Frequent Item
            </Button>
          )}

          {/* Items Table */}
          <div className='border rounded-lg'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingItems ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-8'>
                      Loading frequent items...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-center py-8 text-muted-foreground'
                    >
                      No frequent items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className='font-medium'>
                        {item.itemName}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>{item.category.name}</Badge>
                      </TableCell>
                      <TableCell>{item.branch?.name || 'N/A'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>{item.usageCount || 0}</Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
