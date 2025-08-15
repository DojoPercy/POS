'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface User {
  id: string;
  fullname: string;
  email: string;
  role: string;
  status: string;
  branchId?: string;
  companyId?: string;
  phone?: string;
  createdAt?: string;
  branch?: {
    id: string;
    name: string;
  };
}

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  companyId?: string;
  [key: string]: any;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      setDecodedToken(decoded);
      if (decoded.companyId) {
        fetchUsers(decoded.companyId);
      } else {
        setError('Invalid authentication token');
        setLoading(false);
      }
    } catch (err) {
      setError('Invalid authentication token');
      setLoading(false);
    }
  }, [router]);

  const fetchUsers = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users?companyId=${companyId}`);
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.put(`/api/users/${userId}`, { status: newStatus });
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      toast({
        title: 'Success',
        description: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description:
          err.response?.data?.error || 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'waiter':
        return 'bg-green-100 text-green-800';
      case 'kitchen':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircle className='h-4 w-4 text-green-600' />
    ) : (
      <XCircle className='h-4 w-4 text-red-600' />
    );
  };

  if (error) {
    return (
      <div className='container mx-auto py-10 px-4'>
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-10 px-4'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>User Management</h1>
          <p className='text-gray-600 mt-1'>
            Manage your restaurant staff and team members
          </p>
        </div>

        <div className='flex gap-2'>
          <Button
            onClick={() => router.push('/register')}
            className='flex items-center gap-2'
          >
            <UserPlus className='h-4 w-4' />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Users</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {users.length}
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
                <p className='text-sm font-medium text-gray-600'>
                  Active Users
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Managers</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {users.filter(u => u.role === 'manager').length}
                </p>
              </div>
              <Shield className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Waiters</p>
                <p className='text-2xl font-bold text-green-600'>
                  {users.filter(u => u.role === 'waiter').length}
                </p>
              </div>
              <Users className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex flex-col lg:flex-row gap-4 mb-6'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search users...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        <div className='flex gap-2'>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Role' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Roles</SelectItem>
              <SelectItem value='owner'>Owner</SelectItem>
              <SelectItem value='manager'>Manager</SelectItem>
              <SelectItem value='waiter'>Waiter</SelectItem>
              <SelectItem value='kitchen'>Kitchen</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='flex items-center space-x-4'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div className='space-y-2 flex-1'>
                    <Skeleton className='h-4 w-[200px]' />
                    <Skeleton className='h-4 w-[150px]' />
                  </div>
                  <Skeleton className='h-8 w-[100px]' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <Users className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No users found
            </h3>
            <p className='text-gray-600 mb-4'>
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first team member'}
            </p>
            {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
              <Button onClick={() => router.push('/register')}>
                <UserPlus className='h-4 w-4 mr-2' />
                Add First User
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {filteredUsers.map(user => (
            <Card key={user.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <Avatar className='h-12 w-12'>
                      <AvatarFallback className='bg-blue-100 text-blue-600 font-semibold'>
                        {user.fullname
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-semibold text-gray-900'>
                          {user.fullname}
                        </h3>
                        {getStatusIcon(user.status)}
                      </div>
                      <div className='flex items-center gap-4 text-sm text-gray-600 mt-1'>
                        <span className='flex items-center gap-1'>
                          <Mail className='h-3 w-3' />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className='flex items-center gap-1'>
                            <Phone className='h-3 w-3' />
                            {user.phone}
                          </span>
                        )}
                        {user.createdAt && (
                          <span className='flex items-center gap-1'>
                            <Calendar className='h-3 w-3' />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>

                    {user.branch && (
                      <div className='flex items-center gap-1 text-sm text-gray-600'>
                        <Building2 className='h-3 w-3' />
                        {user.branch.name}
                      </div>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                        >
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/register?edit=${user.id}`)
                          }
                        >
                          <Edit className='h-4 w-4 mr-2' />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusToggle(user.id, user.status)
                          }
                        >
                          {user.status === 'active' ? (
                            <>
                              <XCircle className='h-4 w-4 mr-2' />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className='h-4 w-4 mr-2' />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className='text-red-600'
                        >
                          <Trash2 className='h-4 w-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
