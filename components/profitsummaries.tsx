'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePickerWithRange } from './ui/date-time-picker';
import type { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { getProfitSummaryByDateRange, type Summary } from '@/lib/summaries';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChartSkeleton = () => (
  <div className='space-y-4'>
    <div className='flex w-full justify-center space-x-2'>
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className='h-[200px] w-[80px] bg-slate-200 animate-pulse rounded-md'
        ></div>
      ))}
    </div>
    <div className='grid grid-cols-3 gap-4'>
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} className='h-20 w-full' />
      ))}
    </div>
  </div>
);

const formatCurrency = (value: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const ProfitSummaries = ({
  companyId,
  currency = 'USD',
}: {
  companyId: string;
  currency?: string;
}) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [profitData, setProfitData] = useState<Summary>({
    totalRevenue: 0,
    totalExpense: 0,
    profit: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!date?.from || !date?.to) return;

    setLoading(true);
    try {
      const fromDate: Date = date.from;
      const toDate: Date = date.to;
      const data = await getProfitSummaryByDateRange(
        fromDate,
        toDate,
        undefined,
        companyId
      );

      if (data) {
        setProfitData(data);
      } else {
        setProfitData({
          totalRevenue: 0,
          totalExpense: 0,
          profit: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching profit data:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId, date?.from, date?.to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = {
    labels: ['Revenue', 'Expenses', 'Profit'],
    datasets: [
      {
        label: 'Financial Summary',
        data: [
          profitData?.totalRevenue,
          profitData?.totalExpense,
          profitData?.profit,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Green for revenue
          'rgba(239, 68, 68, 0.8)', // Red for expenses
          'rgba(59, 130, 246, 0.8)', // Blue for profit
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `${context.label}: ${formatCurrency(value, currency)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatCurrency(value, currency),
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const profitMargin =
    profitData?.totalRevenue > 0
      ? (((profitData?.profit || 0) / profitData.totalRevenue) * 100).toFixed(1)
      : '0';

  if (loading) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Profit Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BarChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5 text-slate-600' />
            Profit Summary
          </CardTitle>
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
      </CardHeader>

      <CardContent className='space-y-6'>
        <DatePickerWithRange date={date} setDate={setDate} />

        <div className='h-[280px]'>
          <Bar options={options} data={chartData} />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card className='bg-gradient-to-br from-green-50 to-green-100 border-green-200'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-green-700'>
                    Total Revenue
                  </p>
                  <p className='text-xl font-bold text-green-900'>
                    {formatCurrency(profitData?.totalRevenue || 0, currency)}
                  </p>
                </div>
                <TrendingUp className='h-8 w-8 text-green-600' />
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-red-50 to-red-100 border-red-200'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-red-700'>
                    Total Expenses
                  </p>
                  <p className='text-xl font-bold text-red-900'>
                    {formatCurrency(profitData?.totalExpense || 0, currency)}
                  </p>
                </div>
                <TrendingDown className='h-8 w-8 text-red-600' />
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-blue-700'>
                    Net Profit
                  </p>
                  <p className='text-xl font-bold text-blue-900'>
                    {formatCurrency(profitData?.profit || 0, currency)}
                  </p>
                  <p className='text-xs text-blue-600'>
                    {profitMargin}% margin
                  </p>
                </div>
                <DollarSign className='h-8 w-8 text-blue-600' />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitSummaries;
