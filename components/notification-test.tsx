'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutomaticNotificationService } from '@/lib/automatic-notifications';
import { NotificationUtils } from '@/lib/notification-utils';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Trophy,
  Target,
  Star,
  TrendingUp,
  AlertTriangle,
  Award,
  Zap,
} from 'lucide-react';

interface NotificationTestProps {
  companyId: string;
}

export function NotificationTest({ companyId }: NotificationTestProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTestNotification = async (
    type: string,
    testFunction: () => Promise<void>,
  ) => {
    setLoading(type);
    try {
      await testFunction();
      toast({
        title: 'Success',
        description: `${type} notification test completed successfully`,
      });
    } catch (error) {
      console.error(`Error testing ${type}:`, error);
      toast({
        title: 'Error',
        description: `Failed to test ${type} notification`,
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const testFunctions = {
    'top-branches': () =>
      AutomaticNotificationService.checkTopBranches(companyId),
    'highest-orders': () =>
      AutomaticNotificationService.checkHighestOrders(companyId),
    'top-attendance': () =>
      AutomaticNotificationService.checkTopAttendance(companyId),
    'low-stock': () =>
      AutomaticNotificationService.checkLowStockAlerts(companyId),
    'sales-milestones': () =>
      AutomaticNotificationService.checkSalesMilestones(companyId),
    'daily-summary': () =>
      AutomaticNotificationService.generateDailySummary(companyId),
    'weekly-achievements': () =>
      AutomaticNotificationService.generateWeeklyAchievements(companyId),
    all: () => AutomaticNotificationService.runAllChecks(companyId),
  };

  const notificationTypes = [
    {
      type: 'top-branches',
      title: '🏆 Top Branch Performance',
      description: 'Check for top performing branches by revenue and orders',
      icon: Trophy,
      color: 'bg-blue-500',
    },
    {
      type: 'highest-orders',
      title: '🎯 Highest Order Achievement',
      description: 'Check for record-breaking orders',
      icon: Target,
      color: 'bg-green-500',
    },
    {
      type: 'top-attendance',
      title: '⭐ Top Attendance',
      description: 'Check for employees with perfect attendance',
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      type: 'low-stock',
      title: '⚠️ Low Stock Alerts',
      description: 'Check for low stock alerts',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      type: 'sales-milestones',
      title: '🎉 Sales Milestones',
      description: 'Check for sales milestone achievements',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      type: 'daily-summary',
      title: '📊 Daily Summary',
      description: 'Generate daily performance summary',
      icon: Zap,
      color: 'bg-indigo-500',
    },
    {
      type: 'weekly-achievements',
      title: '🏅 Weekly Achievements',
      description: 'Generate weekly achievement notifications',
      icon: Award,
      color: 'bg-pink-500',
    },
    {
      type: 'all',
      title: '🚀 Run All Tests',
      description: 'Run all automatic notification checks',
      icon: Bell,
      color: 'bg-gray-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Bell className='h-5 w-5' />
          Notification System Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {notificationTypes.map(notification => {
            const Icon = notification.icon;
            const isLoading = loading === notification.type;

            return (
              <div
                key={notification.type}
                className='p-4 border rounded-lg hover:shadow-md transition-shadow'
              >
                <div className='flex items-start gap-3'>
                  <div
                    className={`p-2 rounded-lg ${notification.color} text-white`}
                  >
                    <Icon className='h-4 w-4' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-medium text-sm'>
                      {notification.title}
                    </h3>
                    <p className='text-xs text-gray-600 mt-1'>
                      {notification.description}
                    </p>
                    <Button
                      size='sm'
                      className='mt-3'
                      onClick={() =>
                        handleTestNotification(
                          notification.type,
                          testFunctions[
                            notification.type as keyof typeof testFunctions
                          ],
                        )
                      }
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2' />
                          Testing...
                        </>
                      ) : (
                        'Test Now'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
          <h4 className='font-medium text-sm mb-2'>Manual Notification Test</h4>
          <div className='space-y-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() =>
                handleTestNotification('manual-company', async () => {
                  await NotificationUtils.createNotification({
                    title: '🧪 Test Notification',
                    message: 'This is a test company-wide notification',
                    type: 'COMPANY',
                    priority: 'MEDIUM',
                    companyId: companyId,
                  });
                })
              }
              disabled={loading !== null}
            >
              Test Company Notification
            </Button>

            <Button
              size='sm'
              variant='outline'
              onClick={() =>
                handleTestNotification('manual-branch', async () => {
                  await NotificationUtils.createNotification({
                    title: '🧪 Test Branch Notification',
                    message: 'This is a test branch-specific notification',
                    type: 'BRANCH',
                    priority: 'MEDIUM',
                    companyId: companyId,
                  });
                })
              }
              disabled={loading !== null}
            >
              Test Branch Notification
            </Button>
          </div>
        </div>

        <div className='mt-4 text-xs text-gray-500'>
          <p>
            💡 These tests will create real notifications using your actual data
            from the API.
          </p>
          <p>📱 Check the notification bell to see the results!</p>
        </div>
      </CardContent>
    </Card>
  );
}
