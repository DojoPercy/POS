'use client';

import type React from 'react';

import { useState, useEffect, useCallback } from 'react';
import { BranchHeader } from '@/components/branch-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { getUserById } from '@/lib/auth';
import { getBranchById } from '@/lib/branch';
import { jwtDecode } from 'jwt-decode';
import { format, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Building2,
  MapPin,
  Mail,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Award,
  Edit,
  Settings,
  Crown,
  Target,
  Clock,
  Star,
  BarChart3,
  RefreshCw,
  Download,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useParams } from 'next/navigation';
import { DatePickerWithRange } from '@/components/date';

interface ManagerUser {
  id: string;
  fullname: string;
  status: string;
  email: string;
  role: string;
  branchId?: string;
  name: string;
  createdAt?: string;
}

interface Branch {
  id: string;
  name: string;
  location: string;
  city: string;
  state?: string;
  country: string;
  openingHours: string;
  status: 'active' | 'inactive';
  managerId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface BranchSummary {
  branchId: string;
  totalOrders: number;
  totalItems: number;
  totalAmount: number;
  averageOrderValue: number;
  averageItemsPerOrder: number;
  dateRange: {
    from: string;
    to: string;
  };
  byWaiter: Record<
    string,
    {
      waiterId: string;
      waiterName?: string | null;
      orders: number;
      items: number;
      amount: number;
      averageOrderValue: number;
    }
  >;
  dailyBreakdown: Array<{
    date: string;
    orders: number;
    items: number;
    amount: number;
  }>;
  topPerformers: {
    topWaiter: {
      waiterId: string;
      waiterName?: string | null;
      amount: number;
    } | null;
    busiestDay: { date: string; orders: number } | null;
    highestSalesDay: { date: string; amount: number } | null;
  };
  lastUpdated: string;
}

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  [key: string]: any;
}

export default function ManagerProfile() {
  const { branchId } = useParams();
  const [user, setUser] = useState<ManagerUser | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [branchSummary, setBranchSummary] = useState<BranchSummary | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const { toast } = useToast();
  const breadcrumbs = [
    { label: 'Dashboard', href: '/branch' },
    { label: 'Profile' },
  ];

  const fetchBranchSummary = useCallback(
    async (targetBranchId: string, fromDate: Date, toDate: Date) => {
      try {
        setSummaryLoading(true);
        const from = format(fromDate, 'yyyy-MM-dd');
        const to = format(toDate, 'yyyy-MM-dd');

        const response = await fetch(
          `/api/orders/branch?branchId=${targetBranchId}&from=${from}&to=${to}`,
        );

        if (response.ok) {
          const summary = await response.json();
          setBranchSummary(summary);
          toast({
            title: 'Data Updated',
            description: `Branch analytics loaded for ${from} to ${to}`,
          });
        } else {
          throw new Error('Failed to fetch branch summary');
        }
      } catch (error) {
        console.error('Failed to fetch branch summary:', error);
        toast({
          title: 'Error',
          description: 'Failed to load branch analytics',
          variant: 'destructive',
        });
      } finally {
        setSummaryLoading(false);
      }
    },
    [toast],
  );

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  const handleRefresh = () => {
    if ((branchId || user?.branchId) && dateRange?.from && dateRange?.to) {
      fetchBranchSummary(
        branchId?.toString() || user?.branchId || '',
        dateRange.from,
        dateRange.to,
      );
    }
  };

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your branch report will be ready shortly',
    });
    // Implement export functionality here
  };

  useEffect(() => {
    const fetchUserAndBranch = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found');
          return;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        const userDetails = await getUserById(decodedToken.userId ?? '');
        const branchDetails = await getBranchById(
          (branchId?.toString() || decodedToken.branchId) ?? '',
        );

        setUser(userDetails);
        setBranch(branchDetails);

        // Fetch branch summary for the selected date range
        if (dateRange?.from && dateRange?.to) {
          fetchBranchSummary(
            (branchId?.toString() || decodedToken.branchId) ?? '',
            dateRange.from,
            dateRange.to,
          );
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndBranch();
  }, [branchId, dateRange?.from, dateRange?.to, fetchBranchSummary, toast]);

  // Fetch branch summary when date range changes
  useEffect(() => {
    if ((branchId || user?.branchId) && dateRange?.from && dateRange?.to) {
      fetchBranchSummary(
        branchId?.toString() || user?.branchId || '',
        dateRange.from,
        dateRange.to,
      );
    }
  }, [dateRange, user, branchId, fetchBranchSummary]);

  if (isLoading) {
    return (
      <div className='flex flex-col h-full'>
        <BranchHeader title='Manager Profile' breadcrumbs={breadcrumbs} />
        <div className='flex-1 overflow-auto p-6 bg-gray-50'>
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (!user || !branch) {
    return (
      <div className='flex flex-col h-full'>
        <BranchHeader title='Manager Profile' breadcrumbs={breadcrumbs} />
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <Building2 className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Failed to load profile
            </h3>
            <p className='text-gray-500'>Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDateRangeLabel = () => {
    if (!dateRange?.from || !dateRange?.to) return 'Select date range';
    if (dateRange.from.toDateString() === dateRange.to.toDateString()) {
      return format(dateRange.from, 'MMM dd, yyyy');
    }
    return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
  };

  const waiterPerformanceData = branchSummary
    ? Object.values(branchSummary.byWaiter)
    : [];
  const topWaiters = waiterPerformanceData
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const branchStats = [
    {
      title: 'Total Revenue',
      value: summaryLoading
        ? '...'
        : `$${branchSummary?.totalAmount.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+15%',
    },
    {
      title: 'Total Orders',
      value: summaryLoading
        ? '...'
        : branchSummary?.totalOrders.toString() || '0',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
    },
    {
      title: 'Items Served',
      value: summaryLoading
        ? '...'
        : branchSummary?.totalItems.toString() || '0',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+8%',
    },
    {
      title: 'Avg Order Value',
      value: summaryLoading
        ? '...'
        : `$${branchSummary?.averageOrderValue.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+5%',
    },
  ];

  return (
    <div className='flex flex-col h-full'>
      <BranchHeader
        title='Manager Profile'
        breadcrumbs={breadcrumbs}
        actions={
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={summaryLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${summaryLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button size='sm' onClick={handleExport}>
              <Download className='w-4 h-4 mr-2' />
              Export
            </Button>
          </div>
        }
      />

      <div className='flex-1 overflow-auto p-6 bg-gray-50'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className='overflow-hidden'>
              <div className='bg-gradient-to-r from-green-600 to-emerald-600 h-32'></div>
              <CardContent className='relative pt-0 pb-6'>
                <div className='flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16'>
                  <Avatar className='w-24 h-24 border-4 border-white shadow-lg'>
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.fullname}`}
                      alt={user.fullname}
                    />
                    <AvatarFallback className='text-2xl font-semibold bg-gray-100'>
                      {user.fullname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1 sm:ml-4'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                      <div>
                        <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                          {user.name || user.fullname}
                          <Crown className='h-5 w-5 text-yellow-500' />
                        </h1>
                        <p className='text-gray-600 flex items-center gap-1 mt-1'>
                          <Mail className='h-4 w-4' />
                          {user.email}
                        </p>
                        <div className='flex items-center gap-2 mt-2'>
                          <Badge
                            variant='secondary'
                            className='bg-green-100 text-green-800'
                          >
                            Branch Manager
                          </Badge>
                          <Badge
                            variant={
                              user.status === 'active'
                                ? 'default'
                                : 'destructive'
                            }
                            className={
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : ''
                            }
                          >
                            {user.status.charAt(0).toUpperCase() +
                              user.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <Button variant='outline' size='sm'>
                          <Edit className='h-4 w-4 mr-2' />
                          Edit Profile
                        </Button>
                        <Button variant='outline' size='sm'>
                          <Settings className='h-4 w-4 mr-2' />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analytics Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  Branch Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-700'>
                      Date Range:
                    </label>
                    <DatePickerWithRange
                      date={dateRange}
                      onDateChange={handleDateRangeChange}
                      placeholder='Select date range'
                    />
                  </div>

                  <div className='p-3 bg-gray-50 rounded-lg'>
                    <p className='text-sm text-gray-600'>
                      <span className='font-medium'>Viewing data for:</span>{' '}
                      {getDateRangeLabel()}
                    </p>
                    {branchSummary?.lastUpdated && (
                      <p className='text-xs text-gray-500 mt-1'>
                        Last updated:{' '}
                        {format(
                          new Date(branchSummary.lastUpdated),
                          'MMM dd, yyyy \'at\' HH:mm',
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {branchStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                <Card className='hover:shadow-md transition-shadow'>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-600'>
                          {stat.title}
                        </p>
                        <p className='text-2xl font-bold text-gray-900 mt-1'>
                          {stat.value}
                        </p>
                        <p className='text-xs text-green-600 mt-1 flex items-center'>
                          <TrendingUp className='h-3 w-3 mr-1' />
                          {stat.change} from last period
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabs for detailed information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Tabs defaultValue='overview' className='space-y-4'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='staff'>Staff Performance</TabsTrigger>
                <TabsTrigger value='insights'>Insights</TabsTrigger>
                <TabsTrigger value='branch'>Branch Info</TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='space-y-4'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Top Performers */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Award className='h-5 w-5' />
                        Top Performers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {branchSummary?.topPerformers.topWaiter && (
                        <div className='flex items-center gap-3 p-3 bg-yellow-50 rounded-lg'>
                          <Crown className='h-5 w-5 text-yellow-600' />
                          <div>
                            <p className='font-medium text-gray-900'>
                              Top Waiter
                            </p>
                            <p className='text-sm text-gray-600'>
                              {branchSummary.topPerformers.topWaiter
                                .waiterName || 'Unknown'}{' '}
                              - $
                              {branchSummary.topPerformers.topWaiter.amount.toFixed(
                                2,
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {branchSummary?.topPerformers.busiestDay && (
                        <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg'>
                          <Clock className='h-5 w-5 text-blue-600' />
                          <div>
                            <p className='font-medium text-gray-900'>
                              Busiest Day
                            </p>
                            <p className='text-sm text-gray-600'>
                              {format(
                                new Date(
                                  branchSummary.topPerformers.busiestDay.date,
                                ),
                                'MMM dd, yyyy',
                              )}{' '}
                              - {branchSummary.topPerformers.busiestDay.orders}{' '}
                              orders
                            </p>
                          </div>
                        </div>
                      )}

                      {branchSummary?.topPerformers.highestSalesDay && (
                        <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
                          <DollarSign className='h-5 w-5 text-green-600' />
                          <div>
                            <p className='font-medium text-gray-900'>
                              Highest Sales Day
                            </p>
                            <p className='text-sm text-gray-600'>
                              {format(
                                new Date(
                                  branchSummary.topPerformers.highestSalesDay.date,
                                ),
                                'MMM dd, yyyy',
                              )}{' '}
                              - $
                              {branchSummary.topPerformers.highestSalesDay.amount.toFixed(
                                2,
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Management Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 gap-3'>
                        <Link href='/branch/statistics'>
                          <Button className='w-full justify-start h-12 bg-blue-600 hover:bg-blue-700'>
                            <BarChart3 className='h-5 w-5 mr-3' />
                            View Detailed Analytics
                          </Button>
                        </Link>
                        <Link href='/branch/staffs'>
                          <Button
                            variant='outline'
                            className='w-full justify-start h-12'
                          >
                            <Users className='h-5 w-5 mr-3' />
                            Manage Staff
                          </Button>
                        </Link>
                        <Link href='/branch/orders'>
                          <Button
                            variant='outline'
                            className='w-full justify-start h-12'
                          >
                            <Eye className='h-5 w-5 mr-3' />
                            Monitor Orders
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value='staff' className='space-y-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Users className='h-5 w-5' />
                      Staff Performance Ranking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {summaryLoading ? (
                      <div className='space-y-3'>
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className='h-16 w-full' />
                        ))}
                      </div>
                    ) : topWaiters.length > 0 ? (
                      <div className='space-y-4'>
                        {topWaiters.map((waiter, index) => (
                          <div
                            key={waiter.waiterId}
                            className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'
                          >
                            <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-semibold'>
                              {index + 1}
                            </div>
                            <Avatar className='w-10 h-10'>
                              <AvatarImage
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${waiter.waiterName}`}
                                alt={waiter.waiterName || 'Unknown'}
                              />
                              <AvatarFallback>
                                {waiter.waiterName?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <p className='font-medium text-gray-900'>
                                {waiter.waiterName || 'Unknown Waiter'}
                              </p>
                              <p className='text-sm text-gray-600'>
                                {waiter.orders} orders • {waiter.items} items •
                                ${waiter.averageOrderValue.toFixed(2)} avg
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='font-semibold text-gray-900'>
                                ${waiter.amount.toFixed(2)}
                              </p>
                              <Progress
                                value={
                                  (waiter.amount /
                                    (topWaiters[0]?.amount || 1)) *
                                  100
                                }
                                className='w-20 mt-1'
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-8'>
                        <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-500'>
                          No staff performance data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='insights' className='space-y-4'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Star className='h-5 w-5' />
                        Performance Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='p-4 bg-blue-50 rounded-lg'>
                        <h4 className='font-medium text-blue-900 mb-2'>
                          Revenue Trend
                        </h4>
                        <p className='text-sm text-blue-700'>
                          Your branch is performing 15% above average for this
                          period. Keep up the excellent work!
                        </p>
                      </div>
                      <div className='p-4 bg-green-50 rounded-lg'>
                        <h4 className='font-medium text-green-900 mb-2'>
                          Staff Efficiency
                        </h4>
                        <p className='text-sm text-green-700'>
                          Average order processing time has improved by 8%
                          compared to last month.
                        </p>
                      </div>
                      <div className='p-4 bg-yellow-50 rounded-lg'>
                        <h4 className='font-medium text-yellow-900 mb-2'>
                          Opportunity
                        </h4>
                        <p className='text-sm text-yellow-700'>
                          Consider cross-training staff during peak hours to
                          optimize service delivery.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Target className='h-5 w-5' />
                        Key Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>
                          Customer Satisfaction
                        </span>
                        <div className='flex items-center gap-2'>
                          <Progress value={92} className='w-20' />
                          <span className='text-sm font-medium'>92%</span>
                        </div>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>
                          Order Accuracy
                        </span>
                        <div className='flex items-center gap-2'>
                          <Progress value={96} className='w-20' />
                          <span className='text-sm font-medium'>96%</span>
                        </div>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>
                          Staff Productivity
                        </span>
                        <div className='flex items-center gap-2'>
                          <Progress value={88} className='w-20' />
                          <span className='text-sm font-medium'>88%</span>
                        </div>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>
                          Revenue Growth
                        </span>
                        <div className='flex items-center gap-2'>
                          <Progress value={85} className='w-20' />
                          <span className='text-sm font-medium'>+15%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value='branch' className='space-y-4'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Branch Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Building2 className='h-5 w-5' />
                        Branch Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <ProfileItem
                        icon={<Building2 className='w-4 h-4' />}
                        label='Branch Name'
                        value={branch.name}
                      />
                      <ProfileItem
                        icon={<MapPin className='w-4 h-4' />}
                        label='Location'
                        value={`${branch.city}, ${branch.state || ''} ${branch.country}`.trim()}
                      />
                      <ProfileItem
                        icon={<Clock className='w-4 h-4' />}
                        label='Opening Hours'
                        value={branch.openingHours}
                      />
                      <div className='flex items-center space-x-2'>
                        <div className='w-4 h-4 flex items-center justify-center'>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              branch.status === 'active'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          />
                        </div>
                        <div>
                          <p className='text-sm font-medium'>Branch Status</p>
                          <Badge
                            variant={
                              branch.status === 'active'
                                ? 'default'
                                : 'destructive'
                            }
                            className='mt-1'
                          >
                            {branch.status.charAt(0).toUpperCase() +
                              branch.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Users className='h-5 w-5' />
                        Manager Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <ProfileItem
                        icon={<Building2 className='w-4 h-4' />}
                        label='Manager ID'
                        value={user.id}
                      />
                      <ProfileItem
                        icon={<Mail className='w-4 h-4' />}
                        label='Email'
                        value={user.email}
                      />
                      <ProfileItem
                        icon={<Calendar className='w-4 h-4' />}
                        label='Joined'
                        value={formatJoinDate(user.createdAt)}
                      />
                      <ProfileItem
                        icon={<Award className='w-4 h-4' />}
                        label='Role'
                        value='Branch Manager'
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className='flex items-center space-x-3'>
      <div className='text-gray-400'>{icon}</div>
      <div className='flex-1'>
        <p className='text-sm font-medium text-gray-900'>{label}</p>
        <p className='text-sm text-gray-600'>{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Profile Header Skeleton */}
      <Card className='overflow-hidden'>
        <div className='bg-gradient-to-r from-gray-200 to-gray-300 h-32'></div>
        <CardContent className='relative pt-0 pb-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16'>
            <Skeleton className='w-24 h-24 rounded-full border-4 border-white' />
            <div className='flex-1 sm:ml-4 space-y-2'>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='h-4 w-64' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-16' />
                <Skeleton className='h-6 w-16' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Controls Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-48' />
        </CardHeader>
        <CardContent>
          <div className='flex flex-col lg:flex-row gap-4'>
            <Skeleton className='h-10 w-80' />
            <Skeleton className='h-16 w-64' />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-8 w-16' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <Skeleton className='h-12 w-12 rounded-lg' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className='space-y-4'>
        <Skeleton className='h-10 w-full' />
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-40' />
              </CardHeader>
              <CardContent className='space-y-4'>
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className='h-16 w-full' />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
