'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { OrderType } from '@/lib/types/types';

const getStatusColor = (status: string) => {
  switch (status) {
  case 'COMPLETED':
  case 'PAID':
    return 'bg-green-100 text-green-800 border-green-200';
  case 'PENDING':
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  case 'CANCELLED':
    return 'bg-red-100 text-red-800 border-red-200';
  case 'PROCESSING':
    return 'bg-blue-100 text-blue-800 border-blue-200';
  default:
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
  case 'PAID':
    return 'Completed';
  case 'PENDING':
    return 'Pending';
  case 'CANCELLED':
    return 'Error';
  case 'PROCESSING':
    return 'Processing';
  default:
    return status;
  }
};

export const columns = (
  companyCurrency: string,
  onOrderClick?: (order: OrderType) => void,
): ColumnDef<OrderType>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label='Select row'
        onClick={e => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'orderNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ORDER' />
    ),
    cell: ({ row }) => (
      <div className='font-medium text-gray-900'>
        {row.getValue('orderNumber')}
      </div>
    ),
  },
  {
    accessorKey: 'pickupNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PICKUP' />
    ),
    cell: ({ row }) => <div className='text-gray-600'>{'N/A'}</div>,
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='CUSTOMER' />
    ),
    cell: ({ row }) => <div className='text-gray-600'>{'Walk-in'}</div>,
  },
  {
    accessorKey: 'branchName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='BRANCH' />
    ),
    cell: ({ row }) => (
      <div className='text-gray-600'>{row.getValue('branchName')}</div>
    ),
  },
  {
    accessorKey: 'orderLines',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ITEM' />
    ),
    cell: ({ row }) => {
      const orderLines = row.getValue('orderLines') as any[];
      const firstItem = orderLines?.[0]?.menuItem?.name || 'No items';
      const additionalCount =
        orderLines?.length > 1 ? ` +${orderLines.length - 1}` : '';
      return (
        <div className='text-gray-600'>
          {firstItem}
          {additionalCount}
        </div>
      );
    },
  },
  {
    accessorKey: 'finalPrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PRICE' />
    ),
    cell: ({ row }) => {
      const amount =
        Number(row.getValue('finalPrice')) ||
        Number(row.original.totalPrice) ||
        0;
      return (
        <div className='font-medium text-gray-900'>
          {companyCurrency}
          {amount.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: 'orderLines',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='DESCRIPTION' />
    ),
    cell: ({ row }) => {
      const orderLines = row.getValue('orderLines') as any[];
      const firstNote = orderLines?.[0]?.notes;
      return (
        <div className='text-gray-500 max-w-xs truncate'>
          {firstNote || 'No special instructions'}
        </div>
      );
    },
  },
  {
    accessorKey: 'orderStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='STATUS' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('orderStatus') as string;
      return (
        <Badge className={`${getStatusColor(status)} border`}>
          {getStatusText(status)}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(order.orderNumber || '')
              }
            >
              Copy Order Number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onOrderClick?.(order)}>
              <Eye className='mr-2 h-4 w-4' />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className='mr-2 h-4 w-4' />
              Edit Order
            </DropdownMenuItem>
            <DropdownMenuItem className='text-red-600'>
              <Trash2 className='mr-2 h-4 w-4' />
              Cancel Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
