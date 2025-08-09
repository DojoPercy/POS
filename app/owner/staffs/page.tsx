'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Plus,
  Users,
  MapPin,
  MoreVertical,
  Mail,
  Phone,
  Edit,
  Trash2,
  Clock,
  Filter,
  Grid,
  List,
  Building2,
  Calendar,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useErrorHandler } from '@/components/error-boundary';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import ShiftTimetable from './shifttimetable';

interface User {
  id: string;
  fullname: string;
  status: string;
  email: string;
  role: string;
  branchId: string | null;
  phone?: string;
  avatar?: string;
  joinDate?: string;
  lastActive?: string;
  performance?: number;
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

interface DecodedToken {
  companyId: string;
}

// Role configuration with colors and icons
const ROLE_CONFIG = {
  manager: {
    color: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300',
    textColor: 'text-purple-700',
    icon: '👔',
    priority: 1,
  },
  chef: {
    color: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300',
    textColor: 'text-orange-700',
    icon: '👨‍🍳',
    priority: 2,
  },
  waiter: {
    color: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300',
    textColor: 'text-blue-700',
    icon: '🍽️',
    priority: 3,
  },
  barista: {
    color: 'bg-gradient-to-br from-green-100 to-green-200 border-green-300',
    textColor: 'text-green-700',
    icon: '☕',
    priority: 4,
  },
  cashier: {
    color: 'bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300',
    textColor: 'text-pink-700',
    icon: '💳',
    priority: 5,
  },
  default: {
    color: 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300',
    textColor: 'text-gray-700',
    icon: '👤',
    priority: 6,
  },
};

const getRoleConfig = (role: string) => {
  return (
    ROLE_CONFIG[role.toLowerCase() as keyof typeof ROLE_CONFIG] ||
    ROLE_CONFIG.default
  );
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Loading skeleton component
const StaffSkeleton = () => (
  <Card className='overflow-hidden'>
    <CardContent className='p-4 space-y-3'>
      <div className='flex items-center space-x-3'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <div className='space-y-2 flex-1'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-3 w-16' />
        </div>
        <Skeleton className='h-8 w-8 rounded' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-3 w-full' />
        <Skeleton className='h-3 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
      </div>
      <div className='flex justify-between items-center'>
        <Skeleton className='h-6 w-16' />
        <Skeleton className='h-3 w-20' />
      </div>
    </CardContent>
  </Card>
);

// Mobile staff card component
const MobileStaffCard = ({
  user,
  branch,
  onEdit,
  onDelete,
}: {
  user: User;
  branch?: Branch;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}) => {
  const roleConfig = getRoleConfig(user.role);

  return (
    <Card className={`overflow-hidden ${roleConfig.color} border-0 shadow-sm`}>
      <CardContent className='p-4 space-y-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-3'>
            <Avatar className='h-12 w-12 border-2 border-white shadow-sm'>
              <AvatarImage
                src={user.avatar || '/placeholder.svg'}
                alt={user.fullname}
              />
              <AvatarFallback className='bg-white text-gray-700 font-semibold'>
                {getInitials(user.fullname)}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-gray-900 truncate'>
                {user.fullname}
              </h3>
              <div className='flex items-center gap-2 mt-1'>
                <span className='text-sm text-gray-600 capitalize'>
                  {user.role}
                </span>
                <span className='text-lg'>{roleConfig.icon}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(user.id)}
                className='text-red-600'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='space-y-2 text-sm'>
          <div className='flex items-center text-gray-600'>
            <Mail className='h-3 w-3 mr-2' />
            <span className='truncate'>{user.email}</span>
          </div>

          {branch && (
            <div className='flex items-center text-gray-600'>
              <MapPin className='h-3 w-3 mr-2' />
              <span className='truncate'>{branch.name}</span>
            </div>
          )}

          {user.phone && (
            <div className='flex items-center text-gray-600'>
              <Phone className='h-3 w-3 mr-2' />
              <span>{user.phone}</span>
            </div>
          )}
        </div>

        <div className='flex items-center justify-between pt-2 border-t border-white/50'>
          <Badge
            variant={user.status === 'active' ? 'default' : 'secondary'}
            className='text-xs'
          >
            {user.status}
          </Badge>
          {user.performance && user.performance > 0 && (
            <div className='flex items-center gap-1'>
              <Star className='h-3 w-3 text-yellow-500' />
              <span className='text-xs text-gray-600'>
                {user.performance}/5
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Desktop staff card component
const DesktopStaffCard = ({
  user,
  branch,
  onEdit,
  onDelete,
}: {
  user: User;
  branch?: Branch;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}) => {
  const roleConfig = getRoleConfig(user.role);

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 border-2 ${roleConfig.color}`}
    >
      <CardContent className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <Avatar className='h-12 w-12 border-2 border-white shadow-sm'>
              <AvatarImage
                src={user.avatar || '/placeholder.svg'}
                alt={user.fullname}
              />
              <AvatarFallback className='bg-white text-gray-700 font-semibold'>
                {getInitials(user.fullname)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className='font-semibold text-gray-900'>{user.fullname}</h3>
              <div className='flex items-center gap-2 mt-1'>
                <p className='text-sm text-gray-600 capitalize'>{user.role}</p>
                <span className='text-lg'>{roleConfig.icon}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='bg-white'>
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className='h-4 w-4 mr-2' />
                Edit Staff
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-red-600'
                onClick={() => onDelete(user.id)}
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Remove Staff
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center text-sm text-gray-600'>
            <Mail className='h-4 w-4 mr-2' />
            <span className='truncate'>{user.email}</span>
          </div>

          {branch && (
            <div className='flex items-center text-sm text-gray-600'>
              <MapPin className='h-4 w-4 mr-2' />
              <span className='truncate'>{branch.name}</span>
            </div>
          )}

          {user.phone && (
            <div className='flex items-center text-sm text-gray-600'>
              <Phone className='h-4 w-4 mr-2' />
              <span>{user.phone}</span>
            </div>
          )}
        </div>

        <div className='flex items-center justify-between mt-4 pt-4 border-t border-white/50'>
          <Badge
            variant={user.status === 'active' ? 'default' : 'secondary'}
            className='text-xs'
          >
            {user.status}
          </Badge>
          <div className='flex items-center gap-2'>
            {user.performance && user.performance > 0 && (
              <div className='flex items-center gap-1'>
                <Star className='h-3 w-3 text-yellow-500' />
                <span className='text-xs text-gray-600'>
                  {user.performance}/5
                </span>
              </div>
            )}
            {user.joinDate && (
              <span className='text-xs text-gray-500'>
                Joined {new Date(user.joinDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Branch section component
const BranchSection = ({
  branch,
  users: branchUsers,
  onEdit,
  onDelete,
}: {
  branch: Branch;
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}) => (
  <div className='mb-8'>
    <div className='flex items-center justify-between mb-4'>
      <div className='flex items-center space-x-3'>
        <div className='p-2 bg-purple-100 rounded-lg'>
          <MapPin className='h-5 w-5 text-purple-600' />
        </div>
        <div>
          <h2 className='text-xl font-bold text-gray-900'>{branch.name}</h2>
          <p className='text-sm text-gray-600'>
            {branch.city}, {branch.country}
          </p>
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
          {branch.status}
        </Badge>
        <Badge variant='outline' className='text-xs'>
          {branchUsers.length} staff
        </Badge>
      </div>
    </div>

    {branchUsers.length === 0 ? (
      <Card className='border-dashed border-2 border-gray-300'>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Users className='h-12 w-12 text-gray-400 mb-4' />
          <p className='text-gray-500 font-medium'>
            No staff assigned to this branch
          </p>
          <p className='text-sm text-gray-400'>
            Invite employees to get started
          </p>
        </CardContent>
      </Card>
    ) : (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {branchUsers.map(user => (
          <DesktopStaffCard
            key={user.id}
            user={user}
            branch={branch}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )}
  </div>
);

export default function StaffManagement() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { error, handleError, clearError } = useErrorHandler();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'branches' | 'schedule'>(
    'cards',
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Memoized filtered users - now filtered by selected branch
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch =
        selectedBranch === 'all' || user.branchId === selectedBranch;
      const matchesRole =
        selectedRole === 'all' ||
        user.role.toLowerCase() === selectedRole.toLowerCase();

      return matchesSearch && matchesBranch && matchesRole;
    });
  }, [users, searchTerm, selectedBranch, selectedRole]);

  // Memoized users by branch - only show selected branch if not 'all'
  const usersByBranch = useMemo(() => {
    if (selectedBranch === 'all') {
      return branches.map(branch => ({
        ...branch,
        users: users.filter(user => user.branchId === branch.id),
      }));
    } else {
      const selectedBranchData = branches.find(b => b.id === selectedBranch);
      if (selectedBranchData) {
        return [
          {
            ...selectedBranchData,
            users: users.filter(user => user.branchId === selectedBranch),
          },
        ];
      }
      return [];
    }
  }, [branches, users, selectedBranch]);

  // Fetch data with error handling
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleError(
          new Error('Authentication token not found. Please log in again.'),
        );
        setLoading(false);
        return;
      }

      const decodedToken: DecodedToken = jwtDecode(token);
      const [branchesResponse, usersResponse] = await Promise.all([
        fetch('/api/branches?companyId=' + decodedToken.companyId),
        fetch('/api/users?companyId=' + decodedToken.companyId),
      ]);

      if (!branchesResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const branchesData = await branchesResponse.json();
      const usersData = await usersResponse.json();

      setBranches(branchesData);
      setUsers(usersData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      handleError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to remove this staff member?'))
        return;

      try {
        // Implement delete API call here
        setUsers(prev => prev.filter(user => user.id !== id));
        toast({
          title: 'Success',
          description: 'Staff member removed successfully',
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to remove staff member',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handleUserUpdated = useCallback(
    (updatedUser: User) => {
      setUsers(prev =>
        prev.map(user => (user.id === updatedUser.id ? updatedUser : user)),
      );
      setEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: 'Success',
        description: 'Staff member updated successfully',
      });
    },
    [toast],
  );

  // Statistics - now branch-specific
  const stats = useMemo(() => {
    const relevantUsers =
      selectedBranch === 'all'
        ? users
        : users.filter(user => user.branchId === selectedBranch);

    const totalStaff = relevantUsers.length;
    const activeStaff = relevantUsers.filter(u => u.status === 'active').length;
    const avgPerformance =
      relevantUsers.length > 0
        ? (
          relevantUsers.reduce((sum, u) => sum + (u.performance || 0), 0) /
            relevantUsers.filter(u => u.performance).length
        ).toFixed(1)
        : '0.0';
    const branchesWithStaff =
      selectedBranch === 'all'
        ? branches.filter(b => users.some(u => u.branchId === b.id)).length
        : 1;

    return { totalStaff, activeStaff, avgPerformance, branchesWithStaff };
  }, [users, branches, selectedBranch]);

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
            Staff Management
          </h1>
          <p className='text-slate-600 mt-1'>
            Manage your restaurant team across all locations
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <a
            href='/owner/staffs/attendance'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button variant='outline'>
              <Activity className='h-4 w-4 mr-2' />
              View Reports
            </Button>
          </a>
          <Link href='/register'>
            <Button className='flex items-center gap-2'>
              <UserPlus className='h-4 w-4' />
              Invite Employee
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-600'>
                  Total Staff
                </p>
                <p className='text-2xl font-bold text-slate-900'>
                  {stats.totalStaff}
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
                  Active Staff
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {stats.activeStaff}
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
                  Avg Performance
                </p>
                <p className='text-2xl font-bold text-yellow-600'>
                  {stats.avgPerformance}
                </p>
              </div>
              <Star className='h-8 w-8 text-yellow-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-600'>
                  Active Branches
                </p>
                <p className='text-2xl font-bold text-purple-600'>
                  {stats.branchesWithStaff}
                </p>
              </div>
              <Building2 className='h-8 w-8 text-purple-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Role' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Roles</SelectItem>
              <SelectItem value='manager'>Manager</SelectItem>
              <SelectItem value='chef'>Chef</SelectItem>
              <SelectItem value='waiter'>Waiter</SelectItem>
              <SelectItem value='barista'>Barista</SelectItem>
              <SelectItem value='cashier'>Cashier</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex border rounded-md'>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('cards')}
              className='rounded-r-none'
            >
              <Grid className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'branches' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('branches')}
              className='rounded-none'
            >
              <Building2 className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'schedule' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('schedule')}
              className='rounded-l-none'
            >
              <Calendar className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'schedule' ? (
        <ShiftTimetable />
      ) : viewMode === 'cards' ? (
        <div>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-slate-900'>
              All Staff
              <span className='text-slate-500 ml-2'>
                ({filteredUsers.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {Array.from({ length: 8 }).map((_, i) => (
                <StaffSkeleton key={i} />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-16'>
                <Users className='h-16 w-16 text-slate-400 mb-4' />
                <h3 className='text-lg font-medium text-slate-900 mb-2'>
                  No staff members found
                </h3>
                <p className='text-slate-500 mb-6 text-center'>
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Start by inviting your first employee'}
                </p>
                <Link href='/register'>
                  <Button>
                    <UserPlus className='h-4 w-4 mr-2' />
                    Invite First Employee
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredUsers.map(user => {
                const branch = branches.find(b => b.id === user.branchId);
                return isMobile ? (
                  <MobileStaffCard
                    key={user.id}
                    user={user}
                    branch={branch}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <DesktopStaffCard
                    key={user.id}
                    user={user}
                    branch={branch}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          {usersByBranch.map(branch => (
            <BranchSection
              key={branch.id}
              branch={branch}
              users={branch.users}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className='space-y-4'>
              <div className='text-center'>
                <Avatar className='h-16 w-16 mx-auto mb-4'>
                  <AvatarImage
                    src={selectedUser.avatar || '/placeholder.svg'}
                    alt={selectedUser.fullname}
                  />
                  <AvatarFallback className='bg-white text-gray-700 font-semibold'>
                    {getInitials(selectedUser.fullname)}
                  </AvatarFallback>
                </Avatar>
                <h3 className='font-semibold text-gray-900'>
                  {selectedUser.fullname}
                </h3>
                <p className='text-sm text-gray-600'>{selectedUser.email}</p>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>Role: {selectedUser.role}</p>
                <p className='text-sm font-medium'>
                  Status: {selectedUser.status}
                </p>
                {selectedUser.phone && (
                  <p className='text-sm font-medium'>
                    Phone: {selectedUser.phone}
                  </p>
                )}
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' className='flex-1'>
                  View Details
                </Button>
                <Button className='flex-1'>Update</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
