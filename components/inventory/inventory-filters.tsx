'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown } from 'lucide-react';

interface InventoryFiltersProps {
  filterValue: string;
  onFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
}

export function InventoryFilters({
  filterValue,
  onFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: InventoryFiltersProps) {
  return (
    <div className='flex items-center gap-2 w-full md:w-auto'>
      <div className='relative'>
        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search ingredients...'
          value={filterValue}
          onChange={e => onFilterChange(e.target.value)}
          className='pl-8 w-full md:w-[200px]'
        />
      </div>

      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className='w-[120px]'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='name'>Name</SelectItem>
          <SelectItem value='stock'>Stock</SelectItem>
          <SelectItem value='category'>Category</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant='outline'
        size='icon'
        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        <ArrowUpDown className='h-4 w-4' />
      </Button>
    </div>
  );
}
