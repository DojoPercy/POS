'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';

interface StaffWeeklyAttendanceProps {
  userId: string;
  branchId: string;
  companyId: string;
  staffName: string;
  staffEmail: string;
  staffRole: string;
  branchName: string;
}

interface WeeklyDay {
  date: string;
  dayName: string;
  dayOfWeek: number;
  shift: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
    shiftState: string;
    role: string;
  } | null;
  attendance: {
    id: string;
    signInTime: string | null;
    signOutTime: string | null;
    status: string;
    totalHours: number | null;
  } | null;
  hasShift: boolean;
  hasAttendance: boolean;
  isCompleted: boolean;
}

interface WeeklyData {
  userId: string;
  branchId: string;
  companyId: string;
  weekStart: string;
  weekEnd: string;
  weeklySchedule: WeeklyDay[];
  summary: {
    totalShifts: number;
    completedShifts: number;
    totalHours: number;
  };
}

export function StaffWeeklyAttendance({
  userId,
  branchId,
  companyId,
  staffName,
  staffEmail,
  staffRole,
  branchName,
}: StaffWeeklyAttendanceProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date()),
  );

  const fetchWeeklyData = async (weekStart: Date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/attendance/staff-weekly?userId=${userId}&branchId=${branchId}&companyId=${companyId}&weekStart=${weekStart.toISOString()}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weekly data');
      }

      const data = await response.json();
      setWeeklyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyData(currentWeekStart);
  }, [userId, branchId, companyId, currentWeekStart]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (day: WeeklyDay) => {
    if (!day.hasShift) return 'text-gray-400';
    if (day.isCompleted) return 'text-green-600';
    if (day.hasAttendance && day.attendance?.status === 'SIGNED_IN')
      return 'text-blue-600';
    if (day.hasShift && !day.hasAttendance) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = (day: WeeklyDay) => {
    if (!day.hasShift) return null;
    if (day.isCompleted)
      return <CheckCircle className='h-4 w-4 text-green-600' />;
    if (day.hasAttendance && day.attendance?.status === 'SIGNED_IN')
      return <Clock className='h-4 w-4 text-blue-600' />;
    if (day.hasShift && !day.hasAttendance)
      return <XCircle className='h-4 w-4 text-red-600' />;
    return <AlertCircle className='h-4 w-4 text-gray-600' />;
  };

  const formatTime = (timeString: string) => {
    try {
      return format(parseISO(timeString), 'HH:mm');
    } catch {
      return timeString;
    }
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart =
      direction === 'prev'
        ? addDays(currentWeekStart, -7)
        : addDays(currentWeekStart, 7);
    setCurrentWeekStart(newWeekStart);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className='flex items-center space-x-4'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-[200px]' />
              <Skeleton className='h-4 w-[150px]' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-7 gap-2'>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className='h-20 w-full' />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center text-red-600'>
            <AlertCircle className='h-8 w-8 mx-auto mb-2' />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weeklyData) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center text-gray-600'>
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Avatar className='h-12 w-12'>
              <AvatarImage src='' alt={staffName} />
              <AvatarFallback className='bg-blue-100 text-blue-700'>
                {getInitials(staffName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className='text-lg font-semibold'>{staffName}</h3>
              <div className='flex items-center space-x-4 text-sm text-gray-600'>
                <span className='flex items-center'>
                  <User className='h-4 w-4 mr-1' />
                  {staffRole}
                </span>
                <span className='flex items-center'>
                  <MapPin className='h-4 w-4 mr-1' />
                  {branchName}
                </span>
              </div>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-sm text-gray-600'>Week of</p>
            <p className='font-semibold'>
              {format(parseISO(weeklyData.weekStart), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Week Navigation */}
        <div className='flex items-center justify-between mb-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigateWeek('prev')}
          >
            Previous Week
          </Button>

          <div className='flex items-center space-x-4'>
            <div className='text-center'>
              <p className='text-sm font-medium'>Shifts</p>
              <p className='text-lg font-bold text-blue-600'>
                {weeklyData.summary.completedShifts}/
                {weeklyData.summary.totalShifts}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-sm font-medium'>Hours</p>
              <p className='text-lg font-bold text-green-600'>
                {formatDuration(weeklyData.summary.totalHours)}
              </p>
            </div>
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={() => navigateWeek('next')}
          >
            Next Week
          </Button>
        </div>

        {/* Weekly Schedule Grid */}
        <div className='grid grid-cols-7 gap-2'>
          {weeklyData.weeklySchedule.map((day, index) => (
            <div
              key={day.date}
              className={`p-3 rounded-lg border ${
                day.hasShift
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className='text-center'>
                <p className='text-xs font-medium text-gray-600 mb-1'>
                  {day.dayName.slice(0, 3)}
                </p>
                <p className='text-sm font-semibold mb-2'>
                  {format(parseISO(day.date), 'dd')}
                </p>

                {day.hasShift && (
                  <div className='space-y-1'>
                    <div className='flex items-center justify-center'>
                      {getStatusIcon(day)}
                    </div>
                    <p className='text-xs font-medium text-gray-700'>
                      {day.shift?.title || 'Shift'}
                    </p>
                    <p className='text-xs text-gray-600'>
                      {day.shift?.startTime} - {day.shift?.endTime}
                    </p>

                    {day.attendance && (
                      <div className='mt-2 pt-2 border-t border-gray-200'>
                        <p className='text-xs text-gray-600'>
                          {day.attendance.signInTime &&
                            formatTime(day.attendance.signInTime)}
                          {day.attendance.signOutTime &&
                            ` - ${formatTime(day.attendance.signOutTime)}`}
                        </p>
                        {day.attendance.totalHours && (
                          <p className='text-xs text-green-600 font-medium'>
                            {formatDuration(day.attendance.totalHours)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!day.hasShift && (
                  <p className='text-xs text-gray-400'>No shift</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className='mt-6 grid grid-cols-3 gap-4 pt-4 border-t'>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Completion Rate</p>
            <p className='text-lg font-bold text-blue-600'>
              {weeklyData.summary.totalShifts > 0
                ? Math.round(
                  (weeklyData.summary.completedShifts /
                      weeklyData.summary.totalShifts) *
                      100,
                )
                : 0}
              %
            </p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Avg Hours/Day</p>
            <p className='text-lg font-bold text-green-600'>
              {weeklyData.summary.completedShifts > 0
                ? formatDuration(
                  weeklyData.summary.totalHours /
                      weeklyData.summary.completedShifts,
                )
                : '0h 0m'}
            </p>
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>Status</p>
            <Badge
              variant={
                weeklyData.summary.completedShifts ===
                weeklyData.summary.totalShifts
                  ? 'default'
                  : 'secondary'
              }
              className='mt-1'
            >
              {weeklyData.summary.completedShifts ===
              weeklyData.summary.totalShifts
                ? 'Complete'
                : 'In Progress'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
