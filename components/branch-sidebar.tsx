'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  ClipboardList,
  Users,
  CreditCard,
  User,
  Settings,
  LogOut,
  Building2,
  BarChart3,
  Package,
  Store,
  TrendingUp,
  FileText,
  Shield,
  Bell,
  MapPin,
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getBranchById } from '@/lib/branch';

interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  [key: string]: any;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  status: 'active' | 'inactive';
}

const mainNavItems = [
  {
    icon: Home,
    text: 'Dashboard',
    href: '/branch',
  },
];

const managementNavItems = [
  {
    icon: ClipboardList,
    text: 'Orders',
    href: '/branch/orders',
    badge: '12',
  },
  {
    icon: CreditCard,
    text: 'Expenses',
    href: '/branch/expenses',
  },
  {
    icon: Users,
    text: 'Staff',
    href: '/branch/staffs',
  },
  {
    icon: Package,
    text: 'Inventory',
    href: '/branch/inventory',
  },
];

const reportsNavItems = [
  {
    icon: TrendingUp,
    text: 'Performance',
    href: '/branch/performance',
  },
  {
    icon: FileText,
    text: 'Reports',
    href: '/branch/reports',
  },
];

const accountNavItems = [
  {
    icon: User,
    text: 'Profile',
    href: '/branch/profile',
  },
  {
    icon: Settings,
    text: 'Settings',
    href: '/branch/settings',
  },
];

export function BranchSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token) as DecodedToken;
        setDecodedToken(decoded);

        // Fetch branch details
        if (decoded.branchId) {
          getBranchById(decoded.branchId).then(branchData => {
            setBranch(branchData);
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/branch') return pathname === '/branch';
    return pathname.startsWith(href);
  };

  // Don't show sidebar for owners
  if (decodedToken?.role === 'owner') {
    return null;
  }

  return (
    <Sidebar
      collapsible='offcanvas'
      className='border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
    >
      <SidebarHeader className='border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 shadow-lg shadow-emerald-500/25'>
            <Store className='h-6 w-6 text-white' />
          </div>
          <div className='flex flex-col'>
            <span className='text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent'>
              {isLoading ? 'Loading...' : branch?.name || 'Branch Portal'}
            </span>
            <span className='text-xs text-gray-600 dark:text-gray-400 font-medium'>
              Management Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='px-2 py-4 bg-white dark:bg-gray-900'>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(item => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.text}
                    className='group relative overflow-hidden rounded-lg transition-all duration-200 ease-out
                               data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 data-[active=true]:border data-[active=true]:border-gray-200
                               dark:data-[active=true]:bg-gray-800 dark:data-[active=true]:text-gray-100 dark:data-[active=true]:border-gray-700
                               hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100
                               active:scale-[0.98]'
                  >
                    <Link
                      href={`${item.href}/${branch?.id}`}
                      className='flex items-center gap-3 w-full'
                    >
                      <div className='relative'>
                        <item.icon className='h-5 w-5 transition-transform duration-200 group-hover:scale-110' />
                        {isActive(item.href) && (
                          <div className='absolute inset-0 bg-emerald-500/20 rounded-full animate-ping'></div>
                        )}
                      </div>
                      <span className='font-medium group-data-[collapsible=icon]:hidden'>
                        {item.text}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className='bg-gray-200 dark:bg-gray-700' />

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNavItems.map(item => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.text}
                    className='group relative overflow-hidden rounded-lg transition-all duration-200 ease-out
                               data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 data-[active=true]:border data-[active=true]:border-gray-200
                               dark:data-[active=true]:bg-gray-800 dark:data-[active=true]:text-gray-100 dark:data-[active=true]:border-gray-700
                               hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100
                               active:scale-[0.98]'
                  >
                    <Link
                      href={item.href}
                      className='flex items-center gap-3 w-full'
                    >
                      <div className='relative'>
                        <item.icon className='h-5 w-5 transition-transform duration-200 group-hover:scale-110' />
                        {isActive(item.href) && (
                          <div className='absolute inset-0 bg-blue-500/20 rounded-full animate-ping'></div>
                        )}
                      </div>
                      <div className='flex items-center gap-2 flex-1 group-data-[collapsible=icon]:hidden'>
                        <span className='font-medium'>{item.text}</span>
                        {item.badge && (
                          <Badge
                            variant='secondary'
                            className='text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 border-blue-200'
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className='bg-gray-200 dark:bg-gray-700' />

        {/* Reports */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
            Reports
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportsNavItems.map(item => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.text}
                    className='group relative overflow-hidden rounded-lg transition-all duration-200 ease-out
                               data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 data-[active=true]:border data-[active=true]:border-gray-200
                               dark:data-[active=true]:bg-gray-800 dark:data-[active=true]:text-gray-100 dark:data-[active=true]:border-gray-700
                               hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100
                               active:scale-[0.98]'
                  >
                    <Link
                      href={item.href}
                      className='flex items-center gap-3 w-full'
                    >
                      <div className='relative'>
                        <item.icon className='h-5 w-5 transition-transform duration-200 group-hover:scale-110' />
                        {isActive(item.href) && (
                          <div className='absolute inset-0 bg-purple-500/20 rounded-full animate-ping'></div>
                        )}
                      </div>
                      <span className='font-medium group-data-[collapsible=icon]:hidden'>
                        {item.text}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className='bg-gray-200 dark:bg-gray-700' />

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavItems.map(item => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.text}
                    className='group relative overflow-hidden rounded-lg transition-all duration-200 ease-out
                               data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 data-[active=true]:border data-[active=true]:border-gray-200
                               dark:data-[active=true]:bg-gray-800 dark:data-[active=true]:text-gray-100 dark:data-[active=true]:border-gray-700
                               hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100
                               active:scale-[0.98]'
                  >
                    <Link
                      href={item.href}
                      className='flex items-center gap-3 w-full'
                    >
                      <div className='relative'>
                        <item.icon className='h-5 w-5 transition-transform duration-200 group-hover:scale-110' />
                        {isActive(item.href) && (
                          <div className='absolute inset-0 bg-slate-500/20 rounded-full animate-ping'></div>
                        )}
                      </div>
                      <span className='font-medium group-data-[collapsible=icon]:hidden'>
                        {item.text}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-4'>
        {/* Branch Status */}
        <div className='flex items-center gap-3 mb-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 border border-emerald-200 dark:border-emerald-700 dark:from-emerald-900 dark:to-green-900'>
            <MapPin className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
          </div>
          <div className='flex flex-col flex-1 min-w-0'>
            <p className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate'>
              {branch?.name || 'Branch Name'}
            </p>
            <div className='flex items-center gap-2 mt-1'>
              <div
                className={`w-2 h-2 rounded-full ${branch?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <p className='text-xs text-gray-600 dark:text-gray-400 font-medium capitalize'>
                {branch?.status || 'Unknown'}
              </p>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 truncate mt-1'>
              {branch?.address}, {branch?.city}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 
                         dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300
                         transition-all duration-200 rounded-lg hover:scale-[1.02] active:scale-[0.98]'
            >
              <LogOut className='h-4 w-4 mr-2 transition-transform group-hover:translate-x-0.5' />
              <span className='font-medium'>Sign Out</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className='bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Sign Out
              </AlertDialogTitle>
              <AlertDialogDescription className='text-gray-600 dark:text-gray-400'>
                Are you sure you want to sign out? Any unsaved changes will be
                lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='rounded-lg'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className='bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium'
              >
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
