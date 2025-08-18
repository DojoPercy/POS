'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { fetchUserFromToken, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import { RootState } from '@/redux';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  CheckCircle,
  Play,
  Circle,
  Star,
  Coffee,
  Building,
  User,
  Activity,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  fullname: string;
  email: string;
  role: string;
  status: string;
  branchId: string;
  branch: {
    id: string;
    name: string;
  };
}

interface Shift {
  id: string;
  userId: string;
  branchId: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  status: string;
  shiftState: 'INACTIVE' | 'ACTIVE' | 'ASSIST' | 'BREAK' | 'COMPLETED';
  role: string;
  notes?: string;
  branch: {
    id: string;
    name: string;
  };
}

interface StaffShiftStats {
  totalShifts: number;
  completedShifts: number;
  activeShifts: number;
  upcomingShifts: number;
  completionRate: number;
  totalHours: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const shiftStateConfig = {
  INACTIVE: {
    color: 'bg-gray-100 text-gray-700',
    icon: <Circle className='h-3 w-3 text-gray-500' />,
    label: 'Inactive',
  },
  ACTIVE: {
    color: 'bg-blue-100 text-blue-700',
    icon: <Play className='h-3 w-3 text-blue-600' />,
    label: 'Active',
  },
  ASSIST: {
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Star className='h-3 w-3 text-yellow-600' />,
    label: 'Assist',
  },
  BREAK: {
    color: 'bg-orange-100 text-orange-700',
    icon: <Coffee className='h-3 w-3 text-orange-600' />,
    label: 'Break',
  },
  COMPLETED: {
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className='h-3 w-3 text-green-600' />,
    label: 'Completed',
  },
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function StaffsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userShifts, setUserShifts] = useState<Shift[]>([]);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const user = useSelector(selectUser);
  const { company } = useSelector((state: RootState) => state.company);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId));
    }
  }, [dispatch, user?.companyId]);

  useEffect(() => {
    if (company?.id) {
      fetchData();
    }
  }, [company?.id, selectedBranch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, branchesResponse, shiftsResponse] =
        await Promise.all([
          fetch(`/api/users?companyId=${company?.id}`),
          fetch(`/api/branches?companyId=${company?.id}`),
          fetch(
            `/api/shift?companyId=${company?.id}&branchId=${selectedBranch}`
          ),
        ]);

      if (usersResponse.ok && branchesResponse.ok && shiftsResponse.ok) {
        const usersData = await usersResponse.json();
        const branchesData = await branchesResponse.json();
        const shiftsData = await shiftsResponse.json();

        setUsers(usersData.filter((user: User) => user.status === 'active'));
        setBranches(branchesData);
        setShifts(shiftsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch staff data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserShifts = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/shifts`);
      if (response.ok) {
        const shiftsData = await response.json();
        setUserShifts(shiftsData);
      }
    } catch (error) {
      console.error('Error fetching user shifts:', error);
    }
  };

  const handleViewShifts = (user: User) => {
    setSelectedUser(user);
    fetchUserShifts(user.id);
    setIsShiftDialogOpen(true);
  };

  const getStaffShiftStats = (userId: string): StaffShiftStats => {
    const userShifts = shifts.filter(shift => shift.userId === userId);
    const totalShifts = userShifts.length;
    const completedShifts = userShifts.filter(
      s => s.shiftState === 'COMPLETED'
    ).length;
    const activeShifts = userShifts.filter(
      s => s.shiftState === 'ACTIVE'
    ).length;
    const upcomingShifts = userShifts.filter(
      s => s.shiftState === 'INACTIVE'
    ).length;
    const completionRate =
      totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0;

    const totalHours = userShifts.reduce((total, shift) => {
      const start = Number.parseInt(shift.startTime.split(':')[0]);
      const end = Number.parseInt(shift.endTime.split(':')[0]);
      return total + (end - start);
    }, 0);

    return {
      totalShifts,
      completedShifts,
      activeShifts,
      upcomingShifts,
      completionRate,
      totalHours,
    };
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch =
      selectedBranch === 'all' || user.branchId === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  const getOverallStats = () => {
    const totalStaff = users.length;
    const totalShifts = shifts.length;
    const completedShifts = shifts.filter(
      s => s.shiftState === 'COMPLETED'
    ).length;
    const activeShifts = shifts.filter(s => s.shiftState === 'ACTIVE').length;
    const overallCompletionRate =
      totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0;

    return {
      totalStaff,
      totalShifts,
      completedShifts,
      activeShifts,
      overallCompletionRate,
    };
  };

  const overallStats = getOverallStats();

  if (loading) {
    return (
      <div className='container mx-auto py-6 space-y-6'>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-1/3' />
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-24 w-full' />
            ))}
          </div>
          <Skeleton className='h-96 w-full' />
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6 space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'
      >
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Staff Management
          </h1>
          <p className='text-muted-foreground'>
            Manage your staff, view shifts, and track performance
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Link href='/owner/staffs/shifts-grid'>
            <Button>
              <Calendar className='mr-2 h-4 w-4' />
              Manage Shifts
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Overall Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'
      >
        <Card className='bg-white hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Users className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {overallStats.totalStaff}
                </p>
                <p className='text-sm text-gray-600'>Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <Calendar className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {overallStats.totalShifts}
                </p>
                <p className='text-sm text-gray-600'>Total Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <CheckCircle className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {overallStats.completedShifts}
                </p>
                <p className='text-sm text-gray-600'>Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Play className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {overallStats.activeShifts}
                </p>
                <p className='text-sm text-gray-600'>Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <TrendingUp className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {overallStats.overallCompletionRate.toFixed(1)}%
                </p>
                <p className='text-sm text-gray-600'>Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='flex flex-col sm:flex-row gap-4'
      >
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Search staff...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className='w-full sm:w-[200px]'>
            <Building className='h-4 w-4 mr-2' />
            <SelectValue placeholder='All Branches' />
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
      </motion.div>

      {/* Staff Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className='bg-white'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Staff Members
            </CardTitle>
            <CardDescription>
              View and manage your staff members and their shift performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Shift Stats</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => {
                  const stats = getStaffShiftStats(user.id);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-8 w-8'>
                            <AvatarFallback className='bg-blue-600 text-white text-sm'>
                              {getInitials(user.fullname)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium'>{user.fullname}</p>
                            <p className='text-sm text-gray-500'>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className='capitalize'>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <MapPin className='h-3 w-3 text-gray-500' />
                          <span className='text-sm'>{user.branch.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-sm'>
                            <Calendar className='h-3 w-3' />
                            <span>{stats.totalShifts} shifts</span>
                          </div>
                          <div className='flex items-center gap-2 text-sm'>
                            <Clock className='h-3 w-3' />
                            <span>{stats.totalHours}h total</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <div className='flex-1 bg-gray-200 rounded-full h-2'>
                              <div
                                className='bg-green-600 h-2 rounded-full'
                                style={{ width: `${stats.completionRate}%` }}
                              />
                            </div>
                            <span className='text-xs font-medium'>
                              {stats.completionRate.toFixed(0)}%
                            </span>
                          </div>
                          <div className='flex gap-1'>
                            <Badge
                              className={shiftStateConfig.COMPLETED.color}
                              variant='outline'
                            >
                              {stats.completedShifts}
                            </Badge>
                            <Badge
                              className={shiftStateConfig.ACTIVE.color}
                              variant='outline'
                            >
                              {stats.activeShifts}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleViewShifts(user)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Link href={`/staffs/shifts/${user.id}`}>
                            <Button variant='ghost' size='sm'>
                              <Calendar className='h-4 w-4' />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Staff Shifts Dialog */}
      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              {selectedUser?.fullname} - Shift History
            </DialogTitle>
            <DialogDescription>
              View detailed shift information and performance metrics
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className='space-y-6'>
              {/* User Info */}
              <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
                <Avatar className='h-12 w-12'>
                  <AvatarFallback className='bg-blue-600 text-white'>
                    {getInitials(selectedUser.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='font-semibold'>{selectedUser.fullname}</h3>
                  <p className='text-sm text-gray-600'>{selectedUser.email}</p>
                  <div className='flex items-center gap-2 mt-1'>
                    <Badge variant='outline' className='capitalize'>
                      {selectedUser.role}
                    </Badge>
                    <div className='flex items-center gap-1 text-sm text-gray-500'>
                      <Building className='h-3 w-3' />
                      {selectedUser.branch.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shift Stats */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {(() => {
                  const stats = getStaffShiftStats(selectedUser.id);
                  return (
                    <>
                      <Card>
                        <CardContent className='p-3'>
                          <div className='text-center'>
                            <p className='text-2xl font-bold text-blue-600'>
                              {stats.totalShifts}
                            </p>
                            <p className='text-xs text-gray-600'>
                              Total Shifts
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className='p-3'>
                          <div className='text-center'>
                            <p className='text-2xl font-bold text-green-600'>
                              {stats.completedShifts}
                            </p>
                            <p className='text-xs text-gray-600'>Completed</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className='p-3'>
                          <div className='text-center'>
                            <p className='text-2xl font-bold text-blue-600'>
                              {stats.activeShifts}
                            </p>
                            <p className='text-xs text-gray-600'>Active</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className='p-3'>
                          <div className='text-center'>
                            <p className='text-2xl font-bold text-purple-600'>
                              {stats.completionRate.toFixed(1)}%
                            </p>
                            <p className='text-xs text-gray-600'>
                              Completion Rate
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>

              {/* Shifts Table */}
              <div className='space-y-4'>
                <h4 className='font-semibold'>Recent Shifts</h4>
                <div className='border rounded-lg'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Branch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userShifts.slice(0, 10).map(shift => {
                        const stateConfig = shiftStateConfig[shift.shiftState];
                        const day = DAYS_OF_WEEK.find(
                          d => d.value === shift.dayOfWeek
                        );
                        return (
                          <TableRow key={shift.id}>
                            <TableCell>
                              <div className='text-sm'>
                                <div className='font-medium'>{day?.short}</div>
                                <div className='text-gray-500'>
                                  {day?.label}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='font-medium'>{shift.title}</div>
                              <div className='text-sm text-gray-500'>
                                {shift.role}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='text-sm'>
                                {shift.startTime} - {shift.endTime}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={stateConfig.color}>
                                <div className='flex items-center gap-1'>
                                  {stateConfig.icon}
                                  {stateConfig.label}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className='text-sm'>{shift.branch.name}</div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
