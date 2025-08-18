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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import { RootState } from '@/redux';
import {
  RefreshCw,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  Calendar,
  Building,
  CheckCircle,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

import { AddExpenseModal } from '@/components/add-expense-modal';
import { FrequentItemsModal } from '@/components/frequent-items-modal';
import { AddCategoryDialog } from '@/components/add-category';
import { DatePickerWithRange } from '@/components/date';
import type { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  branchId: string;
  branchName: string;
  date: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
  pendingExpenses: number;
  approvedExpenses: number;
  rejectedExpenses: number;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}

export default function ExpensesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('table');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);

  const companyId = useSelector(
    (state: any) => state.company?.currentCompanyId
  );
  const { company } = useSelector((state: RootState) => state.company);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId));
    }
  }, [dispatch, user?.companyId]);

  const fetchBranches = useCallback(async () => {
    setIsLoadingBranches(true);
    try {
      const response = await fetch(`/api/branches?companyId=${company?.id}`);
      if (!response.ok) throw new Error('Failed to fetch branches');
      const data = await response.json();
      setBranches(data);
      // Don't auto-select a branch - let user choose "All Branches" or specific branch
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

  const fetchExpenses = useCallback(async () => {
    if (!company?.id) {
      setExpenses([]);
      return;
    }

    setIsLoadingExpenses(true);
    try {
      const fromDate = dateRange?.from
        ? format(dateRange.from, 'yyyy-MM-dd')
        : '';
      const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

      const response = await fetch(
        `/api/expenses?companyId=${company.id}&branchId=${selectedBranch}&from=${fromDate}&to=${toDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch expenses',
        variant: 'destructive',
      });
      setExpenses([]);
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [selectedBranch, dateRange, toast]);

  const fetchExpenseStats = useCallback(async () => {
    if (!company?.id) {
      setExpenseStats(null);
      return;
    }

    try {
      const fromDate = dateRange?.from
        ? format(dateRange.from, 'yyyy-MM-dd')
        : '';
      const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

      const response = await fetch(
        `/api/expenses/summary?companyId=${company.id}&branchId=${selectedBranch}&from=${fromDate}&to=${toDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch expense stats');
      const data = await response.json();
      setExpenseStats(data);
    } catch (error) {
      console.error('Error fetching expense stats:', error);
      setExpenseStats(null);
    }
  }, [selectedBranch, dateRange]);

  useEffect(() => {
    if (company?.id) {
      fetchBranches();
    }
  }, [company?.id, fetchBranches]);

  useEffect(() => {
    if (company?.id) {
      fetchExpenses();
      fetchExpenseStats();
    }
  }, [
    company?.id,
    selectedBranch,
    dateRange,
    fetchExpenses,
    fetchExpenseStats,
  ]);

  const handleRefresh = () => {
    fetchExpenses();
    fetchExpenseStats();
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    // The useEffect will automatically trigger a refresh when dateRange changes
  };

  const filteredExpenses = expenses.filter(expense => {
    const title = (expense.title || '').toLowerCase();
    const category = (expense.category || '').toLowerCase();
    const branchName = (expense.branchName || '').toLowerCase();
    const searchTerm = filterValue.toLowerCase();

    return (
      title.includes(searchTerm) ||
      category.includes(searchTerm) ||
      branchName.includes(searchTerm)
    );
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Expense];
    let bValue: any = b[sortBy as keyof Expense];

    // Handle undefined/null values
    if (aValue === undefined || aValue === null) aValue = '';
    if (bValue === undefined || bValue === null) bValue = '';

    if (sortBy === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const isLoading = isLoadingBranches || isLoadingExpenses;

  return (
    <div className='container mx-auto py-6 space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'
      >
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Expenses Management
          </h1>
          <p className='text-muted-foreground'>
            Track and manage expenses across all branches
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <AddCategoryDialog />
          <AddExpenseModal onExpenseAdded={handleRefresh} />
          <FrequentItemsModal onItemAdded={handleRefresh} />
          <Button
            variant='outline'
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Branch Selector and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='grid grid-cols-1 lg:grid-cols-4 gap-6'
      >
        {/* Branch Selector */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <Building className='h-5 w-5' />
              Select Branch
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBranches ? (
              <Skeleton className='h-10 w-full' />
            ) : (
              <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        {/* Date Range */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={handleDateRangeChange}
              placeholder='Select date range'
            />
          </CardContent>
        </Card>

        {/* Search Filter */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <Filter className='h-5 w-5' />
              Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type='text'
              placeholder='Search expenses...'
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </CardContent>
        </Card>

        {/* Sort Options */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Sort By
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='date'>Date</option>
              <option value='amount'>Amount</option>
              <option value='title'>Title</option>
              <option value='category'>Category</option>
            </select>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='desc'>Descending</option>
              <option value='asc'>Ascending</option>
            </select>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
      >
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5 text-green-600' />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-8 w-20' />
            ) : (
              <div className='text-2xl font-bold text-green-600'>
                ${(expenseStats?.totalAmount || 0).toFixed(2)}
              </div>
            )}
            <p className='text-sm text-muted-foreground'>
              {expenseStats?.totalExpenses || 0} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5 text-blue-600' />
              Average Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-8 w-20' />
            ) : (
              <div className='text-2xl font-bold text-blue-600'>
                ${(expenseStats?.averageAmount || 0).toFixed(2)}
              </div>
            )}
            <p className='text-sm text-muted-foreground'>Per expense</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <TrendingDown className='h-5 w-5 text-yellow-600' />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-8 w-20' />
            ) : (
              <div className='text-2xl font-bold text-yellow-600'>
                {expenseStats?.pendingExpenses || 0}
              </div>
            )}
            <p className='text-sm text-muted-foreground'>Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-8 w-20' />
            ) : (
              <div className='text-2xl font-bold text-green-600'>
                {expenseStats?.approvedExpenses || 0}
              </div>
            )}
            <p className='text-sm text-muted-foreground'>Approved expenses</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex flex-col md:flex-row justify-between md:items-center gap-4'>
              <div>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>
                  Manage expenses for{' '}
                  {selectedBranch
                    ? branches.find(branch => branch.id === selectedBranch)
                        ?.name
                    : 'all branches'}
                </CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Button variant='outline'>
                  <Download className='mr-2 h-4 w-4' />
                  Export
                </Button>
              </div>
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
                  <div className='space-y-4'>
                    <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
                      <div className='relative w-full sm:w-auto'>
                        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                          type='search'
                          placeholder='Search expenses...'
                          className='w-full sm:w-[300px] pl-8'
                          value={filterValue}
                          onChange={e => setFilterValue(e.target.value)}
                        />
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Branch</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedExpenses.map(expense => (
                          <TableRow key={expense.id}>
                            <TableCell className='font-medium'>
                              {expense.title || 'Untitled'}
                            </TableCell>
                            <TableCell>
                              {expense.category || 'Uncategorized'}
                            </TableCell>
                            <TableCell>
                              ${(expense.amount || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>{expense.branchName || 'N/A'}</TableCell>
                            <TableCell>
                              {expense.date
                                ? format(new Date(expense.date), 'MMM dd, yyyy')
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  expense.status === 'approved'
                                    ? 'default'
                                    : expense.status === 'pending'
                                      ? 'secondary'
                                      : 'destructive'
                                }
                              >
                                {expense.status || 'unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-right'>
                              <Button variant='ghost' size='sm'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {sortedExpenses.map(expense => (
                      <Card
                        key={expense.id}
                        className='hover:shadow-md transition-shadow'
                      >
                        <CardHeader className='pb-3'>
                          <div className='flex justify-between items-start'>
                            <div>
                              <CardTitle className='text-lg'>
                                {expense.title || 'Untitled'}
                              </CardTitle>
                              <CardDescription>
                                {expense.category || 'Uncategorized'}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                expense.status === 'approved'
                                  ? 'default'
                                  : expense.status === 'pending'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {expense.status || 'unknown'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className='space-y-2'>
                            <div className='flex justify-between'>
                              <span className='text-sm text-muted-foreground'>
                                Amount:
                              </span>
                              <span className='font-semibold'>
                                ${(expense.amount || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-sm text-muted-foreground'>
                                Branch:
                              </span>
                              <span className='text-sm'>
                                {expense.branchName || 'N/A'}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-sm text-muted-foreground'>
                                Date:
                              </span>
                              <span className='text-sm'>
                                {expense.date
                                  ? format(
                                      new Date(expense.date),
                                      'MMM dd, yyyy'
                                    )
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
