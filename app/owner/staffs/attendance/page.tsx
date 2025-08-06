'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Clock,
  Building2,
  Download,
  TrendingUp,
  UserCheck,
  BarChart3,
  PieChart,
  RefreshCw,
  Search,
  Eye,
  MapPin,
  Timer,
  AlertCircle,
  CheckCircle,
  XCircle,
  Coffee,
  Calendar,
  Filter,
  Grid,
  List,
  Activity,
  Target,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-time-picker';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResponsiveLineChart } from '@/components/responsive-line-chart';
import { useIsMobile } from '@/hooks/use-mobile';
import { useErrorHandler } from '@/components/error-boundary';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import type { DateRange } from 'react-day-picker';

interface DecodedToken {
  companyId: string;
  userId: string;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  branchId: string;
  email: string;
  signInTime: string | null;
  signOutTime: string | null;
  date: string;
  totalHours: number | null;
  status: 'SIGNED_IN' | 'SIGNED_OUT' | 'BREAK' | 'OVERTIME';
  signInDistance: number | null;
  signOutDistance: number | null;
  notes: string | null;
  user: {
    id: string;
    fullname: string;
    email: string;
    role: string;
  };
  branch: {
    id: string;
    name: string;
    city: string;
  };
}

interface ActiveSession extends AttendanceRecord {
  currentWorkingHours: number;
}

interface BranchStat {
  branchId: string;
  branchName: string;
  branchCity: string;
  totalShifts: number;
  totalHours: number;
  averageHours: number;
}

interface UserStat {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  totalShifts: number;
  totalHours: number;
  averageHours: number;
}

interface AttendanceAnalytics {
  summary: {
    totalRecords: number;
    completedShifts: number;
    incompleteShifts: number;
    totalHours: number;
    averageHours: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  records: AttendanceRecord[];
  branchStats: BranchStat[];
  userStats: UserStat[];
  dailyTrends: Array<{
    date: string;
    _count: { id: number };
    _sum: { totalHours: number | null };
  }>;
  activeSessions: ActiveSession[];
}

interface Branch {
  id: string;
  name: string;
  city: string;
  status: 'active' | 'inactive';
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const formatTime = (dateString: string) => {
  return format(new Date(dateString), 'HH:mm');
};

const getStatusColor = (status: string) => {
  switch (status) {
  case 'SIGNED_IN':
    return 'bg-green-100 text-green-800 border-green-200';
  case 'SIGNED_OUT':
    return 'bg-gray-100 text-gray-800 border-gray-200';
  case 'BREAK':
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  case 'OVERTIME':
    return 'bg-red-100 text-red-800 border-red-200';
  default:
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
  case 'SIGNED_IN':
    return <CheckCircle className='h-4 w-4' />;
  case 'SIGNED_OUT':
    return <XCircle className='h-4 w-4' />;
  case 'BREAK':
    return <Coffee className='h-4 w-4' />;
  case 'OVERTIME':
    return <Timer className='h-4 w-4' />;
  default:
    return <Clock className='h-4 w-4' />;
  }
};

// Loading skeleton component
const AttendanceSkeleton = () => (
  <Card>
    <CardContent className='p-4 space-y-3'>
      <div className='flex items-center space-x-3'>
        <Skeleton className='h-10 w-10 rounded-full' />
        <div className='space-y-2 flex-1'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-3 w-16' />
        </div>
        <Skeleton className='h-6 w-16' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-3 w-full' />
        <Skeleton className='h-3 w-3/4' />
      </div>
    </CardContent>
  </Card>
);

// Mobile attendance card component
const MobileAttendanceCard = ({ record }: { record: AttendanceRecord }) => (
  <Card className='overflow-hidden'>
    <CardContent className='p-4 space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <Avatar className='h-10 w-10'>
            <AvatarFallback className='bg-slate-100 text-slate-700 font-semibold'>
              {getInitials(record.user.fullname)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-slate-900 truncate'>
              {record.user.fullname}
            </h3>
            <p className='text-sm text-slate-600 truncate'>
              {record.user.role}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(record.status)}>
          {getStatusIcon(record.status)}
        </Badge>
      </div>

      <div className='space-y-2 text-sm'>
        <div className='flex items-center text-slate-600'>
          <MapPin className='h-3 w-3 mr-2' />
          <span className='truncate'>{record.branch.name}</span>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center text-slate-600'>
            <Clock className='h-3 w-3 mr-2' />
            <span>{format(new Date(record.date), 'MMM dd')}</span>
          </div>

          {record.totalHours && (
            <div className='flex items-center text-slate-600'>
              <Timer className='h-3 w-3 mr-2' />
              <span>{formatDuration(record.totalHours)}</span>
            </div>
          )}
        </div>

        {record.signInTime && (
          <div className='flex items-center justify-between text-xs text-slate-500'>
            <span>In: {formatTime(record.signInTime)}</span>
            {record.signOutTime && (
              <span>Out: {formatTime(record.signOutTime)}</span>
            )}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Desktop attendance card component
const DesktopAttendanceCard = ({ record }: { record: AttendanceRecord }) => (
  <Card className='hover:shadow-md transition-shadow'>
    <CardContent className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-4'>
          <Avatar className='h-12 w-12'>
            <AvatarFallback className='bg-slate-100 text-slate-700 font-semibold'>
              {getInitials(record.user.fullname)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className='font-semibold text-slate-900'>
              {record.user.fullname}
            </h3>
            <p className='text-sm text-slate-600'>{record.user.role}</p>
          </div>
        </div>
        <Badge className={getStatusColor(record.status)}>
          {getStatusIcon(record.status)}
          <span className='ml-1'>{record.status.replace('_', ' ')}</span>
        </Badge>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
        <div className='flex items-center text-slate-600'>
          <MapPin className='h-4 w-4 mr-2' />
          <span className='truncate'>{record.branch.name}</span>
        </div>

        <div className='flex items-center text-slate-600'>
          <Calendar className='h-4 w-4 mr-2' />
          <span>{format(new Date(record.date), 'MMM dd, yyyy')}</span>
        </div>

        {record.signInTime && (
          <div className='flex items-center text-slate-600'>
            <Clock className='h-4 w-4 mr-2' />
            <span>
              {formatTime(record.signInTime)} -{' '}
              {record.signOutTime ? formatTime(record.signOutTime) : 'Active'}
            </span>
          </div>
        )}

        {record.totalHours && (
          <div className='flex items-center text-slate-600'>
            <Timer className='h-4 w-4 mr-2' />
            <span>{formatDuration(record.totalHours)}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function AttendanceManagement() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { error, handleError, clearError } = useErrorHandler();

  const [attendanceData, setAttendanceData] =
    useState<AttendanceAnalytics | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [viewMode, setViewMode] = useState<
    'overview' | 'details' | 'analytics'
  >('overview');

  // Fetch data with error handling
  const fetchData = useCallback(
    async (companyId: string) => {
      try {
        setLoading(true);
        clearError();

        // Build query parameters
        const params = new URLSearchParams({
          companyId,
        });

        if (selectedBranch !== 'all') {
          params.append('branchId', selectedBranch);
        }

        if (dateRange?.from) {
          params.append('startDate', dateRange.from.toISOString());
        }

        if (dateRange?.to) {
          params.append('endDate', dateRange.to.toISOString());
        }

        // Fetch real attendance analytics data
        const [analyticsResponse, branchesResponse] = await Promise.all([
          fetch(`/api/attendance/analytics?${params}`),
          fetch(`/api/branches?companyId=${companyId}`),
        ]);

        if (!analyticsResponse.ok) {
          throw new Error(
            `Failed to fetch analytics: ${analyticsResponse.statusText}`,
          );
        }

        if (!branchesResponse.ok) {
          throw new Error(
            `Failed to fetch branches: ${branchesResponse.statusText}`,
          );
        }

        const [analyticsData, branchesData] = await Promise.all([
          analyticsResponse.json(),
          branchesResponse.json(),
        ]);

        setAttendanceData(analyticsData);
        setBranches(branchesData);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch attendance data';
        handleError(new Error(errorMessage));
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError, toast, dateRange, selectedBranch],
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleError(new Error('Authentication token not found'));
      return;
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      fetchData(decodedToken.companyId);
    } catch (err) {
      handleError(new Error('Invalid authentication token'));
    }
  }, [fetchData, handleError]);

  // Refetch data when filters change
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        fetchData(decodedToken.companyId);
      } catch (err) {
        // Token error already handled in main useEffect
      }
    }
  }, [dateRange, selectedBranch, fetchData]);

  const handleRefresh = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      fetchData(decodedToken.companyId);
    }
  }, [fetchData]);

  const exportData = useCallback(() => {
    if (!attendanceData?.records) {
      toast({
        title: 'No Data',
        description: 'No attendance data available to export',
        variant: 'destructive',
      });
      return;
    }

    const csvContent = [
      [
        'Date',
        'Employee',
        'Role',
        'Branch',
        'Sign In',
        'Sign Out',
        'Total Hours',
        'Status',
      ].join(','),
      ...attendanceData.records.map(record =>
        [
          format(new Date(record.date), 'yyyy-MM-dd'),
          record.user.fullname,
          record.user.role,
          record.branch.name,
          record.signInTime ? formatTime(record.signInTime) : 'N/A',
          record.signOutTime ? formatTime(record.signOutTime) : 'N/A',
          record.totalHours ? formatDuration(record.totalHours) : 'N/A',
          record.status,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: 'Attendance data has been exported as CSV',
    });
  }, [attendanceData?.records, toast]);

  // Filtered records for display
  const filteredRecords = useMemo(() => {
    if (!attendanceData?.records) return [];

    return attendanceData.records.filter(record => {
      const matchesSearch =
        record.user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch =
        selectedBranch === 'all' || record.branchId === selectedBranch;
      const matchesStatus =
        selectedStatus === 'all' || record.status === selectedStatus;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [attendanceData?.records, searchTerm, selectedBranch, selectedStatus]);

  if (error) {
    return (
      <div className='p-4'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {error.message}. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-2xl lg:text-3xl font-bold text-slate-900'>
            Attendance Management
          </h1>
          <p className='text-slate-600 mt-1'>
            Monitor and manage staff attendance across all branches
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <Button variant='outline' onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button onClick={exportData}>
            <Download className='h-4 w-4 mr-2' />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {attendanceData && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-slate-600'>
                    Total Records
                  </p>
                  <p className='text-2xl font-bold text-slate-900'>
                    {attendanceData.summary.totalRecords}
                  </p>
                </div>
                <Users className='h-8 w-8 text-blue-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-slate-600'>
                    Completed Shifts
                  </p>
                  <p className='text-2xl font-bold text-green-600'>
                    {attendanceData.summary.completedShifts}
                  </p>
                </div>
                <div className='h-8 w-8 rounded-full bg-green-100 flex items-center justify-center'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-slate-600'>
                    Total Hours
                  </p>
                  <p className='text-2xl font-bold text-purple-600'>
                    {attendanceData.summary.totalHours.toFixed(1)}h
                  </p>
                </div>
                <Clock className='h-8 w-8 text-purple-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-slate-600'>
                    Avg Hours
                  </p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {attendanceData.summary.averageHours.toFixed(1)}h
                  </p>
                </div>
                <Target className='h-8 w-8 text-orange-600' />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className='flex flex-col lg:flex-row gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
            <Input
              placeholder='Search by name or email...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        <div className='flex gap-2'>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Branch' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Branches</SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='SIGNED_IN'>Signed In</SelectItem>
              <SelectItem value='SIGNED_OUT'>Signed Out</SelectItem>
              <SelectItem value='BREAK'>On Break</SelectItem>
              <SelectItem value='OVERTIME'>Overtime</SelectItem>
            </SelectContent>
          </Select>

          <DatePickerWithRange date={dateRange} setDate={setDateRange} />

          <div className='flex border rounded-md'>
            <Button
              variant={viewMode === 'overview' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('overview')}
              className='rounded-r-none'
            >
              <BarChart3 className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'details' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('details')}
              className='rounded-none'
            >
              <List className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'analytics' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('analytics')}
              className='rounded-l-none'
            >
              <TrendingUp className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Tabs
        value={viewMode}
        onValueChange={value => setViewMode(value as any)}
        className='space-y-6'
      >
        <TabsContent value='overview' className='space-y-6'>
          {/* Overview Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Daily Attendance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceData ? (
                  <ResponsiveLineChart
                    data={attendanceData.dailyTrends.map(trend => ({
                      date: format(new Date(trend.date), 'MMM dd'),
                      records: trend._count.id,
                      hours: trend._sum.totalHours || 0,
                    }))}
                    value='records'
                  />
                ) : (
                  <div className='h-[300px] flex items-center justify-center'>
                    <Skeleton className='h-full w-full' />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Building2 className='h-5 w-5' />
                  Branch Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceData ? (
                  <div className='space-y-4'>
                    {attendanceData.branchStats.map(stat => (
                      <div
                        key={stat.branchId}
                        className='flex items-center justify-between p-3 bg-slate-50 rounded-lg'
                      >
                        <div>
                          <p className='font-medium text-slate-900'>
                            {stat.branchName}
                          </p>
                          <p className='text-sm text-slate-600'>
                            {stat.branchCity}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-slate-900'>
                            {stat.totalShifts} shifts
                          </p>
                          <p className='text-sm text-slate-600'>
                            {stat.averageHours.toFixed(1)}h avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className='h-16 w-full' />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='details' className='space-y-6'>
          {/* Attendance Records */}
          <div>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-slate-900'>
                Attendance Records
                <span className='text-slate-500 ml-2'>
                  ({filteredRecords.length})
                </span>
              </h2>
            </div>

            {loading ? (
              <div className='space-y-4'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <AttendanceSkeleton key={i} />
                ))}
              </div>
            ) : filteredRecords.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-16'>
                  <Users className='h-16 w-16 text-slate-400 mb-4' />
                  <h3 className='text-lg font-medium text-slate-900 mb-2'>
                    No attendance records found
                  </h3>
                  <p className='text-slate-500 mb-6 text-center'>
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'No attendance data available for the selected period'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='space-y-4'>
                {filteredRecords.map(record =>
                  isMobile ? (
                    <MobileAttendanceCard key={record.id} record={record} />
                  ) : (
                    <DesktopAttendanceCard key={record.id} record={record} />
                  ),
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          {/* Analytics Content */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Award className='h-5 w-5' />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceData ? (
                  <div className='space-y-4'>
                    {attendanceData.userStats.slice(0, 5).map(stat => (
                      <div
                        key={stat.userId}
                        className='flex items-center justify-between p-3 bg-slate-50 rounded-lg'
                      >
                        <div className='flex items-center space-x-3'>
                          <Avatar className='h-8 w-8'>
                            <AvatarFallback className='bg-slate-100 text-slate-700 font-semibold'>
                              {getInitials(stat.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium text-slate-900'>
                              {stat.userName}
                            </p>
                            <p className='text-sm text-slate-600'>
                              {stat.userRole}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-slate-900'>
                            {stat.totalShifts} shifts
                          </p>
                          <p className='text-sm text-slate-600'>
                            {stat.averageHours.toFixed(1)}h avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className='h-16 w-full' />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Attendance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceData ? (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-slate-600'>
                        Completion Rate
                      </span>
                      <span className='text-sm font-semibold text-slate-900'>
                        {(
                          (attendanceData.summary.completedShifts /
                            attendanceData.summary.totalRecords) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (attendanceData.summary.completedShifts /
                          attendanceData.summary.totalRecords) *
                        100
                      }
                      className='h-2'
                    />

                    <div className='grid grid-cols-2 gap-4 pt-4'>
                      <div className='text-center p-3 bg-green-50 rounded-lg'>
                        <p className='text-2xl font-bold text-green-600'>
                          {attendanceData.summary.completedShifts}
                        </p>
                        <p className='text-sm text-green-700'>Completed</p>
                      </div>
                      <div className='text-center p-3 bg-red-50 rounded-lg'>
                        <p className='text-2xl font-bold text-red-600'>
                          {attendanceData.summary.incompleteShifts}
                        </p>
                        <p className='text-sm text-red-700'>Incomplete</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <Skeleton className='h-8 w-full' />
                    <Skeleton className='h-2 w-full' />
                    <div className='grid grid-cols-2 gap-4'>
                      <Skeleton className='h-20 w-full' />
                      <Skeleton className='h-20 w-full' />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
