'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Frequent, DecodedToken } from '../lib/types/types';
import { RootState, AppDispatch } from '../redux/index';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFrequentItems } from '@/redux/expensesSlice';
import { fetchUsers } from '@/lib/auth';

// Update the mock data to include quantity
const frequentItems = [
  {
    id: '1',
    itemName: 'Office Paper',
    quantity: 5,
    categoryId: '1',
    categoryName: 'Supplies',
  },
  {
    id: '2',
    itemName: 'Pens',
    quantity: 10,
    categoryId: '1',
    categoryName: 'Supplies',
  },
  {
    id: '3',
    itemName: 'Coffee',
    quantity: 2,
    categoryId: '2',
    categoryName: 'Food & Beverages',
  },
  {
    id: '4',
    itemName: 'Internet Bill',
    quantity: 1,
    categoryId: '3',
    categoryName: 'Utilities',
  },
  {
    id: '5',
    itemName: 'Printer Ink',
    quantity: 3,
    categoryId: '1',
    categoryName: 'Supplies',
  },
];

// Update the interface to include quantity in the onSelect callback
interface FrequentItemSelectorProps {
  onSelect: (
    itemId: string,
    itemName: string,
    categoryId: string,
    quantity: number
  ) => void;
}

export function FrequentItemSelector({ onSelect }: FrequentItemSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUsers] = useState<DecodedToken>();
  const { status, error, Frequent } = useSelector(
    (state: RootState) => state.expenses
  );

  useEffect(() => {
    async () => {
      const user = await fetchUsers();
      setUsers(user);
    };
    dispatch(fetchFrequentItems(user?.branchId || ''));
  }, [dispatch, user]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
        >
          {value
            ? Frequent.find((item: Frequent) => item.id === value)?.itemName
            : 'Select a frequent item...'}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[300px] p-0'>
        <Command>
          <CommandInput placeholder='Search frequent items...' />
          <CommandList>
            <CommandEmpty>No frequent items found.</CommandEmpty>
            <CommandGroup>
              {frequentItems.map(item => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    setValue(item.id === value ? '' : item.id);
                    // Update the onSelect call to include quantity
                    onSelect(
                      item.id,
                      item.itemName,
                      item.categoryId,
                      item.quantity
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {/* Add quantity to the display in CommandItem */}
                  <div className='flex flex-col'>
                    <span>{item.itemName}</span>
                    <span className='text-xs text-muted-foreground'>
                      {item.categoryName} • Qty: {item.quantity}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
