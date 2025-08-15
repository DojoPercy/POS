'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/use-notifications';
import { format } from 'date-fns';
import {
  Bell,
  Plus,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit,
  Eye,
  Building2,
  User,
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { NotificationTest } from '@/components/notification-test';

// Force dynamic rendering to prevent SSR issues with localStorage
export const dynamic = 'force-dynamic';

interface DecodedToken {
  userId: string;
  companyId: string;
  branchId?: string;
}

interface Branch {
  id: string;
  name: string;
  status: string;
}

interface User {
  id: string;
  fullname: string;
  role: string;
  branchId?: string;
}

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const priorityIcons = {
  LOW: Info,
  MEDIUM: AlertCircle,
  HIGH: AlertTriangle,
  URGENT: AlertTriangle,
};

const typeLabels = {
  COMPANY: 'Company',
  BRANCH: 'Branch',
  USER: 'Personal',
};

export default function NotificationsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedType, setSelectedType] = useState<
    'COMPANY' | 'BRANCH' | 'USER'
  >('COMPANY');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<
    'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  >('MEDIUM');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    expiresAt: '',
  });

  const { toast } = useToast();
  const { notifications, loading, createNotification, deleteNotification } =
    useNotifications();

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    return jwtDecode<DecodedToken>(token);
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const decodedToken = getToken();
      if (!decodedToken) {
        return;
      }
      const response = await fetch(
        `/api/branches?companyId=${decodedToken.companyId}`
      );
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  }, [getToken]);

  const fetchUsers = useCallback(async () => {
    try {
      const decodedToken = getToken();
      if (!decodedToken) {
        return;
      }
      const response = await fetch(
        `/api/users?companyId=${decodedToken.companyId}`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, [getToken]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchBranches();
      fetchUsers();
    }
  }, [fetchBranches, fetchUsers]);

  const handleCreateNotification = async () => {
    try {
      if (!formData.title || !formData.message) {
        toast({
          title: 'Error',
          description: 'Title and message are required',
          variant: 'destructive',
        });
        return;
      }

      const decodedToken = getToken();
      if (!decodedToken) {
        toast({
          title: 'Error',
          description: 'Authentication required',
          variant: 'destructive',
        });
        return;
      }
      const notificationData: any = {
        title: formData.title,
        message: formData.message,
        type: selectedType,
        priority: selectedPriority,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt)
          : undefined,
      };

      // Add appropriate IDs based on type
      if (selectedType === 'COMPANY') {
        notificationData.companyId = decodedToken.companyId;
      } else if (selectedType === 'BRANCH') {
        if (!selectedBranch) {
          toast({
            title: 'Error',
            description: 'Please select a branch',
            variant: 'destructive',
          });
          return;
        }
        notificationData.branchId = selectedBranch;
      } else if (selectedType === 'USER') {
        if (!selectedUser) {
          toast({
            title: 'Error',
            description: 'Please select a user',
            variant: 'destructive',
          });
          return;
        }
        notificationData.userId = selectedUser;
      }

      await createNotification(notificationData);

      // Reset form
      setFormData({ title: '', message: '', expiresAt: '' });
      setSelectedType('COMPANY');
      setSelectedBranch('');
      setSelectedUser('');
      setSelectedPriority('MEDIUM');
      setIsCreateDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Notification created successfully',
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      toast({
        title: 'Success',
        description: 'Notification deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleViewNotification = (notification: any) => {
    setSelectedNotification(notification);
    setIsViewDialogOpen(true);
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    urgent: notifications.filter(n => n.priority === 'URGENT').length,
    company: notifications.filter(n => n.type === 'COMPANY').length,
    branch: notifications.filter(n => n.type === 'BRANCH').length,
    user: notifications.filter(n => n.type === 'USER').length,
  };

  const columns = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }: any) => (
        <div className='flex items-center gap-2'>
          <div
            className={`p-1 rounded-full ${row.original.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}
          >
            {React.createElement(
              priorityIcons[
                row.original.priority as keyof typeof priorityIcons
              ],
              {
                className: `h-3 w-3 ${row.original.isRead ? 'text-gray-600' : 'text-blue-600'}`,
              }
            )}
          </div>
          <span
            className={`font-medium ${row.original.isRead ? 'text-gray-700' : 'text-gray-900'}`}
          >
            {row.original.title}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant='outline' className='text-xs'>
          {typeLabels[row.original.type as keyof typeof typeLabels]}
        </Badge>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => (
        <Badge
          variant='secondary'
          className={`text-xs ${priorityColors[row.original.priority as keyof typeof priorityColors]}`}
        >
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: 'isRead',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge
          variant={row.original.isRead ? 'secondary' : 'default'}
          className='text-xs'
        >
          {row.original.isRead ? 'Read' : 'Unread'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: any) =>
        format(new Date(row.original.createdAt), 'MMM d, h:mm a'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleViewNotification(row.original)}
            className='h-6 w-6 p-0'
          >
            <Eye className='h-3 w-3' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleDeleteNotification(row.original.id)}
            className='h-6 w-6 p-0 text-red-500 hover:text-red-700'
          >
            <Trash2 className='h-3 w-3' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Notifications</h1>
          <p className='text-gray-600'>
            Manage and create notifications for your business
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className='flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          Create Notification
        </Button>
      </div>

      {/* Notification Test Component */}
      {getToken() && <NotificationTest companyId={getToken()!.companyId} />}

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Bell className='h-4 w-4 text-blue-500' />
              <span className='text-sm font-medium'>Total Notifications</span>
            </div>
            <p className='text-2xl font-bold mt-2'>{notifications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-4 w-4 text-red-500' />
              <span className='text-sm font-medium'>Unread</span>
            </div>
            <p className='text-2xl font-bold mt-2'>{stats.unread}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4 text-orange-500' />
              <span className='text-sm font-medium'>High Priority</span>
            </div>
            <p className='text-2xl font-bold mt-2'>{stats.urgent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Building2 className='h-4 w-4 text-green-500' />
              <span className='text-sm font-medium'>Company-wide</span>
            </div>
            <p className='text-2xl font-bold mt-2'>{stats.company}</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            View and manage all notifications in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={notifications} />
        </CardContent>
      </Card>

      {/* View Notification Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <div
                  className={`p-2 rounded-full ${selectedNotification.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}
                >
                  {React.createElement(
                    priorityIcons[
                      selectedNotification.priority as keyof typeof priorityIcons
                    ],
                    {
                      className: `h-4 w-4 ${selectedNotification.isRead ? 'text-gray-600' : 'text-blue-600'}`,
                    }
                  )}
                </div>
                <div>
                  <h3 className='font-medium'>{selectedNotification.title}</h3>
                  <div className='flex items-center gap-2 mt-1'>
                    <Badge
                      variant='secondary'
                      className={`text-xs ${priorityColors[selectedNotification.priority as keyof typeof priorityColors]}`}
                    >
                      {selectedNotification.priority}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      {
                        typeLabels[
                          selectedNotification.type as keyof typeof typeLabels
                        ]
                      }
                    </Badge>
                    <Badge
                      variant={
                        selectedNotification.isRead ? 'secondary' : 'default'
                      }
                      className='text-xs'
                    >
                      {selectedNotification.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Message
                </label>
                <p className='mt-1 text-sm text-gray-600'>
                  {selectedNotification.message}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <label className='font-medium text-gray-700'>Created</label>
                  <p className='text-gray-600'>
                    {format(
                      new Date(selectedNotification.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                {selectedNotification.expiresAt && (
                  <div>
                    <label className='font-medium text-gray-700'>Expires</label>
                    <p className='text-gray-600'>
                      {format(
                        new Date(selectedNotification.expiresAt),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                )}
              </div>

              {selectedNotification.company && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Company
                  </label>
                  <p className='text-gray-600'>
                    {selectedNotification.company.name}
                  </p>
                </div>
              )}

              {selectedNotification.branch && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Branch
                  </label>
                  <p className='text-gray-600'>
                    {selectedNotification.branch.name}
                  </p>
                </div>
              )}

              {selectedNotification.user && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    User
                  </label>
                  <p className='text-gray-600'>
                    {selectedNotification.user.fullname}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Notification Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
            <DialogDescription>
              Create a notification to send to your team members.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium'>Type</label>
                <Select
                  value={selectedType}
                  onValueChange={(value: any) => setSelectedType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='COMPANY'>Company-wide</SelectItem>
                    <SelectItem value='BRANCH'>Branch-specific</SelectItem>
                    <SelectItem value='USER'>User-specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='text-sm font-medium'>Priority</label>
                <Select
                  value={selectedPriority}
                  onValueChange={(value: any) => setSelectedPriority(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='LOW'>Low</SelectItem>
                    <SelectItem value='MEDIUM'>Medium</SelectItem>
                    <SelectItem value='HIGH'>High</SelectItem>
                    <SelectItem value='URGENT'>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedType === 'BRANCH' && (
              <div>
                <label className='text-sm font-medium'>Branch</label>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a branch' />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedType === 'USER' && (
              <div>
                <label className='text-sm font-medium'>User</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a user' />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullname} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className='text-sm font-medium'>Title</label>
              <Input
                value={formData.title}
                onChange={e =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder='Enter notification title'
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Message</label>
              <Textarea
                value={formData.message}
                onChange={e =>
                  setFormData(prev => ({ ...prev, message: e.target.value }))
                }
                placeholder='Enter notification message'
                rows={4}
              />
            </div>

            <div>
              <label className='text-sm font-medium'>
                Expires At (Optional)
              </label>
              <Input
                type='datetime-local'
                value={formData.expiresAt}
                onChange={e =>
                  setFormData(prev => ({ ...prev, expiresAt: e.target.value }))
                }
              />
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateNotification}>
              Create Notification
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
