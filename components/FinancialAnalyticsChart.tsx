'use client';
import React, { useState, useEffect } from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  FileText,
} from 'lucide-react';
import {
  FinancialAnalyticsService,
  FinancialAnalyticsResponse,
} from '@/lib/financial-analytics';

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

interface FinancialAnalyticsChartProps {
  companyId: string;
  currency?: string;
  className?: string;
}

export default function FinancialAnalyticsChart({
  companyId,
  currency = '$',
  className = '',
}: FinancialAnalyticsChartProps) {
  const [data, setData] = useState<FinancialAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchData();
  }, [companyId, timeRange, groupBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const to = new Date();
      const from = new Date();

      switch (timeRange) {
        case '7d':
          from.setDate(from.getDate() - 7);
          break;
        case '30d':
          from.setDate(from.getDate() - 30);
          break;
        case '90d':
          from.setDate(from.getDate() - 90);
          break;
        case '1y':
          from.setFullYear(from.getFullYear() - 1);
          break;
      }

      const response = await FinancialAnalyticsService.getFinancialAnalytics(
        companyId,
        {
          from,
          to,
          groupBy,
        }
      );

      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `${currency}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className='h-4 w-4 text-green-600' />
    ) : (
      <TrendingDown className='h-4 w-4 text-red-600' />
    );
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    colors: ['#3B82F6', '#10B981', '#F59E0B'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3, 3],
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
      hover: {
        size: 6,
      },
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'light',
      y: {
        formatter: function (value) {
          return formatCurrency(value);
        },
      },
    },
    xaxis: {
      type: 'category',
      categories:
        data?.data.map(item => {
          const date = new Date(item.date);
          switch (groupBy) {
            case 'month':
              return date.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              });
            case 'week':
              return `Week ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            default:
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
          }
        }) || [],
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: [
      {
        title: {
          text: 'Amount',
          style: {
            color: '#6B7280',
            fontSize: '12px',
          },
        },
        labels: {
          formatter: function (value) {
            return formatCurrency(value);
          },
          style: {
            colors: '#6B7280',
            fontSize: '12px',
          },
        },
      },
    ],
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '14px',
      markers: {
        size: 6,
      },
      itemMargin: {
        horizontal: 10,
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
          },
        },
      },
    ],
  };

  const chartSeries = [
    {
      name: 'Revenue',
      data: data?.data.map(item => item.revenue) || [],
    },
    {
      name: 'Profit',
      data: data?.data.map(item => item.profit) || [],
    },
    {
      name: 'Expenses',
      data: data?.data.map(item => item.expenses) || [],
    },
  ];

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg font-semibold'>
              Financial Analytics
            </CardTitle>
            <div className='flex gap-2'>
              <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
              <div className='h-8 w-24 bg-gray-200 rounded animate-pulse' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='h-[350px] bg-gray-100 rounded animate-pulse' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className='flex items-center justify-center h-[350px]'>
          <div className='text-center'>
            <p className='text-red-600 mb-2'>Error loading financial data</p>
            <Button onClick={fetchData} variant='outline' size='sm'>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
              <DollarSign className='h-5 w-5' />
              Financial Analytics
            </CardTitle>
            <p className='text-sm text-gray-500 mt-1'>
              Revenue, Profit & Expenses Overview
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-2'>
            <Select
              value={timeRange}
              onValueChange={(value: any) => setTimeRange(value)}
            >
              <SelectTrigger className='w-[120px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7d'>Last 7 days</SelectItem>
                <SelectItem value='30d'>Last 30 days</SelectItem>
                <SelectItem value='90d'>Last 90 days</SelectItem>
                <SelectItem value='1y'>Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={groupBy}
              onValueChange={(value: any) => setGroupBy(value)}
            >
              <SelectTrigger className='w-[100px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='day'>Daily</SelectItem>
                <SelectItem value='week'>Weekly</SelectItem>
                <SelectItem value='month'>Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Cards */}
        {data?.summary && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div className='bg-blue-50 p-4 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-blue-600'>
                    Total Revenue
                  </p>
                  <p className='text-2xl font-bold text-blue-900'>
                    {formatCurrency(data.summary.totalRevenue)}
                  </p>
                </div>
                <DollarSign className='h-8 w-8 text-blue-600' />
              </div>
              <div className='flex items-center gap-1 mt-2'>
                {getTrendIcon(data.summary.revenueTrend)}
                <span
                  className={`text-sm font-medium ${getTrendColor(data.summary.revenueTrend)}`}
                >
                  {formatPercentage(data.summary.revenueTrend)}
                </span>
              </div>
            </div>

            <div className='bg-green-50 p-4 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-green-600'>
                    Total Profit
                  </p>
                  <p className='text-2xl font-bold text-green-900'>
                    {formatCurrency(data.summary.totalProfit)}
                  </p>
                </div>
                <TrendingUp className='h-8 w-8 text-green-600' />
              </div>
              <div className='flex items-center gap-1 mt-2'>
                {getTrendIcon(data.summary.profitTrend)}
                <span
                  className={`text-sm font-medium ${getTrendColor(data.summary.profitTrend)}`}
                >
                  {formatPercentage(data.summary.profitTrend)}
                </span>
              </div>
            </div>

            <div className='bg-orange-50 p-4 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-orange-600'>
                    Total Expenses
                  </p>
                  <p className='text-2xl font-bold text-orange-900'>
                    {formatCurrency(data.summary.totalExpenses)}
                  </p>
                </div>
                <FileText className='h-8 w-8 text-orange-600' />
              </div>
              <div className='mt-2'>
                <Badge
                  variant='outline'
                  className='text-orange-600 border-orange-300'
                >
                  {data.summary.expenseRatio.toFixed(1)}% of revenue
                </Badge>
              </div>
            </div>

            <div className='bg-purple-50 p-4 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-purple-600'>
                    Profit Margin
                  </p>
                  <p className='text-2xl font-bold text-purple-900'>
                    {data.summary.profitMargin.toFixed(1)}%
                  </p>
                </div>
                <ShoppingCart className='h-8 w-8 text-purple-600' />
              </div>
              <div className='mt-2'>
                <p className='text-sm text-purple-600'>
                  {data.summary.totalOrders} orders
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className='h-[350px]'>
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type='area'
            height={350}
          />
        </div>
      </CardContent>
    </Card>
  );
}
