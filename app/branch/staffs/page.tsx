'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Calendar,
  Clock,
  Users,
  Eye,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { getBranchById } from '@/lib/branch';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';

interface User {
  id: string;
  fullname: string;
  status: string;
  email: string;
  role: string;
  branchId: string | null;
}

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  [key: string]: any;
}

interface Branch {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string | null;
  country: string;
  openingHours: string;
  status: string;
  managerId: string | null;
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
  user: {
    id: string;
    fullname: string;
    email: string;
    role: string;
  };
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
    icon: '○',
    label: 'Inactive',
  },
  ACTIVE: {
    color: 'bg-blue-100 text-blue-700',
    icon: '▶',
    label: 'Active',
  },
  ASSIST: {
    color: 'bg-yellow-100 text-yellow-700',
    icon: '★',
    label: 'Assist',
  },
  BREAK: {
    color: 'bg-orange-100 text-orange-700',
    icon: '☕',
    label: 'Break',
  },
  COMPLETED: {
    color: 'bg-green-100 text-green-700',
    icon: '✓',
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

export default function StaffByBranch() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openBranches, setOpenBranches] = useState<Set<string>>(new Set());
  const [branchId, setBranchId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userShifts, setUserShifts] = useState<Shift[]>([]);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found');
          return;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        const id = decodedToken.branchId;
        setBranchId(id ?? '');

        const [branchesResponse, usersResponse, shiftsResponse] =
          await Promise.all([
            fetch('/api/branches'),
            fetch('/api/users'),
            fetch(`/api/shift?branchId=${id}`),
          ]);

        if (!branchesResponse.ok || !usersResponse.ok || !shiftsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const branchesData = await branchesResponse.json();
        const usersData = await usersResponse.json();
        const shiftsData = await shiftsResponse.json();

        setBranches(branchesData);
        setUsers(usersData.filter((user: User) => user.status === 'active'));
        setShifts(shiftsData);
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleBranch = (branchId: string) => {
    setOpenBranches(prevOpen => {
      const newOpen = new Set(prevOpen);
      if (newOpen.has(branchId)) {
        newOpen.delete(branchId);
      } else {
        newOpen.add(branchId);
      }
      return newOpen;
    });
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

  const getStaffShiftStats = (userId: string) => {
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

    return {
      totalShifts,
      completedShifts,
      activeShifts,
      upcomingShifts,
      completionRate,
    };
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesBranch = !branchId || user.branchId === branchId;
    return matchesSearch && matchesRole && matchesBranch;
  });

  const getBranchStats = () => {
    const branchUsers = users.filter(user => user.branchId === branchId);
    const branchShifts = shifts.filter(shift => shift.branchId === branchId);
    const totalShifts = branchShifts.length;
    const completedShifts = branchShifts.filter(
      s => s.shiftState === 'COMPLETED'
    ).length;
    const activeShifts = branchShifts.filter(
      s => s.shiftState === 'ACTIVE'
    ).length;
    const overallCompletionRate =
      totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0;

    return {
      totalStaff: branchUsers.length,
      totalShifts,
      completedShifts,
      activeShifts,
      overallCompletionRate,
    };
  };

  const branchStats = getBranchStats();

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600'>{error}</p>
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
            Branch Staff Management
          </h1>
          <p className='text-muted-foreground'>
            Manage your branch staff and track their shift performance
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Link href='/branch/staffs/shifts-grid'>
            <Button>
              <Calendar className='mr-2 h-4 w-4' />
              Manage Shifts
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Branch Stats */}
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
                  {branchStats.totalStaff}
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
                  {branchStats.totalShifts}
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
                <Clock className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {branchStats.completedShifts}
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
                <Clock className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {branchStats.activeShifts}
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
                <Clock className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>
                  {branchStats.overallCompletionRate.toFixed(1)}%
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
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className='w-full sm:w-[200px]'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='All Roles' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Roles</SelectItem>
            <SelectItem value='manager'>Manager</SelectItem>
            <SelectItem value='waiter'>Waiter</SelectItem>
            <SelectItem value='chef'>Chef</SelectItem>
            <SelectItem value='cashier'>Cashier</SelectItem>
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
              Branch Staff
            </CardTitle>
            <CardDescription>
              View and manage your branch staff members and their shift
              performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
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
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-sm'>
                            <Calendar className='h-3 w-3' />
                            <span>{stats.totalShifts} shifts</span>
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
              {selectedUser?.fullname} - Shift Details
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
                  <Badge variant='outline' className='capitalize mt-1'>
                    {selectedUser.role}
                  </Badge>
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
                                  <span>{stateConfig.icon}</span>
                                  {stateConfig.label}
                                </div>
                              </Badge>
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
