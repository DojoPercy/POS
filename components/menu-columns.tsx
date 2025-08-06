'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/dataTableColumnHeader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu';
import { MenuCategory, PriceType } from '@/lib/types/types';
import Image from 'next/image';

// Define the MenuItem type based on your database or API response structure.
export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageBase64: string;
  category: string;
  available: boolean;
};

export const columns: ColumnDef<MenuItem>[] = [
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
        aria-label='Select'
      />
    ),
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
  },
  {
    accessorKey: 'imageUrl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Image' />
    ),
    cell: ({ row }) => {
      const url = row.getValue<string>('imageUrl');

      return (
        <div className='flex items-center justify-center '>
          <Image
            src={url}
            alt='Menu Item'
            width={50}
            height={50}
            className='h-12 w-12   object-cover rounded-md'
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue<string | null>('description');
      return description ? (
        <div>{description}</div>
      ) : (
        <div className='text-zinc-400'>N/A</div>
      );
    },
  },
  {
    accessorKey: 'price', // Assuming "prices" is now an array of price objects
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const price = row.getValue<PriceType[]>('price');

      if (!price || price.length === 0) return <div>No Prices</div>;

      return (
        <div>
          {price.map((price, index) => (
            <div key={index}>
              {price.name ? `${price.name} $` : '$'}
              {price.price}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => {
      const category = row.getValue<MenuCategory>('category');

      return (
        <div>
          <div>{category?.name ?? 'gag'}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'available',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Available' />
    ),
    cell: ({ row }) => {
      const available = row.getValue<boolean>('available');
      return <div>{available ? 'Yes' : 'Yes'}</div>;
    },
  },
  {
    id: 'actions',
    header: () => <MoreHorizontal className='h-4 w-4 mx-auto' />,
    cell: ({ row }) => {
      const data = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(data.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Item</DropdownMenuItem>
            <DropdownMenuItem>Remove Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
