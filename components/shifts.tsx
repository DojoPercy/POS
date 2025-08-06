'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO,
} from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import {
  Draggable,
  Droppable,
  DragDropContext,
  DropResult,
} from '@hello-pangea/dnd';

interface Branch {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  userId: string;
  branchId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  role: string;
  notes?: string;
  user: {
    id: string;
    fullname: string;
    email: string;
    role: string;
  };
  branch: {
    id: string;
    name: string;
  };
}

interface DecodedToken {
  companyId: string;
  userId: string;
}

const statusColors = {
  SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  NO_SHOW: 'bg-orange-100 text-orange-800 border-orange-200',
};

const statusIcons = {
  SCHEDULED: <Clock className='h-3 w-3' />,
  IN_PROGRESS: <PlayCircle className='h-3 w-3' />,
  COMPLETED: <CheckCircle className='h-3 w-3' />,
  CANCELLED: <XCircle className='h-3 w-3' />,
  NO_SHOW: <XCircle className='h-3 w-3' />,
};

const roleColors = {
  manager: 'bg-purple-500',
  waiter: 'bg-blue-500',
  chef: 'bg-orange-500',
  barista: 'bg-green-500',
  cashier: 'bg-pink-500',
  default: 'bg-gray-500',
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function ShiftScheduler() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<
    { id: string; fullname: string; email: string; role: string }[]
  >([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string>('');

  // Form state for creating shifts
  const [newShift, setNewShift] = useState({
    userId: '',
    branchId: '',
    title: '',
    startTime: '',
    endTime: '',
    role: '',
    notes: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setCompanyId(decoded.companyId);
      fetchData(decoded.companyId);
    }
  }, []);

  const fetchData = async (companyId: string) => {
    try {
      setLoading(true);
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

      const [shiftsResponse, usersResponse, branchesResponse] =
        await Promise.all([
          fetch(
            `/api/shifts?companyId=${companyId}&startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`,
          ),
          fetch(`/api/users?companyId=${companyId}`),
          fetch(`/api/branches?companyId=${companyId}`),
        ]);

      const [shiftsData, usersData, branchesData] = await Promise.all([
        shiftsResponse.json(),
        usersResponse.json(),
        branchesResponse.json(),
      ]);

      setShifts(shiftsData);
      setUsers(usersData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Shift['status'];

    try {
      const response = await fetch(`/api/shifts/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedShift = await response.json();
        setShifts(prev =>
          prev.map(shift => (shift.id === draggableId ? updatedShift : shift)),
        );
      }
    } catch (error) {
      console.error('Error updating shift status:', error);
    }
  };

  const handleCreateShift = async () => {
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newShift,
          companyId,
        }),
      });

      if (response.ok) {
        const createdShift = await response.json();
        setShifts(prev => [...prev, createdShift]);
        setIsCreateDialogOpen(false);
        setNewShift({
          userId: '',
          branchId: '',
          title: '',
          startTime: '',
          endTime: '',
          role: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error creating shift:', error);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShifts(prev => prev.filter(shift => shift.id !== shiftId));
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getShiftsForDay = (date: Date) => {
    return shifts.filter(shift => {
      const shiftDate = parseISO(shift.startTime);
      return isSameDay(shiftDate, date);
    });
  };

  const filteredShifts = shifts.filter(shift => {
    const matchesBranch =
      selectedBranch === 'all' || shift.branchId === selectedBranch;
    const matchesRole =
      selectedRole === 'all' ||
      shift.role.toLowerCase() === selectedRole.toLowerCase();
    return matchesBranch && matchesRole;
  });

  const groupedShifts = {
    SCHEDULED: filteredShifts.filter(s => s.status === 'SCHEDULED'),
    IN_PROGRESS: filteredShifts.filter(s => s.status === 'IN_PROGRESS'),
    COMPLETED: filteredShifts.filter(s => s.status === 'COMPLETED'),
    CANCELLED: filteredShifts.filter(s => s.status === 'CANCELLED'),
    NO_SHOW: filteredShifts.filter(s => s.status === 'NO_SHOW'),
  };

  const ShiftCard = ({ shift, index }: { shift: Shift; index: number }) => (
    <Draggable draggableId={shift.id} index={index}>
      {(provided: any, snapshot: any) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 cursor-move transition-all duration-200 ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'
          }`}
        >
          <CardContent className='p-4'>
            <div className='flex items-start justify-between mb-3'>
              <div className='flex items-center space-x-2'>
                <Avatar className='h-8 w-8'>
                  <AvatarFallback
                    className={`text-white text-xs ${roleColors[shift.role.toLowerCase() as keyof typeof roleColors] || roleColors.default}`}
                  >
                    {getInitials(shift.user.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium text-sm'>{shift.user.fullname}</p>
                  <p className='text-xs text-gray-500 capitalize'>
                    {shift.role}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-6 w-6'>
                    <MoreVertical className='h-3 w-3' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>
                    <Edit className='h-3 w-3 mr-2' />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-red-600'
                    onClick={() => handleDeleteShift(shift.id)}
                  >
                    <Trash2 className='h-3 w-3 mr-2' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className='space-y-2'>
              <p className='font-medium text-sm'>{shift.title}</p>
              <div className='flex items-center text-xs text-gray-600'>
                <Clock className='h-3 w-3 mr-1' />
                {format(parseISO(shift.startTime), 'HH:mm')} -{' '}
                {format(parseISO(shift.endTime), 'HH:mm')}
              </div>
              <p className='text-xs text-gray-500'>{shift.branch.name}</p>
              {shift.notes && (
                <p className='text-xs text-gray-600 bg-gray-50 p-2 rounded'>
                  {shift.notes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  const StatusColumn = ({
    status,
    title,
    shifts,
  }: {
    status: string;
    title: string;
    shifts: Shift[];
  }) => (
    <div className='flex-1 min-w-[280px]'>
      <div className='mb-4'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='font-semibold text-gray-900 flex items-center gap-2'>
            {statusIcons[status as keyof typeof statusIcons]}
            {title}
          </h3>
          <Badge variant='outline' className='text-xs'>
            {shifts.length}
          </Badge>
        </div>
      </div>

      <Droppable droppableId={status}>
        {(provided: any, snapshot: any) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[400px] p-3 rounded-lg border-2 border-dashed transition-colors ${
              snapshot.isDraggingOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            {shifts.map((shift, index) => (
              <ShiftCard key={shift.id} shift={shift} index={index} />
            ))}
            {provided.placeholder}
            {shifts.length === 0 && (
              <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
                <Users className='h-8 w-8 mb-2' />
                <p className='text-sm'>No {title.toLowerCase()} shifts</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );

  if (loading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='grid grid-cols-5 gap-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='space-y-3'>
                <div className='h-6 bg-gray-200 rounded'></div>
                <div className='space-y-2'>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className='h-20 bg-gray-200 rounded'></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Shift Scheduler</h1>
          <p className='text-gray-600'>
            Manage staff schedules across all locations
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className='w-48'>
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

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className='w-32'>
              <SelectValue placeholder='All Roles' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Roles</SelectItem>
              <SelectItem value='manager'>Manager</SelectItem>
              <SelectItem value='waiter'>Waiter</SelectItem>
              <SelectItem value='chef'>Chef</SelectItem>
              <SelectItem value='barista'>Barista</SelectItem>
              <SelectItem value='cashier'>Cashier</SelectItem>
            </SelectContent>
          </Select>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className='bg-orange-500 hover:bg-orange-600'>
                <Plus className='h-4 w-4 mr-2' />
                Add Shift
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='user'>Employee</Label>
                  <Select
                    value={newShift.userId}
                    onValueChange={value =>
                      setNewShift(prev => ({ ...prev, userId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select employee' />
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

                <div>
                  <Label htmlFor='branch'>Branch</Label>
                  <Select
                    value={newShift.branchId}
                    onValueChange={value =>
                      setNewShift(prev => ({ ...prev, branchId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select branch' />
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

                <div>
                  <Label htmlFor='title'>Shift Title</Label>
                  <Input
                    id='title'
                    value={newShift.title}
                    onChange={e =>
                      setNewShift(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder='e.g., Morning Shift'
                  />
                </div>

                <div>
                  <Label htmlFor='role'>Role</Label>
                  <Select
                    value={newShift.role}
                    onValueChange={value =>
                      setNewShift(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='manager'>Manager</SelectItem>
                      <SelectItem value='waiter'>Waiter</SelectItem>
                      <SelectItem value='chef'>Chef</SelectItem>
                      <SelectItem value='barista'>Barista</SelectItem>
                      <SelectItem value='cashier'>Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='startTime'>Start Time</Label>
                    <Input
                      id='startTime'
                      type='datetime-local'
                      value={newShift.startTime}
                      onChange={e =>
                        setNewShift(prev => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='endTime'>End Time</Label>
                    <Input
                      id='endTime'
                      type='datetime-local'
                      value={newShift.endTime}
                      onChange={e =>
                        setNewShift(prev => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor='notes'>Notes (Optional)</Label>
                  <Textarea
                    id='notes'
                    value={newShift.notes}
                    onChange={e =>
                      setNewShift(prev => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder='Additional notes...'
                    rows={3}
                  />
                </div>

                <Button onClick={handleCreateShift} className='w-full'>
                  Create Shift
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentWeek(prev => addDays(prev, -7))}
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              Previous Week
            </Button>

            <div className='text-center'>
              <h2 className='font-semibold text-lg'>
                {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d')}{' '}
                -{' '}
                {format(
                  endOfWeek(currentWeek, { weekStartsOn: 1 }),
                  'MMM d, yyyy',
                )}
              </h2>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentWeek(prev => addDays(prev, 7))}
            >
              Next Week
              <ChevronRight className='h-4 w-4 ml-1' />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className='flex gap-6 overflow-x-auto pb-4'>
          <StatusColumn
            status='SCHEDULED'
            title='Scheduled'
            shifts={groupedShifts.SCHEDULED}
          />
          <StatusColumn
            status='IN_PROGRESS'
            title='In Progress'
            shifts={groupedShifts.IN_PROGRESS}
          />
          <StatusColumn
            status='COMPLETED'
            title='Completed'
            shifts={groupedShifts.COMPLETED}
          />
          <StatusColumn
            status='CANCELLED'
            title='Cancelled'
            shifts={groupedShifts.CANCELLED}
          />
          <StatusColumn
            status='NO_SHOW'
            title='No Show'
            shifts={groupedShifts.NO_SHOW}
          />
        </div>
      </DragDropContext>

      {/* Weekly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Weekly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-7 gap-4'>
            {getWeekDays().map(day => {
              const dayShifts = getShiftsForDay(day);
              return (
                <div key={day.toISOString()} className='space-y-2'>
                  <div className='text-center'>
                    <p className='font-medium text-sm'>{format(day, 'EEE')}</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {format(day, 'd')}
                    </p>
                  </div>
                  <div className='space-y-1 min-h-[100px]'>
                    {dayShifts.slice(0, 3).map(shift => (
                      <div
                        key={shift.id}
                        className={`p-2 rounded text-xs border ${statusColors[shift.status]}`}
                      >
                        <p className='font-medium truncate'>
                          {shift.user.fullname}
                        </p>
                        <p className='text-xs opacity-75'>
                          {format(parseISO(shift.startTime), 'HH:mm')} -{' '}
                          {format(parseISO(shift.endTime), 'HH:mm')}
                        </p>
                      </div>
                    ))}
                    {dayShifts.length > 3 && (
                      <div className='text-xs text-gray-500 text-center py-1'>
                        +{dayShifts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
