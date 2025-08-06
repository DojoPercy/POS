'use client';

import { useState, useEffect } from 'react';
import { Users, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  signInTime: string | null;
  signOutTime: string | null;
  totalHours: number | null;
  date: string;
  status: string;
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

interface AttendanceManagementProps {
  branchId?: string;
  companyId?: string;
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
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
};

export default function AttendanceManagement({
  branchId,
  companyId,
}: AttendanceManagementProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>(
    branchId || 'all',
  );

  useEffect(() => {
    fetchAttendanceHistory();
  }, [selectedBranch, branchId, companyId]);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedBranch !== 'all') {
        params.append('branchId', selectedBranch);
      } else if (companyId) {
        params.append('companyId', companyId);
      }

      const response = await fetch(`/api/attendance/history?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading attendance records...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='animate-pulse flex space-x-4'>
                <div className='rounded-full bg-gray-200 h-10 w-10'></div>
                <div className='flex-1 space-y-2 py-1'>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Attendance Records
          </CardTitle>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
            <Button variant='outline' size='sm'>
              <Filter className='h-4 w-4 mr-2' />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {attendanceRecords.length === 0 ? (
            <div className='text-center py-8'>
              <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500'>No attendance records found</p>
            </div>
          ) : (
            attendanceRecords.map(record => (
              <div
                key={record.id}
                className='flex items-center justify-between p-4 border rounded-lg'
              >
                <div className='flex items-center space-x-4'>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback className='bg-blue-500 text-white'>
                      {getInitials(record.user.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{record.user.fullname}</p>
                    <p className='text-sm text-gray-600 capitalize'>
                      {record.user.role}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {record.branch.name}
                    </p>
                  </div>
                </div>
                <div className='text-right space-y-1'>
                  <div className='flex items-center gap-4'>
                    <div className='text-sm'>
                      <span className='text-gray-500'>In:</span>{' '}
                      {record.signInTime
                        ? format(new Date(record.signInTime), 'HH:mm')
                        : 'N/A'}
                    </div>
                    <div className='text-sm'>
                      <span className='text-gray-500'>Out:</span>{' '}
                      {record.signOutTime
                        ? format(new Date(record.signOutTime), 'HH:mm')
                        : 'N/A'}
                    </div>
                    <div className='text-sm font-medium'>
                      {record.totalHours
                        ? formatDuration(record.totalHours)
                        : 'In Progress'}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={
                        record.status === 'SIGNED_IN' ? 'default' : 'secondary'
                      }
                    >
                      {record.status.replace('_', ' ')}
                    </Badge>
                    <span className='text-xs text-gray-500'>
                      {format(new Date(record.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
