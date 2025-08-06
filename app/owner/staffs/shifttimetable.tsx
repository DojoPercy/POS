'use client';

import { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Users,
  Settings,
  Trash2,
  Edit,
  MoreVertical,
  Calendar,
  Clock,
  MapPin,
  Star,
  Circle,
  Play,
  CheckCircle,
  Coffee,
  ChevronLeft,
  ChevronRight,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  fullname: string;
  status: string;
  email: string;
  role: string;
  branchId: string | null;
}

interface Branch {
  id: string;
  name: string;
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
  color: string;
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

interface ShiftTemplate {
  id: string;
  name: string;
  branchId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  role: string;
  maxStaff: number;
  branch: {
    id: string;
    name: string;
  };
}

interface DecodedToken {
  companyId: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 0, label: 'Sunday', short: 'Sun' },
];

const TIME_SLOTS = [
  { start: '06:00', end: '10:00', label: 'Early Morning' },
  { start: '10:00', end: '14:00', label: 'Morning' },
  { start: '14:00', end: '18:00', label: 'Afternoon' },
  { start: '18:00', end: '22:00', label: 'Evening' },
  { start: '22:00', end: '02:00', label: 'Night' },
];

const roleColors = {
  manager: 'bg-purple-100 text-purple-800 border-purple-200',
  waiter: 'bg-blue-100 text-blue-800 border-blue-200',
  chef: 'bg-orange-100 text-orange-800 border-orange-200',
  barista: 'bg-green-100 text-green-800 border-green-200',
  cashier: 'bg-pink-100 text-pink-800 border-pink-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200',
};

const shiftStateConfig = {
  INACTIVE: {
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    badge: 'bg-gray-100 text-gray-600',
    icon: <Circle className='h-3 w-3 text-gray-500' />,
    label: 'Inactive',
  },
  ACTIVE: {
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    badge: 'bg-blue-100 text-blue-700',
    icon: <Play className='h-3 w-3 text-blue-600' />,
    label: 'Active',
  },
  ASSIST: {
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: <Star className='h-3 w-3 text-yellow-600' />,
    label: 'Assist',
  },
  BREAK: {
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    badge: 'bg-orange-100 text-orange-700',
    icon: <Coffee className='h-3 w-3 text-orange-600' />,
    label: 'Break',
  },
  COMPLETED: {
    color: 'bg-green-50 border-green-200 text-green-800',
    badge: 'bg-green-100 text-green-700',
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

export default function EnhancedShiftTimetable() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [companyId, setCompanyId] = useState<string>('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1); // For mobile view
  const [showStaffPanel, setShowStaffPanel] = useState(false); // For mobile toggle

  // Template creation form
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    branchId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    role: '',
    maxStaff: '1',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setCompanyId(decoded.companyId);
      fetchData(decoded.companyId);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchData(companyId);
    }
  }, [selectedBranch, companyId]);

  const fetchData = async (companyId: string) => {
    try {
      setLoading(true);
      const [
        usersResponse,
        branchesResponse,
        shiftsResponse,
        templatesResponse,
      ] = await Promise.all([
        fetch(`/api/users?companyId=${companyId}`),
        fetch(`/api/branches?companyId=${companyId}`),
        fetch(`/api/shift?companyId=${companyId}&branchId=${selectedBranch}`),
        fetch(
          `/api/shift-templates?companyId=${companyId}&branchId=${selectedBranch}`,
        ),
      ]);

      const responses = [
        usersResponse,
        branchesResponse,
        shiftsResponse,
        templatesResponse,
      ];
      responses.forEach((res, i) => {
        if (!res.ok)
          throw new Error(`Request ${i + 1} failed with status ${res.status}`);
      });

      const [usersData, branchesData, shiftsData, templatesData] =
        await Promise.all([
          usersResponse.json(),
          branchesResponse.json(),
          shiftsResponse.json(),
          templatesResponse.json(),
        ]);

      setUsers(usersData.filter((user: User) => user.status === 'active'));
      setBranches(branchesData);
      setShifts(shiftsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const [dayOfWeek, timeSlot] = destination.droppableId.split('-');
    const userId = draggableId;
    const user = users.find(u => u.id === userId);

    if (!user) return;

    const [startTime, endTime] = timeSlot.split('_');
    const timeSlotData = TIME_SLOTS.find(
      slot => slot.start === startTime && slot.end === endTime,
    );

    if (!timeSlotData) return;

    try {
      const response = await fetch('/api/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          branchId: selectedBranch === 'all' ? user.branchId : selectedBranch,
          companyId,
          title: `${timeSlotData.label} Shift`,
          dayOfWeek: Number.parseInt(dayOfWeek),
          startTime,
          endTime,
          role: user.role,
          shiftState: 'INACTIVE',
          color: '#6B7280',
          notes: '',
        }),
      });

      if (response.ok) {
        const newShift = await response.json();
        setShifts(prev => [...prev, newShift]);
      }
    } catch (error) {
      console.error('Error creating shift:', error);
    }
  };

  const handleShiftStateChange = async (
    shiftId: string,
    newState: Shift['shiftState'],
  ) => {
    try {
      const response = await fetch(`/api/shift/${shiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftState: newState }),
      });

      if (response.ok) {
        const updatedShift = await response.json();
        setShifts(prev =>
          prev.map(shift => (shift.id === shiftId ? updatedShift : shift)),
        );
      }
    } catch (error) {
      console.error('Error updating shift state:', error);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/shift/${shiftId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShifts(prev => prev.filter(shift => shift.id !== shiftId));
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch('/api/shift-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTemplate,
          companyId,
        }),
      });

      if (response.ok) {
        const createdTemplate = await response.json();
        setTemplates(prev => [...prev, createdTemplate]);
        setIsTemplateDialogOpen(false);
        setNewTemplate({
          name: '',
          branchId: '',
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          role: '',
          maxStaff: '1',
        });
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const getShiftsForSlot = (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ) => {
    return shifts.filter(
      shift =>
        shift.dayOfWeek === dayOfWeek &&
        shift.startTime === startTime &&
        shift.endTime === endTime,
    );
  };

  const getTemplateForSlot = (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ) => {
    return templates.find(
      template =>
        template.dayOfWeek === dayOfWeek &&
        template.startTime === startTime &&
        template.endTime === endTime,
    );
  };

  const filteredUsers = users.filter(user => {
    if (selectedBranch === 'all') return true;
    return user.branchId === selectedBranch;
  });

  const StaffCard = ({ user, index }: { user: User; index: number }) => (
    <Draggable draggableId={user.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 cursor-move transition-all duration-300 ${
            snapshot.isDragging
              ? 'shadow-2xl rotate-2 scale-110 z-50'
              : 'hover:shadow-lg hover:scale-[1.02]'
          }`}
        >
          <div className='bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200'>
            <div className='flex items-center space-x-3'>
              <Avatar className='h-10 w-10 flex-shrink-0 ring-2 ring-gray-100 shadow-sm'>
                <AvatarFallback className='bg-gradient-to-br from-gray-600 to-gray-800 text-white text-sm font-bold'>
                  {getInitials(user.fullname)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='font-semibold text-sm text-gray-900 truncate mb-1'>
                  {user.fullname}
                </p>
                <Badge
                  variant='outline'
                  className={`text-xs font-medium border-0 shadow-sm ${
                    roleColors[
                      user.role.toLowerCase() as keyof typeof roleColors
                    ] || roleColors.default
                  }`}
                >
                  {user.role}
                </Badge>
              </div>
              <div className='flex-shrink-0'>
                <div className='w-2 h-2 bg-green-400 rounded-full shadow-sm'></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  const TimeSlot = ({
    day,
    timeSlot,
  }: {
    day: (typeof DAYS_OF_WEEK)[0];
    timeSlot: (typeof TIME_SLOTS)[0];
  }) => {
    const slotShifts = getShiftsForSlot(
      day.value,
      timeSlot.start,
      timeSlot.end,
    );
    const template = getTemplateForSlot(
      day.value,
      timeSlot.start,
      timeSlot.end,
    );
    const droppableId = `${day.value}-${timeSlot.start}_${timeSlot.end}`;

    return (
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[140px] p-3 rounded-xl border-2 border-dashed transition-all duration-300 ${
              snapshot.isDraggingOver
                ? 'border-blue-400 bg-blue-50 shadow-lg scale-[1.02]'
                : template
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
            }`}
          >
            {template && (
              <div className='mb-3 p-2 bg-emerald-100 rounded-lg text-xs text-emerald-800 font-medium border border-emerald-200'>
                <div className='flex items-center justify-between'>
                  <span className='truncate font-semibold'>
                    {template.name}
                  </span>
                  <span className='text-xs opacity-75 ml-2 flex-shrink-0 bg-emerald-200 px-2 py-1 rounded-full'>
                    Max: {template.maxStaff}
                  </span>
                </div>
              </div>
            )}

            <div className='space-y-3'>
              {slotShifts.map(shift => {
                const stateConfig = shiftStateConfig[shift.shiftState];
                return (
                  <div
                    key={shift.id}
                    className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${stateConfig.color} shadow-sm`}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-center space-x-3 flex-1 min-w-0'>
                        <Avatar className='h-8 w-8 flex-shrink-0 ring-2 ring-white shadow-sm'>
                          <AvatarFallback className='bg-gradient-to-br from-gray-600 to-gray-700 text-white text-xs font-bold'>
                            {getInitials(shift.user.fullname)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1'>
                          <p className='text-sm font-semibold text-gray-900 truncate'>
                            {shift.user.fullname}
                          </p>
                          <div className='flex items-center gap-2 mt-1'>
                            <Badge
                              variant='outline'
                              className={`text-xs font-medium ${stateConfig.badge} border-0 shadow-sm`}
                            >
                              <div className='flex items-center gap-1.5'>
                                {stateConfig.icon}
                                <span className='hidden sm:inline'>
                                  {stateConfig.label}
                                </span>
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7 flex-shrink-0 hover:bg-white/50'
                          >
                            <MoreVertical className='h-3.5 w-3.5' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align='end'
                          className='bg-white border shadow-xl rounded-xl'
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              handleShiftStateChange(shift.id, 'ACTIVE')
                            }
                          >
                            <Play className='h-3 w-3 mr-2 text-blue-600' />
                            Set Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleShiftStateChange(shift.id, 'ASSIST')
                            }
                          >
                            <Star className='h-3 w-3 mr-2 text-yellow-600' />
                            Set Assist
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleShiftStateChange(shift.id, 'BREAK')
                            }
                          >
                            <Coffee className='h-3 w-3 mr-2 text-orange-600' />
                            Set Break
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleShiftStateChange(shift.id, 'COMPLETED')
                            }
                          >
                            <CheckCircle className='h-3 w-3 mr-2 text-green-600' />
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleShiftStateChange(shift.id, 'INACTIVE')
                            }
                          >
                            <Circle className='h-3 w-3 mr-2 text-gray-600' />
                            Set Inactive
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className='h-3 w-3 mr-2' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => handleDeleteShift(shift.id)}
                          >
                            <Trash2 className='h-3 w-3 mr-2' />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className='flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50'>
                      <span className='capitalize truncate text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full'>
                        {shift.role}
                      </span>
                      <div className='flex items-center gap-1.5 flex-shrink-0 ml-2 text-gray-500'>
                        <Clock className='h-3 w-3' />
                        <span className='text-xs font-medium'>
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {provided.placeholder}

            {slotShifts.length === 0 && !snapshot.isDraggingOver && (
              <div className='flex items-center justify-center h-full text-gray-400 min-h-[100px]'>
                <div className='text-center'>
                  <Users className='h-8 w-8 mx-auto mb-2 opacity-40' />
                  <p className='text-sm font-medium opacity-60'>
                    Drop staff here
                  </p>
                  <p className='text-xs opacity-40 mt-1'>
                    {timeSlot.start} - {timeSlot.end}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>
    );
  };

  // Mobile Day Navigation
  const navigateDay = (direction: 'prev' | 'next') => {
    const currentIndex = DAYS_OF_WEEK.findIndex(
      day => day.value === selectedDay,
    );
    if (direction === 'prev') {
      const prevIndex =
        currentIndex === 0 ? DAYS_OF_WEEK.length - 1 : currentIndex - 1;
      setSelectedDay(DAYS_OF_WEEK[prevIndex].value);
    } else {
      const nextIndex =
        currentIndex === DAYS_OF_WEEK.length - 1 ? 0 : currentIndex + 1;
      setSelectedDay(DAYS_OF_WEEK[nextIndex].value);
    }
  };

  if (loading) {
    return (
      <div className='p-4 sm:p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/2 sm:w-1/4'></div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='h-24 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
      {/* Header */}
      <div className='flex flex-col space-y-4'>
        <div className='text-center lg:text-left'>
          <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-2'>
            Staff Scheduling
          </h1>
          <p className='text-gray-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0'>
            Drag and drop staff into time slots to create recurring schedules
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start'>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className='w-full sm:w-64 bg-white shadow-sm border-gray-200 rounded-xl'>
              <SelectValue placeholder='All Branches' />
            </SelectTrigger>
            <SelectContent className='bg-white rounded-xl shadow-xl border-0 ring-1 ring-gray-200'>
              <SelectItem value='all' className='rounded-lg'>
                All Branches
              </SelectItem>
              {branches.map(branch => (
                <SelectItem
                  key={branch.id}
                  value={branch.id}
                  className='rounded-lg'
                >
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-gray-500' />
                    {branch.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog
            open={isTemplateDialogOpen}
            onOpenChange={setIsTemplateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant='outline'
                className='bg-white shadow-sm border-gray-200 rounded-xl hover:shadow-md'
              >
                <Settings className='h-4 w-4 mr-2' />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md bg-white mx-4 rounded-xl shadow-2xl border-0 ring-1 ring-gray-200'>
              <DialogHeader>
                <DialogTitle>Create Shift Template</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='name'>Template Name</Label>
                  <Input
                    id='name'
                    value={newTemplate.name}
                    onChange={e =>
                      setNewTemplate(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder='e.g., Morning Shift'
                  />
                </div>

                <div>
                  <Label htmlFor='branch'>Branch</Label>
                  <Select
                    value={newTemplate.branchId}
                    onValueChange={value =>
                      setNewTemplate(prev => ({ ...prev, branchId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select branch' />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      {branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='dayOfWeek'>Day of Week</Label>
                  <Select
                    value={newTemplate.dayOfWeek}
                    onValueChange={value =>
                      setNewTemplate(prev => ({ ...prev, dayOfWeek: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select day' />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem
                          key={day.value}
                          value={day.value.toString()}
                        >
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='startTime'>Start Time</Label>
                    <Input
                      id='startTime'
                      type='time'
                      value={newTemplate.startTime}
                      onChange={e =>
                        setNewTemplate(prev => ({
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
                      type='time'
                      value={newTemplate.endTime}
                      onChange={e =>
                        setNewTemplate(prev => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor='role'>Required Role</Label>
                  <Select
                    value={newTemplate.role}
                    onValueChange={value =>
                      setNewTemplate(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      <SelectItem value='manager'>Manager</SelectItem>
                      <SelectItem value='waiter'>Waiter</SelectItem>
                      <SelectItem value='chef'>Chef</SelectItem>
                      <SelectItem value='barista'>Barista</SelectItem>
                      <SelectItem value='cashier'>Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='maxStaff'>Max Staff</Label>
                  <Input
                    id='maxStaff'
                    type='number'
                    min='1'
                    value={newTemplate.maxStaff}
                    onChange={e =>
                      setNewTemplate(prev => ({
                        ...prev,
                        maxStaff: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button onClick={handleCreateTemplate} className='w-full'>
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Mobile Staff Toggle */}
          <Button
            variant='outline'
            className='lg:hidden bg-white shadow-sm border-gray-200 rounded-xl hover:shadow-md'
            onClick={() => setShowStaffPanel(!showStaffPanel)}
          >
            <Users className='h-4 w-4 mr-2' />
            Staff ({filteredUsers.length})
          </Button>
        </div>
      </div>

      {/* Status Legend */}
      <Card className='bg-white'>
        <CardContent className='p-3 sm:p-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <h3 className='font-medium text-gray-900'>Shift Status</h3>
            <div className='flex flex-wrap items-center gap-3 sm:gap-4'>
              {Object.entries(shiftStateConfig).map(([state, config]) => (
                <div key={state} className='flex items-center gap-2'>
                  {config.icon}
                  <span className='text-xs sm:text-sm text-gray-700'>
                    {config.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Mobile Staff Panel Overlay */}
        {showStaffPanel && (
          <div
            className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
            onClick={() => setShowStaffPanel(false)}
          >
            <div className='fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 max-h-[70vh] overflow-hidden'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-gray-900'>Available Staff</h3>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowStaffPanel(false)}
                >
                  ✕
                </Button>
              </div>
              <Droppable droppableId='staff-pool-mobile'>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className='space-y-2 overflow-y-auto max-h-[50vh]'
                  >
                    {filteredUsers.map((user, index) => (
                      <StaffCard key={user.id} user={user} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        <div className='hidden lg:grid lg:grid-cols-4 gap-6'>
          {/* Desktop Staff Panel */}
          <div className='lg:col-span-1'>
            <Card className='sticky top-6 bg-white'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  Available Staff
                  <Badge variant='outline'>{filteredUsers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId='staff-pool'>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className='space-y-2 max-h-[600px] overflow-y-auto'
                    >
                      {filteredUsers.map((user, index) => (
                        <StaffCard key={user.id} user={user} index={index} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Timetable */}
          <div className='lg:col-span-3'>
            <Card className='bg-white shadow-sm border-0 ring-1 ring-gray-200'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-3 text-xl'>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <Calendar className='h-5 w-5 text-blue-600' />
                  </div>
                  Weekly Schedule
                  {selectedBranch !== 'all' && (
                    <Badge
                      variant='outline'
                      className='bg-blue-50 text-blue-700 border-blue-200'
                    >
                      {branches.find(b => b.id === selectedBranch)?.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='overflow-x-auto'>
                  {/* THIS IS THE KEY CHANGE */}
                  <div className='grid grid-cols-8 gap-4 min-w-[700px] lg:min-w-0'>
                    {/* Header Row */}
                    <div className='font-bold text-sm text-gray-700 p-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl text-center border'>
                      Time Slot
                    </div>
                    {DAYS_OF_WEEK.map(day => (
                      <div
                        key={day.value}
                        className='font-bold text-sm text-gray-700 p-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl text-center border'
                      >
                        <div>{day.short}</div>
                        <div className='text-xs text-gray-500 mt-1 font-normal'>
                          {day.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  {TIME_SLOTS.map((timeSlot, index) => (
                    <div
                      key={`${timeSlot.start}-${timeSlot.end}`}
                      className='grid grid-cols-8 gap-4 mb-6 min-w-[700px] lg:min-w-0'
                    >
                      <div className='p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border shadow-sm'>
                        <div className='text-sm font-bold text-gray-900 mb-1'>
                          {timeSlot.label}
                        </div>
                        <div className='text-xs text-gray-600 font-medium'>
                          {timeSlot.start} - {timeSlot.end}
                        </div>
                        <div className='text-xs text-gray-400 mt-2'>
                          Slot {index + 1}
                        </div>
                      </div>
                      {DAYS_OF_WEEK.map(day => (
                        <TimeSlot
                          key={`${day.value}-${timeSlot.start}`}
                          day={day}
                          timeSlot={timeSlot}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className='lg:hidden'>
          {/* Mobile Day Navigation */}
          <Card className='bg-white mb-4'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => navigateDay('prev')}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <div className='text-center'>
                  <h3 className='font-semibold text-lg'>
                    {DAYS_OF_WEEK.find(day => day.value === selectedDay)?.label}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {DAYS_OF_WEEK.find(day => day.value === selectedDay)?.short}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => navigateDay('next')}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Day Tabs */}
          <div className='mb-4 overflow-x-auto'>
            <div className='flex space-x-2 pb-2'>
              {DAYS_OF_WEEK.map(day => (
                <Button
                  key={day.value}
                  variant={selectedDay === day.value ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSelectedDay(day.value)}
                  className='flex-shrink-0'
                >
                  {day.short}
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile Timetable */}
          <Card className='bg-white'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Calendar className='h-5 w-5' />
                {
                  DAYS_OF_WEEK.find(day => day.value === selectedDay)?.label
                }{' '}
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              <div className='space-y-4'>
                {TIME_SLOTS.map(timeSlot => (
                  <div
                    key={`${timeSlot.start}-${timeSlot.end}`}
                    className='space-y-3'
                  >
                    <div className='p-3 bg-gray-100 rounded-lg'>
                      <div className='text-sm font-medium text-gray-900'>
                        {timeSlot.label}
                      </div>
                      <div className='text-xs text-gray-500 mt-1'>
                        {timeSlot.start} - {timeSlot.end}
                      </div>
                    </div>
                    <TimeSlot
                      day={DAYS_OF_WEEK.find(day => day.value === selectedDay)!}
                      timeSlot={timeSlot}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DragDropContext>

      {/* Summary */}
      <Card className='bg-white'>
        <CardHeader>
          <CardTitle className='text-lg sm:text-xl'>Schedule Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='text-center p-3 sm:p-4 bg-blue-50 rounded-lg'>
              <div className='text-xl sm:text-2xl font-bold text-blue-600'>
                {shifts.length}
              </div>
              <div className='text-xs sm:text-sm text-gray-600'>
                Total Shifts
              </div>
            </div>
            <div className='text-center p-3 sm:p-4 bg-green-50 rounded-lg'>
              <div className='text-xl sm:text-2xl font-bold text-green-600'>
                {templates.length}
              </div>
              <div className='text-xs sm:text-sm text-gray-600'>Templates</div>
            </div>
            <div className='text-center p-3 sm:p-4 bg-purple-50 rounded-lg'>
              <div className='text-xl sm:text-2xl font-bold text-purple-600'>
                {filteredUsers.length}
              </div>
              <div className='text-xs sm:text-sm text-gray-600'>
                Active Staff
              </div>
            </div>
            <div className='text-center p-3 sm:p-4 bg-orange-50 rounded-lg'>
              <div className='text-xl sm:text-2xl font-bold text-orange-600'>
                {shifts.reduce((acc, shift) => {
                  const start = Number.parseInt(shift.startTime.split(':')[0]);
                  const end = Number.parseInt(shift.endTime.split(':')[0]);
                  return acc + (end - start);
                }, 0)}
              </div>
              <div className='text-xs sm:text-sm text-gray-600'>
                Total Hours
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
