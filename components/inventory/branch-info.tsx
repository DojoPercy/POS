'use client';

import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Building } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  location: string;
  city: string;
  status: string;
  openingHours?: string;
}

interface BranchInfoProps {
  branch: Branch | null;
}

export function BranchInfo({ branch }: BranchInfoProps) {
  if (!branch) return null;

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Building className='h-4 w-4 text-muted-foreground' />
        <span className='font-semibold'>{branch.name}</span>
      </div>

      <div className='flex items-center gap-2'>
        <MapPin className='h-4 w-4 text-muted-foreground' />
        <span className='text-sm'>
          {branch.location}, {branch.city}
        </span>
      </div>

      {branch.openingHours && (
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm'>{branch.openingHours}</span>
        </div>
      )}

      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>Status:</span>
        <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
          {branch.status.charAt(0).toUpperCase() + branch.status.slice(1)}
        </Badge>
      </div>
    </div>
  );
}
