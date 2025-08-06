'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, PackageOpen } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
}

interface InventoryStatsProps {
  inventoryData: InventoryItem[];
}

export function InventoryStats({ inventoryData }: InventoryStatsProps) {
  // Calculate statistics
  const totalItems = inventoryData.length;
  const lowStockItems = inventoryData.filter(
    item => item.stock > 0 && item.stock < 10,
  ).length;
  const outOfStockItems = inventoryData.filter(item => item.stock <= 0).length;
  const healthyStockItems = inventoryData.filter(
    item => item.stock >= 10,
  ).length;

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <Card className='bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-900'>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-emerald-600 dark:text-emerald-400'>
                Healthy Stock
              </p>
              <p className='text-3xl font-bold'>{healthyStockItems}</p>
              <p className='text-xs text-muted-foreground mt-1'>
                {Math.round((healthyStockItems / totalItems) * 100) || 0}% of
                inventory
              </p>
            </div>
            <div className='h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
              <CheckCircle className='h-6 w-6 text-emerald-600 dark:text-emerald-400' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-900'>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-amber-600 dark:text-amber-400'>
                Low Stock
              </p>
              <p className='text-3xl font-bold'>{lowStockItems}</p>
              <p className='text-xs text-muted-foreground mt-1'>
                {Math.round((lowStockItems / totalItems) * 100) || 0}% of
                inventory
              </p>
            </div>
            <div className='h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center'>
              <AlertTriangle className='h-6 w-6 text-amber-600 dark:text-amber-400' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border-red-200 dark:border-red-900'>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-red-600 dark:text-red-400'>
                Out of Stock
              </p>
              <p className='text-3xl font-bold'>{outOfStockItems}</p>
              <p className='text-xs text-muted-foreground mt-1'>
                {Math.round((outOfStockItems / totalItems) * 100) || 0}% of
                inventory
              </p>
            </div>
            <div className='h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center'>
              <PackageOpen className='h-6 w-6 text-red-600 dark:text-red-400' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
