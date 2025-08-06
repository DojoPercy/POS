'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Download, TrendingUp, ShoppingBag } from 'lucide-react';
import { addDays, format } from 'date-fns';
import {
  type StatisticHeaderDef,
  StatisticHeaders,
  StatisticFns,
} from '@/components/stats-header';
import { columnsRevenueIncome } from '@/components/columns-stats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import type { DateRange } from 'react-day-picker';
import { ResponsiveLineChart } from '@/components/responsive-line-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrderSummaryByDateRange } from '@/lib/order';
import { useParams } from 'next/navigation';
import { getBranchById } from '@/lib/branch';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { DatePickerWithRange } from '@/components/date';
import { BranchHeader } from '@/components/branch-header';
import { BranchPerformanceChart } from '@/components/performance';

type GraphDataDef = {
  [key: number]: {
    date: string;
    sales: number;
    [key: string]: string | number;
  }[];
};

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  status: 'active' | 'inactive';
}

export default function BranchStatistics() {
  const { branchId } = useParams();
  const { toast } = useToast();
  const [refresh, setRefresh] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const [selectedHeader, setSelectedHeader] = useState<StatisticHeaderDef>(
    StatisticHeaders[0],
  );
  const [headerData, setHeaderData] = useState<number[]>([]);
  const [graphData, setGraphData] = useState<GraphDataDef>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/branch' },
    { label: 'Statistics' },
  ];

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const branchData: Branch = await getBranchById(branchId.toString());
        setBranch(branchData);
      } catch (error) {
        console.error('Error fetching branch:', error);
        toast({
          title: 'Error',
          description: 'Failed to load branch information',
          variant: 'destructive',
        });
      }
    };
    fetchBranch();
  }, [branchId, toast]);

  useEffect(() => {
    if (!refresh) return;

    setIsLoading(true);
    setHeaderData([]);
    setGraphData({});
    setTableData([]);

    const updatePage = async () => {
      try {
        const headerContent: number[] = [];
        for (const header of StatisticHeaders) {
          if (date?.from && date?.to) {
            const headerValue = await header.call(
              date.from,
              date.to,
              branchId.toString(),
            );
            headerContent.push(headerValue);
          }
        }

        const graphContent: GraphDataDef = {};
        for (const fn of StatisticFns) {
          if (date?.from && date?.to) {
            graphContent[fn.index] = await fn.call(
              date.from,
              date.to,
              branchId.toString(),
            );
          }
        }

        let tableValue: any[] = [];
        if (date?.from && date?.to) {
          tableValue = await getOrderSummaryByDateRange(
            date.from,
            date.to,
            branchId.toString(),
          );
        }

        setHeaderData(headerContent);
        setGraphData(graphContent);
        setTableData(tableValue);

        toast({
          title: 'Data Updated',
          description: `Statistics loaded for ${format(date?.from || new Date(), 'MMM dd')} - ${format(
            date?.to || new Date(),
            'MMM dd, yyyy',
          )}`,
        });
      } catch (error) {
        console.error('Error updating statistics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load statistics data',
          variant: 'destructive',
        });
      } finally {
        setRefresh(false);
        setIsLoading(false);
      }
    };
    updatePage();
  }, [refresh, date, branchId, toast]);

  useEffect(() => {
    setRefresh(true);
  }, [date]);

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your data export will be ready shortly',
    });
    // Implement export functionality here
  };

  const getDateRangeLabel = () => {
    if (!date?.from || !date?.to) return 'Select date range';
    if (date.from.toDateString() === date.to.toDateString()) {
      return format(date.from, 'MMM dd, yyyy');
    }
    return `${format(date.from, 'MMM dd')} - ${format(date.to, 'MMM dd, yyyy')}`;
  };

  const headerActions = (
    <div className='flex items-center gap-2'>
      <DatePickerWithRange date={date} onDateChange={setDate} />
      <Button
        variant='outline'
        size='sm'
        onClick={() => setRefresh(true)}
        disabled={refresh}
      >
        <RefreshCw
          className={`w-4 h-4 mr-2 ${refresh ? 'animate-spin' : ''}`}
        />
        Refresh
      </Button>
      <Button size='sm' onClick={handleExport}>
        <Download className='w-4 h-4 mr-2' />
        Export
      </Button>
    </div>
  );

  return (
    <div className='flex flex-col h-full'>
      <BranchHeader
        title={`${branch?.name || 'Branch'} Statistics`}
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <div className='flex-1 overflow-auto p-6 bg-gray-50'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Date Range Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Analytics Overview
                    </h2>
                    <p className='text-sm text-gray-600'>
                      Viewing data for: {getDateRangeLabel()}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${branch?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <span className='text-sm text-gray-600 capitalize'>
                      {branch?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Statistics Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {StatisticHeaders.map((header, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    header.name === selectedHeader.name
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedHeader(header)}
                >
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center justify-between text-sm font-medium text-gray-600'>
                      <span>{header.name}</span>
                      <div className='p-2 bg-gray-100 rounded-lg'>
                        {header.icon}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading || i >= headerData.length ? (
                      <Skeleton className='h-8 w-20' />
                    ) : (
                      <div>
                        <p className='text-2xl font-bold text-gray-900'>
                          {headerData[i]?.toString() || '0'}
                        </p>
                        <p className='text-xs text-green-600 mt-1 flex items-center'>
                          <TrendingUp className='h-3 w-3 mr-1' />
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  {selectedHeader.name} Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='h-80 flex items-center justify-center'>
                    <div className='text-center'>
                      <RefreshCw className='h-8 w-8 animate-spin mx-auto text-gray-400 mb-2' />
                      <p className='text-gray-500'>Loading chart data...</p>
                    </div>
                  </div>
                ) : (
                  <div className='h-80'>
                    <ResponsiveLineChart
                      data={
                        Array.isArray(graphData[selectedHeader.graphIndex])
                          ? graphData[selectedHeader.graphIndex]
                          : []
                      }
                      value={selectedHeader.accessorKey}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ShoppingBag className='h-5 w-5' />
                  Detailed Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className='space-y-3'>
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className='h-12 w-full' />
                    ))}
                  </div>
                ) : (
                  <DataTable
                    columns={columnsRevenueIncome}
                    data={Array.isArray(tableData) ? tableData : []}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
          <BranchPerformanceChart branchId={branchId.toString() || ''} />
        </div>
      </div>
    </div>
  );
}
