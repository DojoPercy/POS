'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Edit2, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  stockId: string | null;
  minStock?: number;
  category?: string;
  lastUpdated?: string;
}

interface InventoryTableProps {
  inventoryData: InventoryItem[];
  onUpdateStock: (ingredientId: string, quantity: number) => void;
  isBranchManager?: boolean;
}

export function InventoryTable({
  inventoryData,
  onUpdateStock,
  isBranchManager = false,
}: InventoryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValue(item.stock.toString());
  };

  const handleSave = (item: InventoryItem) => {
    const newStock = Number.parseInt(editValue);
    if (!isNaN(newStock) && newStock >= 0) {
      const difference = newStock - item.stock;
      onUpdateStock(item.id, difference);
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const getStockStatus = (stock: number, minStock = 10) => {
    if (stock === 0)
      return { label: 'Out of Stock', variant: 'destructive' as const };
    if (stock < minStock)
      return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Quick Actions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryData.map((item, index) => {
            const status = getStockStatus(item.stock, item.minStock);
            return (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className='group hover:bg-muted/50'
              >
                <TableCell className='font-medium'>{item.name}</TableCell>
                <TableCell>
                  <Badge variant='outline' className='text-xs'>
                    {item.category || 'General'}
                  </Badge>
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <Input
                      type='number'
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className='w-20'
                      min='0'
                    />
                  ) : (
                    <span className='font-semibold'>{item.stock}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className='text-sm text-muted-foreground'>
                  {formatDate(item.lastUpdated)}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => onUpdateStock(item.id, -1)}
                      disabled={item.stock <= 0}
                      title='Remove 1'
                    >
                      <Minus className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => onUpdateStock(item.id, 1)}
                      title='Add 1'
                    >
                      <Plus className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => onUpdateStock(item.id, 10)}
                      title='Add 10'
                    >
                      <span className='text-xs font-bold'>+10</span>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {editingId === item.id ? (
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => handleSave(item)}
                      >
                        <Check className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-8 w-8'
                        onClick={handleCancel}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className='h-3 w-3' />
                    </Button>
                  )}
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
