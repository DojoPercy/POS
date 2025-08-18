'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal, Search } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddFrequentItemDialog } from '@/components/frequet-dialog';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../redux/index';
import { DecodedToken, Expense } from '@/lib/types/types';
import { fetchUsers } from '@/lib/auth';
import {
  addExpense,
  fetchCategories,
  fetchFrequentItems,
} from '@/redux/expensesSlice';
import { Category, Frequent } from '../../../../lib/types/types';

// Mock data for demonstration

export default function FrequentItemsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUsers] = useState<DecodedToken>();
  const { status, error, frequentItems, categories } = useSelector(
    (state: RootState) => state.expenses
  );

  useEffect(() => {
    async () => {
      const user = await fetchUsers();
      setUsers(user);
    };
    dispatch(fetchFrequentItems(user?.branchId || ''));
  }, [dispatch, user]);

  const filteredItems = frequentItems.filter(
    (item: Frequent) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='icon' asChild>
          <Link href='/branch/expenses'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <h1 className='text-3xl font-bold tracking-tight'>Frequent Items</h1>
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Frequent Items</CardTitle>
            <CardDescription>
              Manage your frequently used expense items
            </CardDescription>
          </div>
          <AddFrequentItemDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search frequent items...'
                className='w-full pl-8'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className='w-[50px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item: Frequent) => (
                      <TableRow key={item.id}>
                        <TableCell className='font-medium'>
                          {item.itemName}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>Open menu</span>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  // Logic to add expense from frequent item
                                  window.location.href = `/add-expense?frequentItem=${item.id}`;
                                }}
                              >
                                Add as Expense
                              </DropdownMenuItem>
                              <DropdownMenuItem className='text-destructive'>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className='h-24 text-center'>
                        No frequent items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
