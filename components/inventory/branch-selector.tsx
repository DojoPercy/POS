'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
}

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: string;
  onBranchChange: (branchId: string) => void;
}

export function BranchSelector({
  branches,
  selectedBranch,
  onBranchChange,
}: BranchSelectorProps) {
  if (branches.length === 0) {
    return (
      <div className='text-center py-4 text-muted-foreground'>
        No branches available
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <Select value={selectedBranch} onValueChange={onBranchChange}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Select a branch' />
        </SelectTrigger>
        <SelectContent>
          {branches.map(branch => (
            <SelectItem key={branch.id} value={branch.id}>
              <div className='flex items-center gap-2'>
                <Building className='h-4 w-4' />
                <span>{branch.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className='rounded-md border p-4 bg-muted/50'>
        <h3 className='font-medium mb-1'>Selected Branch</h3>
        <p className='text-sm text-muted-foreground'>
          {branches.find(branch => branch.id === selectedBranch)?.name ||
            'None selected'}
        </p>
        <p className='text-xs text-muted-foreground mt-2'>
          Inventory data shown is specific to this branch
        </p>
      </div>
    </div>
  );
}
