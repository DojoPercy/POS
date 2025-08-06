'use client';

import { useState, useEffect } from 'react';
import { addDays } from 'date-fns';
import {
  RefreshCw,
  Download,
  Building2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  FileText,
  ChefHat,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Menu,
  X,
  Calendar,
  Filter,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  StatisticHeaders,
  StatisticFns,
  StatisticFnsP,
  StatisticFnsE,
} from '@/components/stats-header';
import {
  columnsExpenses,
  columnsPayment,
  columnsRevenueIncome,
} from '@/components/columns-stats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-time-picker';
import { DataTable } from '@/components/ui/data-table';
import { ResponsiveLineChart } from '@/components/responsive-line-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  getOrderSummaryByDateRangeOwner,
  getSalesSummaryOfBranches,
  getTodaySalesSummaryOfBranches,
} from '@/lib/order';
import { paymentService } from '@/lib/payment';
import { getExpensesSummaryByDateRangeOwner } from '@/lib/expense';
import { getBranches } from '@/lib/branch';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import type { RootState } from '@/redux';
import type { DateRange } from 'react-day-picker';
import Image from 'next/image';
import BranchStats from '@/components/branchpie';
import ProfitSummaries from '@/components/profitsummaries';
import TopMenusChart from '@/components/top_menus';
import { useIsMobile } from '@/hooks/use-mobile';
import { AutomaticNotificationService } from '@/lib/automatic-notifications';

// Types
type graphDataDef = {
  [key: number]: {
    date: string;
    sales: number;
    [key: string]: string | number;
  }[];
};

interface Branch {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  todayRevenue?: number;
  todayOrders?: number;
}

interface TodayStats {
  revenue: { current: number; previous: number; change: number };
  orders: { current: number; previous: number; change: number };
  avgOrderValue: { current: number; previous: number; change: number };
  profit: { current: number; previous: number; change: number };
  expenses: { current: number; previous: number; change: number };
}

interface BranchSummary {
  branch: string;
  sales: number;
  revenue: string;
}

// Sparkline component
const Sparkline = ({
  data,
  color = 'rgb(59, 130, 246)',
}: {
  data: number[];
  color?: string;
}) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 20;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width='60' height='20' className='ml-2'>
      <polyline fill='none' stroke={color} strokeWidth='1.5' points={points} />
    </svg>
  );
};

// Trend indicator component
const TrendIndicator = ({
  change,
  size = 'sm',
}: {
  change: number;
  size?: 'sm' | 'lg';
}) => {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  const iconSize = size === 'lg' ? 'h-4 w-4' : 'h-3 w-3';
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <div
      className={`flex items-center gap-1 ${textSize} ${
        isPositive
          ? 'text-green-600'
          : isNeutral
            ? 'text-gray-500'
            : 'text-red-600'
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className={iconSize} />
      ) : isNeutral ? (
        <Minus className={iconSize} />
      ) : (
        <ArrowDownRight className={iconSize} />
      )}
      <span>
        {isPositive ? '+' : ''}
        {change.toFixed(1)}%
      </span>
    </div>
  );
};

// Mobile Metric Card Component
const MobileMetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  sparklineData,
  loading,
}: {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
  sparklineData: number[];
  loading: boolean;
}) => (
  <Card className={`${color} border-0 shadow-sm`}>
    <CardContent className='p-4'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className='p-2 bg-white/20 rounded-lg'>
            <Icon className='h-4 w-4 text-white' />
          </div>
          <span className='text-sm font-medium text-white/90'>{title}</span>
        </div>
        <TrendIndicator change={change} size='sm' />
      </div>

      {loading ? (
        <Skeleton className='h-8 w-20 bg-white/20' />
      ) : (
        <div className='flex items-center justify-between'>
          <span className='text-2xl font-bold text-white'>{value}</span>
          <Sparkline data={sparklineData} color='rgba(255,255,255,0.8)' />
        </div>
      )}
    </CardContent>
  </Card>
);

// Desktop Metric Card Component
const DesktopMetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  sparklineData,
  loading,
  currency,
}: {
  title: string;
  value: number;
  change: number;
  icon: any;
  color: string;
  sparklineData: number[];
  loading: boolean;
  currency: string;
}) => (
  <Card className={`${color} border-0 shadow-sm`}>
    <CardContent className='p-4'>
      <div className='flex items-center justify-between mb-2'>
        <p className='text-sm font-medium text-white'>{title}</p>
        <Icon className='h-5 w-5 text-white' />
      </div>
      <div className='space-y-1'>
        {loading ? (
          <Skeleton className='h-8 w-24 bg-white/20' />
        ) : (
          <p className='text-2xl font-bold text-white'>
            {currency}
            {value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        )}
        <div className='flex items-center justify-between'>
          <TrendIndicator change={change} />
          <Sparkline data={sparklineData} color='rgba(255,255,255,0.8)' />
        </div>
        <p className='text-xs text-white/70'>vs yesterday</p>
      </div>
    </CardContent>
  </Card>
);

export default function ImprovedDashboard() {
  const isMobile = useIsMobile();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [refresh, setRefresh] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [selectedHeader, setSelectedHeader] = useState(StatisticHeaders[0]);
  const [headerData, setHeaderData] = useState<number[]>([]);
  const [graphData, setGraphData] = useState<graphDataDef>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [paymentTableData, setPaymentTableData] = useState<any[]>([]);
  const [expensesTableData, setExpensesTableData] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchSummaries, setBranchSummaries] = useState<BranchSummary[]>([]);
  const [showInactiveBranches, setShowInactiveBranches] = useState(false);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    revenue: { current: 0, previous: 0, change: 0 },
    orders: { current: 0, previous: 0, change: 0 },
    avgOrderValue: { current: 0, previous: 0, change: 0 },
    profit: { current: 0, previous: 0, change: 0 },
    expenses: { current: 0, previous: 0, change: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [sparklineData, setSparklineData] = useState<{
    revenue: number[];
    orders: number[];
    profit: number[];
    expenses: number[];
    avgOrderValue: number[];
  }>({
    revenue: [],
    orders: [],
    profit: [],
    expenses: [],
    avgOrderValue: [],
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { company } = useSelector((state: RootState) => state.company);

  // Initialize user and company
  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId));
    }
  }, [dispatch, user?.companyId]);

  useEffect(() => {
    if (company) {
      setSelectedCompany(company);
    }
  }, [company]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getBranches(user?.companyId || '');
        setBranches(response);
      } catch (err: any) {
        console.error(
          'Failed to fetch branches:',
          err.response?.data?.error || err.message,
        );
      }
    };

    if (user?.companyId) {
      fetchBranches();
    }
  }, [user?.companyId]);

  // Fetch today's stats with enhanced calculations
  useEffect(() => {
    const fetchTodayStats = async () => {
      if (!selectedCompany?.id) return;

      try {
        setLoading(true);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Fetch today's data
        const todayBranchSummaries = await getTodaySalesSummaryOfBranches(
          selectedCompany.id,
        );
        setBranchSummaries(todayBranchSummaries!);

        const todayRevenue = todayBranchSummaries!.reduce(
          (sum, branch) => sum + Number.parseFloat(branch.revenue),
          0,
        );
        const todayOrders = todayBranchSummaries!.reduce(
          (sum, branch) => sum + branch.sales,
          0,
        );

        // Fetch yesterday's data
        const yesterdayBranchSummaries = await getSalesSummaryOfBranches(
          yesterday,
          yesterday,
          selectedCompany.id,
        );
        const yesterdayRevenue =
          yesterdayBranchSummaries?.reduce(
            (sum, branch) => sum + Number.parseFloat(branch.revenue),
            0,
          ) || 0;
        const yesterdayOrders =
          yesterdayBranchSummaries?.reduce(
            (sum, branch) => sum + branch.sales,
            0,
          ) || 0;

        // Calculate changes
        const revenueChange =
          yesterdayRevenue > 0
            ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
            : 0;
        const ordersChange =
          yesterdayOrders > 0
            ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
            : 0;

        const todayAvgOrderValue =
          todayOrders > 0 ? todayRevenue / todayOrders : 0;
        const yesterdayAvgOrderValue =
          yesterdayOrders > 0 ? yesterdayRevenue / yesterdayOrders : 0;
        const avgOrderValueChange =
          yesterdayAvgOrderValue > 0
            ? ((todayAvgOrderValue - yesterdayAvgOrderValue) /
                yesterdayAvgOrderValue) *
              100
            : 0;

        // Fetch expenses data (you'll need to implement this)
        const todayExpenses = 0; // Implement: await getExpensesSumByDateRange(today, today, undefined, selectedCompany.id)
        const yesterdayExpenses = 0; // Implement: await getExpensesSumByDateRange(yesterday, yesterday, undefined, selectedCompany.id)
        const expensesChange =
          yesterdayExpenses > 0
            ? ((todayExpenses - yesterdayExpenses) / yesterdayExpenses) * 100
            : 0;

        const todayProfit = todayRevenue - todayExpenses;
        const yesterdayProfit = yesterdayRevenue - yesterdayExpenses;
        const profitChange =
          yesterdayProfit > 0
            ? ((todayProfit - yesterdayProfit) / yesterdayProfit) * 100
            : 0;

        setTodayStats({
          revenue: {
            current: todayRevenue,
            previous: yesterdayRevenue,
            change: revenueChange,
          },
          orders: {
            current: todayOrders,
            previous: yesterdayOrders,
            change: ordersChange,
          },
          avgOrderValue: {
            current: todayAvgOrderValue,
            previous: yesterdayAvgOrderValue,
            change: avgOrderValueChange,
          },
          profit: {
            current: todayProfit,
            previous: yesterdayProfit,
            change: profitChange,
          },
          expenses: {
            current: todayExpenses,
            previous: yesterdayExpenses,
            change: expensesChange,
          },
        });

        // Generate sparkline data for the last 7 days
        const sparklinePromises = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          sparklinePromises.push(
            getSalesSummaryOfBranches(date, date, selectedCompany.id),
          );
        }

        const sparklineResults = await Promise.all(sparklinePromises);
        const revenueSparkline = sparklineResults.map(
          result =>
            result?.reduce(
              (sum, branch) => sum + Number.parseFloat(branch.revenue),
              0,
            ) || 0,
        );
        const ordersSparkline = sparklineResults.map(
          result => result?.reduce((sum, branch) => sum + branch.sales, 0) || 0,
        );

        setSparklineData({
          revenue: revenueSparkline,
          orders: ordersSparkline,
          profit: revenueSparkline.map(rev => rev * 0.35), // Assuming 35% profit margin
          expenses: revenueSparkline.map(rev => rev * 0.2), // Assuming 20% expenses
          avgOrderValue: revenueSparkline.map((rev, idx) =>
            ordersSparkline[idx] > 0 ? rev / ordersSparkline[idx] : 0,
          ),
        });

        // Update branches with today's data
        setBranches(prevBranches =>
          prevBranches.map(branch => {
            const summary = todayBranchSummaries?.find(
              s => s.branch === branch.name,
            );
            return {
              ...branch,
              todayRevenue: summary ? Number.parseFloat(summary.revenue) : 0,
              todayOrders: summary ? summary.sales : 0,
            };
          }),
        );
      } catch (error) {
        console.error('Error fetching today\'s stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayStats();
  }, [selectedCompany?.id]);

  // Trigger automatic notifications when dashboard loads
  useEffect(() => {
    const triggerAutomaticNotifications = async () => {
      if (user?.companyId) {
        try {
          // Run automatic checks in the background
          await AutomaticNotificationService.runAllChecks(user.companyId);
        } catch (error) {
          console.error('Failed to trigger automatic notifications:', error);
        }
      }
    };

    triggerAutomaticNotifications();
  }, [user?.companyId]);

  // Fetch detailed analytics data
  useEffect(() => {
    if (!refresh) return;
    setHeaderData([]);
    setGraphData({});
    setTableData([]);
    setPaymentTableData([]);
    setExpensesTableData([]);

    const updatePage = async () => {
      if (!date?.from || !date?.to || !selectedCompany) {
        setRefresh(false);
        return;
      }

      const fromDate: Date = date.from;
      const toDate: Date = date.to;

      try {
        const headerPromises = StatisticHeaders.map(header =>
          header.call(fromDate, toDate, undefined, selectedCompany.id),
        );
        const headerContent: number[] = await Promise.all(headerPromises);

        const orderGraphCalls = StatisticFns.map(fn =>
          fn
            .call(fromDate, toDate, undefined, selectedCompany.id)
            .then(data => ({
              index: fn.index,
              data,
            })),
        );

        const paymentGraphCalls = StatisticFnsP.map(fn =>
          fn
            .call(fromDate, toDate, selectedCompany.id, undefined)
            .then(data => ({
              index: fn.index,
              data,
            })),
        );

        const expensesGraphCalls = StatisticFnsE.map(fn =>
          fn
            .call(fromDate, toDate, selectedCompany.id, undefined)
            .then(data => ({
              index: fn.index,
              data,
            })),
        );

        const graphResults = await Promise.all([
          ...orderGraphCalls,
          ...paymentGraphCalls,
          ...expensesGraphCalls,
        ]);

        const graphContent: graphDataDef = {};
        for (const result of graphResults) {
          graphContent[result.index] = result.data;
        }

        const [tableValue, paymentTableValue, expensesTableValue] =
          await Promise.all([
            getOrderSummaryByDateRangeOwner(
              fromDate,
              toDate,
              selectedCompany.id,
            ),
            paymentService.getPaymentSummaryByDateRangeOwner(
              fromDate,
              toDate,
              selectedCompany.id,
            ),
            getExpensesSummaryByDateRangeOwner(
              fromDate,
              toDate,
              selectedCompany.id,
            ),
          ]);

        setHeaderData(headerContent);
        setGraphData(graphContent);
        setTableData(tableValue);
        setPaymentTableData(paymentTableValue);
        setExpensesTableData(expensesTableValue);
      } catch (error) {
        console.error('Error updating page:', error);
      } finally {
        setRefresh(false);
      }
    };

    updatePage();
  }, [refresh, date, selectedCompany]);

  useEffect(() => {
    setRefresh(true);
  }, [date, selectedCompany]);

  const handleRefresh = () => {
    setRefresh(true);
  };

  const activeBranches = branches.filter(branch => branch.status === 'active');
  const displayedBranches = showInactiveBranches ? branches : activeBranches;

  // Generate key insights based on real data
  const generateKeyInsights = () => {
    const insights = [];

    if (todayStats.revenue.change > 10) {
      insights.push({
        icon: <TrendingUp className='h-5 w-5 text-green-600 mt-0.5' />,
        title: 'Strong Revenue Growth',
        description: `${todayStats.revenue.change.toFixed(1)}% increase from yesterday`,
        bgColor: 'bg-green-50',
      });
    }

    if (todayStats.orders.change < -5) {
      insights.push({
        icon: <ShoppingCart className='h-5 w-5 text-orange-600 mt-0.5' />,
        title: 'Order Volume Down',
        description: `${Math.abs(todayStats.orders.change).toFixed(1)}% decrease in orders`,
        bgColor: 'bg-orange-50',
      });
    }

    // Find top performing branch
    const topBranch = branches.reduce(
      (max, branch) =>
        (branch.todayRevenue || 0) > (max.todayRevenue || 0) ? branch : max,
      branches[0],
    );

    if (topBranch) {
      insights.push({
        icon: <Building2 className='h-5 w-5 text-blue-600 mt-0.5' />,
        title: 'Top Performer',
        description: `${topBranch.name} - ${selectedCompany?.currency}${(topBranch.todayRevenue || 0).toLocaleString()}`,
        bgColor: 'bg-blue-50',
      });
    }

    return insights.slice(0, 3); // Show max 3 insights
  };

  const keyInsights = generateKeyInsights();

  // Mobile Header Component
  const MobileHeader = () => (
    <div className='bg-white border-b border-slate-200 px-4 py-3 lg:hidden'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className='p-2'
          >
            {showMobileMenu ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </Button>
          <div className='flex items-center gap-2'>
            {selectedCompany?.logo && (
              <Image
                src={selectedCompany.logo || '/placeholder.svg'}
                alt={selectedCompany.name}
                width={32}
                height={32}
                className='rounded-lg'
              />
            )}
            <div>
              <h1 className='text-lg font-bold text-slate-900 truncate max-w-[150px]'>
                {selectedCompany?.name || 'Loading...'}
              </h1>
              <p className='text-xs text-slate-600'>Dashboard</p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={refresh}
          >
            <RefreshCw className={`h-4 w-4 ${refresh ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className='mt-4 space-y-3'>
          <div className='flex flex-col gap-2'>
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setActiveTab('overview')}
              className='justify-start'
            >
              <BarChart3 className='h-4 w-4 mr-2' />
              Overview
            </Button>
            <Button
              variant={activeTab === 'branches' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setActiveTab('branches')}
              className='justify-start'
            >
              <Building2 className='h-4 w-4 mr-2' />
              Branches
            </Button>
            <Button
              variant={activeTab === 'financials' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setActiveTab('financials')}
              className='justify-start'
            >
              <DollarSign className='h-4 w-4 mr-2' />
              Financials
            </Button>
            <Button
              variant={activeTab === 'menu' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setActiveTab('menu')}
              className='justify-start'
            >
              <ChefHat className='h-4 w-4 mr-2' />
              Menu & Products
            </Button>
          </div>

          <div className='pt-2 border-t border-slate-200'>
            <DatePickerWithRange date={date} setDate={setDate} />
          </div>
        </div>
      )}
    </div>
  );

  // Desktop Header Component
  const DesktopHeader = () => (
    <div className='bg-white border-b border-slate-200 px-6 py-4 hidden lg:block'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-3'>
            {selectedCompany?.logo && (
              <Image
                src={selectedCompany.logo || '/placeholder.svg'}
                alt={selectedCompany.name}
                width={40}
                height={40}
                className='rounded-lg'
              />
            )}
            <div>
              <h1 className='text-2xl font-bold text-slate-900'>
                {selectedCompany?.name || 'Loading...'}
              </h1>
              <p className='text-sm text-slate-600'>Owner Dashboard</p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <DatePickerWithRange date={date} setDate={setDate} />
          <Button variant='outline' onClick={handleRefresh} disabled={refresh}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refresh ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Headers */}
      <MobileHeader />
      <DesktopHeader />

      {/* Main Content */}
      <div className='p-4 lg:p-6'>
        {/* Desktop Tabs */}
        <div className='hidden lg:block mb-6'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='overview' className='flex items-center gap-2'>
                <BarChart3 className='h-4 w-4' />
                Overview
              </TabsTrigger>
              <TabsTrigger value='branches' className='flex items-center gap-2'>
                <Building2 className='h-4 w-4' />
                Branches
              </TabsTrigger>
              <TabsTrigger
                value='financials'
                className='flex items-center gap-2'
              >
                <DollarSign className='h-4 w-4' />
                Financials
              </TabsTrigger>
              <TabsTrigger value='menu' className='flex items-center gap-2'>
                <ChefHat className='h-4 w-4' />
                Menu & Products
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile Tab Indicator */}
        <div className='lg:hidden mb-4'>
          <div className='flex items-center justify-between bg-white rounded-lg p-2 shadow-sm'>
            <span className='text-sm font-medium text-slate-700 capitalize'>
              {activeTab}
            </span>
            <Badge variant='outline' className='text-xs'>
              {activeTab === 'overview' && 'Today\'s Summary'}
              {activeTab === 'branches' && `${branches.length} Branches`}
              {activeTab === 'financials' && 'Reports'}
              {activeTab === 'menu' && 'Analytics'}
            </Badge>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className='space-y-4 lg:space-y-6'>
            {/* Today's Key Metrics - Mobile */}
            <div className='lg:hidden space-y-3'>
              <MobileMetricCard
                title="Today's Revenue"
                value={`${selectedCompany?.currency}${todayStats.revenue.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                change={todayStats.revenue.change}
                icon={DollarSign}
                color='bg-gradient-to-br from-blue-500 to-blue-600'
                sparklineData={sparklineData.revenue}
                loading={loading}
              />

              <MobileMetricCard
                title="Today's Orders"
                value={todayStats.orders.current.toLocaleString()}
                change={todayStats.orders.change}
                icon={ShoppingCart}
                color='bg-gradient-to-br from-green-500 to-green-600'
                sparklineData={sparklineData.orders}
                loading={loading}
              />

              <MobileMetricCard
                title="Today's Profit"
                value={`${selectedCompany?.currency}${todayStats.profit.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                change={todayStats.profit.change}
                icon={TrendingUp}
                color='bg-gradient-to-br from-purple-500 to-purple-600'
                sparklineData={sparklineData.profit}
                loading={loading}
              />

              <MobileMetricCard
                title='Avg Order Value'
                value={`${selectedCompany?.currency}${todayStats.avgOrderValue.current.toFixed(2)}`}
                change={todayStats.avgOrderValue.change}
                icon={Users}
                color='bg-gradient-to-br from-teal-500 to-teal-600'
                sparklineData={sparklineData.avgOrderValue}
                loading={loading}
              />
            </div>

            {/* Today's Key Metrics - Desktop */}
            <div className='hidden lg:grid grid-cols-5 gap-4'>
              <DesktopMetricCard
                title="Today's Revenue"
                value={todayStats.revenue.current}
                change={todayStats.revenue.change}
                icon={DollarSign}
                color='bg-gradient-to-br from-blue-600 to-blue-600 border-blue-200'
                sparklineData={sparklineData.revenue}
                loading={loading}
                currency={selectedCompany?.currency || '$'}
              />

              <DesktopMetricCard
                title="Today's Orders"
                value={todayStats.orders.current}
                change={todayStats.orders.change}
                icon={ShoppingCart}
                color='bg-gradient-to-br from-green-600 to-green-600 border-green-200'
                sparklineData={sparklineData.orders}
                loading={loading}
                currency=''
              />

              <DesktopMetricCard
                title="Today's Profit"
                value={todayStats.profit.current}
                change={todayStats.profit.change}
                icon={TrendingUp}
                color='bg-gradient-to-br from-purple-600 to-purple-600 border-purple-200'
                sparklineData={sparklineData.profit}
                loading={loading}
                currency={selectedCompany?.currency || '$'}
              />

              <DesktopMetricCard
                title="Today's Expenses"
                value={todayStats.expenses.current}
                change={todayStats.expenses.change}
                icon={FileText}
                color='bg-gradient-to-br from-orange-600 to-orange-600 border-orange-200'
                sparklineData={sparklineData.expenses}
                loading={loading}
                currency={selectedCompany?.currency || '$'}
              />

              <DesktopMetricCard
                title='Avg Order Value'
                value={todayStats.avgOrderValue.current}
                change={todayStats.avgOrderValue.change}
                icon={Users}
                color='bg-gradient-to-br from-teal-600 to-teal-600 border-teal-200'
                sparklineData={sparklineData.avgOrderValue}
                loading={loading}
                currency={selectedCompany?.currency || '$'}
              />
            </div>

            {/* Performance Trends Chart */}
            <Card>
              <CardHeader className='pb-4'>
                <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                  <CardTitle className='flex items-center gap-2 text-lg lg:text-xl'>
                    <BarChart3 className='h-5 w-5' />
                    Performance Trends
                  </CardTitle>
                  <div className='flex flex-wrap gap-2'>
                    {StatisticHeaders.slice(0, 3).map((header, i) => (
                      <Button
                        key={header.name}
                        variant={
                          selectedHeader === header ? 'default' : 'outline'
                        }
                        size='sm'
                        onClick={() => setSelectedHeader(header)}
                        className='text-xs lg:text-sm'
                      >
                        {header.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='h-[300px] lg:h-[350px]'>
                  <ResponsiveLineChart
                    data={
                      Array.isArray(graphData[selectedHeader.graphIndex])
                        ? graphData[selectedHeader.graphIndex]
                        : []
                    }
                    value={selectedHeader.accessorKey}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Branch Performance Summary & Key Insights */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
              <Card>
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                      <Building2 className='h-5 w-5' />
                      Branch Performance
                    </CardTitle>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setActiveTab('branches')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {activeBranches.slice(0, 3).map((branch, index) => {
                      const isTop = index === 0;
                      const isBottom =
                        index === activeBranches.length - 1 &&
                        activeBranches.length > 1;

                      return (
                        <div
                          key={branch.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isTop
                              ? 'bg-green-50'
                              : isBottom
                                ? 'bg-red-50'
                                : 'bg-slate-50'
                          }`}
                        >
                          <div className='flex-1 min-w-0'>
                            <p
                              className={`font-medium truncate ${
                                isTop
                                  ? 'text-green-900'
                                  : isBottom
                                    ? 'text-red-900'
                                    : 'text-slate-900'
                              }`}
                            >
                              {branch.name}
                            </p>
                            <p
                              className={`text-sm truncate ${
                                isTop
                                  ? 'text-green-700'
                                  : isBottom
                                    ? 'text-red-700'
                                    : 'text-slate-700'
                              }`}
                            >
                              {selectedCompany?.currency}
                              {(branch.todayRevenue || 0).toLocaleString()}{' '}
                              revenue
                            </p>
                          </div>
                          <Badge
                            className={
                              isTop
                                ? 'bg-green-100 text-green-800 ml-2'
                                : isBottom
                                  ? 'bg-red-100 text-red-800 ml-2'
                                  : 'bg-slate-100 text-slate-800 ml-2'
                            }
                          >
                            {isTop
                              ? 'Top'
                              : isBottom
                                ? 'Needs Attention'
                                : `${index + 1}${index === 1 ? 'nd' : 'rd'}`}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <PieChart className='h-5 w-5' />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {keyInsights.map((insight, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 ${insight.bgColor} rounded-lg`}
                      >
                        {insight.icon}
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium text-slate-900 truncate'>
                            {insight.title}
                          </p>
                          <p className='text-sm text-slate-700 truncate'>
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Branches Tab */}
        {activeTab === 'branches' && (
          <div className='space-y-4 lg:space-y-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
              <div className='flex items-center gap-2'>
                <Building2 className='h-5 w-5 text-slate-600' />
                <h2 className='text-xl lg:text-2xl font-bold text-slate-900'>
                  Branch Management
                </h2>
                <Badge variant='outline'>{branches.length} Total</Badge>
              </div>
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowInactiveBranches(!showInactiveBranches)}
                  className='flex items-center gap-2'
                >
                  {showInactiveBranches ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                  <span className='hidden sm:inline'>
                    {showInactiveBranches ? 'Hide Inactive' : 'Show All'}
                  </span>
                </Button>
                <Button size='sm'>Add New Branch</Button>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
              {displayedBranches.map(branch => {
                const maxRevenue = Math.max(
                  ...activeBranches.map(b => b.todayRevenue || 0),
                );
                const progressValue =
                  maxRevenue > 0
                    ? ((branch.todayRevenue || 0) / maxRevenue) * 100
                    : 0;

                return (
                  <Card
                    key={branch.id}
                    className={branch.status === 'inactive' ? 'opacity-60' : ''}
                  >
                    <CardContent className='p-4 lg:p-6'>
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='font-semibold text-slate-900 truncate flex-1'>
                          {branch.name}
                        </h4>
                        <Badge
                          variant={
                            branch.status === 'active' ? 'default' : 'secondary'
                          }
                          className='ml-2'
                        >
                          {branch.status}
                        </Badge>
                      </div>
                      {branch.status === 'active' ? (
                        <div className='space-y-3'>
                          <div className='flex justify-between text-sm'>
                            <span className='text-slate-600'>
                              Today's Revenue:
                            </span>
                            <span className='font-medium'>
                              {selectedCompany?.currency}
                              {(branch.todayRevenue || 0).toLocaleString(
                                undefined,
                                { minimumFractionDigits: 2 },
                              )}
                            </span>
                          </div>
                          <div className='flex justify-between text-sm'>
                            <span className='text-slate-600'>Orders:</span>
                            <span className='font-medium'>
                              {(branch.todayOrders || 0).toLocaleString()}
                            </span>
                          </div>
                          <Progress value={progressValue} className='h-2' />
                          <p className='text-xs text-slate-500 text-center'>
                            {progressValue.toFixed(1)}% of top performer
                          </p>
                        </div>
                      ) : (
                        <p className='text-sm text-slate-500'>
                          Branch is currently inactive
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Financials Tab */}
        {activeTab === 'financials' && (
          <div className='space-y-4 lg:space-y-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
              <h2 className='text-xl lg:text-2xl font-bold text-slate-900'>
                Financial Overview
              </h2>
              <div className='flex flex-col sm:flex-row gap-2'>
                <Button variant='outline' size='sm'>
                  P&L Report
                </Button>
                <Button variant='outline' size='sm'>
                  Export Data
                </Button>
              </div>
            </div>

            {/* Financial Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
              {selectedCompany && (
                <ProfitSummaries
                  companyId={selectedCompany.id}
                  currency={selectedCompany?.currency}
                />
              )}
              {selectedCompany && (
                <BranchStats
                  companyId={selectedCompany.id}
                  currency={selectedCompany.currency}
                />
              )}
            </div>

            {/* Data Tables */}
            <div className='space-y-4 lg:space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='overflow-x-auto'>
                    <DataTable
                      columns={columnsRevenueIncome}
                      data={tableData}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='overflow-x-auto'>
                    <DataTable
                      columns={columnsPayment}
                      data={paymentTableData}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expenses Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='overflow-x-auto'>
                    <DataTable
                      columns={columnsExpenses}
                      data={expensesTableData}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Menu & Products Tab */}
        {activeTab === 'menu' && (
          <div className='space-y-4 lg:space-y-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
              <h2 className='text-xl lg:text-2xl font-bold text-slate-900'>
                Menu Performance
              </h2>
              <Button size='sm'>Manage Menu</Button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
              {selectedCompany && (
                <TopMenusChart companyId={selectedCompany.id} />
              )}

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <ChefHat className='h-5 w-5' />
                    Menu Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-12'>
                    <ChefHat className='h-12 w-12 text-slate-300 mx-auto mb-4' />
                    <p className='text-slate-500'>
                      Additional menu analytics coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
