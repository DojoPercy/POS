'use client';

import { useState, useEffect, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Building2, TrendingUp, Currency } from 'lucide-react';
import { DatePickerWithRange } from './ui/date-time-picker';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { getSalesSummaryOfBranches } from '@/lib/summaries';
import { Badge } from '@/components/ui/badge';

ChartJS.register(ArcElement, Tooltip, Legend);

export const generateColors = (count: number) => {
  const baseColors = [
    'rgb(59, 130, 246)', // Blue
    'rgb(16, 185, 129)', // Green
    'rgb(245, 158, 11)', // Orange
    'rgb(139, 92, 246)', // Purple
    'rgb(239, 68, 68)', // Red
    'rgb(6, 182, 212)', // Cyan
    'rgb(236, 72, 153)', // Pink
    'rgb(34, 197, 94)', // Emerald
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

const ChartSkeleton = () => (
  <div className='flex flex-col items-center justify-center w-full h-[300px] space-y-4'>
    <Skeleton className='h-[200px] w-[200px] rounded-full' />
    <div className='flex flex-col space-y-2 w-full max-w-[300px]'>
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
    </div>
  </div>
);

const BranchStats = ({
  companyId,
  currency,
}: {
  companyId: string;
  currency: string;
}) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [branchData, setBranchData] = useState<
    Array<{ branch: string; sales: number; revenue: number }>
  >([]);
  const [chartType, setChartType] = useState<'sales' | 'revenue'>('revenue');

  const fetchData = useCallback(async () => {
    if (!date?.from || !date?.to) return;

    setLoading(true);
    try {
      const fromDate: Date = date.from;
      const toDate: Date = date.to;
      const data = await getSalesSummaryOfBranches(fromDate, toDate, companyId);

      if (data) {
        const formattedData = data.map(item => ({
          branch: item.branch,
          sales: item.sales,
          revenue:
            typeof item.revenue === 'string'
              ? parseFloat(item.revenue)
              : item.revenue,
        }));
        setBranchData(formattedData);
      } else {
        setBranchData([]);
      }
    } catch (error) {
      console.error('Error fetching branch data:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId, date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const prepareChartData = () => {
    const labels = branchData.map(item => item.branch);
    const values = branchData.map(item =>
      chartType === 'sales' ? item.sales : item.revenue
    );
    const colors = generateColors(branchData.length);

    return {
      labels,
      datasets: [
        {
          label: chartType === 'sales' ? 'Sales' : 'Revenue',
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 8,
        },
      ],
    };
  };

  const totalValue = branchData.reduce(
    (sum, item) => sum + (chartType === 'sales' ? item.sales : item.revenue),
    0
  );

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Building2 className='h-5 w-5 text-slate-600' />
            <CardTitle className='text-lg font-semibold'>
              Branch Performance
            </CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant={chartType === 'sales' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setChartType('sales')}
              className='h-8'
            >
              Sales
            </Button>
            <Button
              variant={chartType === 'revenue' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setChartType('revenue')}
              className='h-8'
            >
              Revenue
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between'>
          <DatePickerWithRange date={date} setDate={setDate} />
          <Button
            variant='outline'
            size='sm'
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Update
          </Button>
        </div>

        {loading ? (
          <ChartSkeleton />
        ) : branchData.length > 0 ? (
          <div className='space-y-4'>
            <div className='h-[280px] flex items-center justify-center relative'>
              <Doughnut
                data={prepareChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                          size: 12,
                        },
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: context => {
                          const label = context.label || '';
                          const value = context.raw as number;
                          const percentage = Math.round(
                            (value / totalValue) * 100
                          );
                          const formattedValue =
                            chartType === 'revenue'
                              ? `${currency}${value.toLocaleString()}`
                              : value.toLocaleString();
                          return `${label}: ${formattedValue} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>

            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 pt-4 border-t'>
              <div className='text-center'>
                <p className='text-sm text-slate-600'>
                  Total {chartType === 'sales' ? 'Sales' : 'Revenue'}
                </p>
                <p className='text-xl font-bold text-slate-900'>
                  {chartType === 'revenue'
                    ? `${currency}${totalValue.toLocaleString()}`
                    : totalValue.toLocaleString()}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-slate-600'>Active Branches</p>
                <p className='text-xl font-bold text-slate-900'>
                  {branchData.length}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-[300px] text-center'>
            <Building2 className='h-12 w-12 text-slate-300 mb-4' />
            <p className='text-slate-500 font-medium'>
              No branch data available
            </p>
            <p className='text-sm text-slate-400'>
              Try selecting a different date range
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BranchStats;
