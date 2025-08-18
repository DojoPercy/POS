'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import { RootState } from '@/redux';
import {
  ArrowLeft,
  Save,
  DollarSign,
  Calendar,
  Building,
  Tag,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AddExpensePage() {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    branchId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const router = useRouter();
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

      router.push('/owner/expenses');
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

  return (
    <div className='container mx-auto py-6 space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center justify-between'
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
              Add New Expense
            </h1>
            <p className='text-muted-foreground'>
              Create a new expense entry for your business
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className='max-w-2xl mx-auto'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5' />
              Expense Details
            </CardTitle>
            <CardDescription>
              Fill in the details below to create a new expense entry
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {company?.currency} Amount *
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
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
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
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} - {branch.location}
                      </SelectItem>
                    ))}
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
                <Label
                  htmlFor='description'
                  className='flex items-center gap-2'
                >
                  <FileText className='h-4 w-4' />
                  Description
                </Label>
                <Textarea
                  id='description'
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Enter additional details about this expense'
                  rows={4}
                />
              </div>

              {/* Validation Alert */}
              {(!formData.title ||
                !formData.amount ||
                !formData.category ||
                !formData.branchId) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'
                >
                  <AlertCircle className='h-4 w-4 text-yellow-600' />
                  <span className='text-sm text-yellow-800'>
                    Please fill in all required fields marked with *
                  </span>
                </motion.div>
              )}

              {/* Submit Button */}
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
                <Link href='/owner/expenses'>
                  <Button type='button' variant='outline'>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
