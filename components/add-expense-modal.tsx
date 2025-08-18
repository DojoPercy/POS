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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import { RootState } from '@/redux';
import {
  Plus,
  DollarSign,
  Calendar,
  Building,
  Tag,
  FileText,
  AlertCircle,
  Save,
  X,
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

interface AddExpenseModalProps {
  onExpenseAdded?: () => void;
}

export function AddExpenseModal({ onExpenseAdded }: AddExpenseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    branchId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isFrequent: false,
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    try {
      const response = await fetch('/api/expenses', {
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
        throw new Error('Failed to create expense');
      }

      toast({
        title: 'Success',
        description: 'Expense created successfully',
      });

      // Reset form
      setFormData({
        title: '',
        amount: '',
        category: '',
        branchId: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        isFrequent: false,
      });

      // Close modal
      setIsOpen(false);

      // Callback to refresh parent component
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to create expense',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: '',
      branchId: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      isFrequent: false,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Add New Expense
          </DialogTitle>
          <DialogDescription>
            Create a new expense entry for your business
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title' className='flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Expense Title *
            </Label>
            <Input
              id='title'
              name='title'
              value={formData.title}
              onChange={handleInputChange}
              placeholder='Enter expense title'
              required
            />
          </div>

          {/* Amount */}
          <div className='space-y-2'>
            <Label htmlFor='amount' className='flex items-center gap-2'>
              <DollarSign className='h-4 w-4' />
              {company?.currency || '$'} Amount *
            </Label>
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

          {/* Category */}
          <div className='space-y-2'>
            <Label htmlFor='category' className='flex items-center gap-2'>
              <Tag className='h-4 w-4' />
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={value => handleSelectChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <SelectItem value='' disabled>
                    Loading categories...
                  </SelectItem>
                ) : (
                  categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Branch */}
          <div className='space-y-2'>
            <Label htmlFor='branchId' className='flex items-center gap-2'>
              <Building className='h-4 w-4' />
              Branch *
            </Label>
            <Select
              value={formData.branchId}
              onValueChange={value => handleSelectChange('branchId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a branch' />
              </SelectTrigger>
              <SelectContent>
                {isLoadingBranches ? (
                  <SelectItem value='' disabled>
                    Loading branches...
                  </SelectItem>
                ) : (
                  branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className='space-y-2'>
            <Label htmlFor='date' className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              Date *
            </Label>
            <Input
              id='date'
              name='date'
              type='date'
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description' className='flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Description
            </Label>
            <Textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Enter additional details about this expense'
              rows={3}
            />
          </div>

          {/* Validation Alert */}
          {(!formData.title ||
            !formData.amount ||
            !formData.category ||
            !formData.branchId) && (
            <div className='flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <AlertCircle className='h-4 w-4 text-yellow-600' />
              <span className='text-sm text-yellow-800'>
                Please fill in all required fields marked with *
              </span>
            </div>
          )}

          {/* Submit Buttons */}
          <div className='flex gap-4 pt-4'>
            <Button
              type='submit'
              disabled={
                isLoading ||
                !formData.title ||
                !formData.amount ||
                !formData.category ||
                !formData.branchId
              }
              className='flex-1'
            >
              <Save className='mr-2 h-4 w-4' />
              {isLoading ? 'Creating...' : 'Create Expense'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpen(false)}
            >
              <X className='mr-2 h-4 w-4' />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
