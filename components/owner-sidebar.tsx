'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  ChefHat,
  ClipboardList,
  LogOut,
  MenuIcon,
  Package,
  Settings,
  User,
  Users,
  BarChart3,
  Bell,
  Shield,
  Receipt,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserFromToken, logoutUser, selectUser } from '@/redux/authSlice';
import { getCompanyDetails } from '@/redux/companySlice';
import type { RootState } from '@/redux';
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import Image from 'next/image';

// Navigation items configuration
const mainNavItems = [
  {
    icon: BarChart3,
    text: 'Dashboard',
    href: '/owner/dashboard',
  },
];

const businessNavItems = [
  {
    icon: MenuIcon,
    text: 'Menu',
    href: '/owner/menu',
  },
  {
    icon: ChefHat,
    text: 'Ingredients',
    href: '/owner/ingredient',
  },
  {
    icon: Building2,
    text: 'Branches',
    href: '/owner/branches',
  },
  {
    icon: ClipboardList,
    text: 'Orders',
    href: '/owner/orders',
  },
  {
    icon: Package,
    text: 'Inventory',
    href: '/owner/inventory',
  },
  {
    icon: Receipt,
    text: 'Expenses',
    href: '/owner/expenses',
  },
  {
    icon: Users,
    text: 'Staff',
    href: '/owner/staffs',
    children: [
      {
        text: 'Shift Scheduler',
        href: '/owner/staffs/shifts-grid',
      },
    ],
  },
  {
    icon: Bell,
    text: 'Notifications',
    href: '/owner/notifications',
  },
  {
    icon: User,
    text: 'Profile',
    href: '/owner/profile',
  },
];

const systemNavItems = [
  {
    icon: Settings,
    text: 'Settings',
    href: '/owner/settings',
  },
];

export function SideBarOwner() {
  const [hasCompanies, setHasCompanies] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const router = useRouter();
  const pathname = usePathname();
  const { company } = useSelector((state: RootState) => state.company);

  useEffect(() => {
    if (user?.companyId) {
      Promise.all([
        dispatch(fetchUserFromToken()),
        dispatch(getCompanyDetails(user.companyId)),
      ]).finally(() => {
        setHasCompanies(true);
      });
    }
  }, [dispatch, user?.companyId]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  // Helper function to check if a route is active
  const isActive = (href: string) => {
    if (href === '/owner/dashboard') return pathname === '/owner/dashboard';
    return pathname.startsWith(href);
  };

  // Get user initials for avatar
  const userInitials =
    user?.firstName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'O';

  return (
    <Sidebar
      collapsible='icon'
      className='border-r font-montserrat border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
    >
      <SidebarHeader className='border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'>
        <div className='flex items-center gap-3 px-4 py-4'>
          {/* Enhanced ChainPOS Logo */}

          <div className='flex items-center justify-center'>
            <Image
              src='/pos_final.png'
              alt='ChainPOS Logo'
              width={108}
              height={108}
            />
          </div>

          {/* <div className='flex flex-col group-data-[collapsible=icon]:hidden'>
            <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              ChainPOS
            </span>
            <span className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
              Enterprise Platform
            </span>
          </div> */}
        </div>

        {/* Enhanced Company Info Card */}
        {hasCompanies && (
          <div className='mx-4 mb-4 font-montserrat border-gray-200 dark:border-gray-700 shadow-sm group-data-[collapsible=icon]:hidden'>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <Image
                  src={company?.logo || '/default-logo.png'}
                  alt='Company Logo'
                  width={48}
                  height={48}
                  className=' object-cover '
                />
              </div>
              <div className='flex flex-col flex-1 min-w-0'>
                <span className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate'>
                  {company?.name || 'Restaurant Chain'}
                </span>
                <span className='text-xs text-gray-600 dark:text-gray-400 font-medium'>
                  Owner Dashboard
                </span>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className='bg-white dark:bg-gray-900'>
        {/* Main navigation */}
        <div className='px-3 py-2'>
          <SidebarGroup>
            <SidebarGroupLabel className='px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
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
                        href={item.href}
                        className='flex items-center gap-3 w-full'
                      >
                        <div className='relative'>
                          <item.icon className='h-5 w-5 transition-transform duration-200 group-hover:scale-110' />
                          {isActive(item.href) && (
                            <div className='absolute inset-0 bg-blue-500/20 rounded-full animate-ping'></div>
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
        </div>

        <SidebarSeparator className='mx-3 bg-gray-200 dark:bg-gray-700' />

        {/* Business management navigation */}
        {hasCompanies && (
          <div className='px-3 py-2'>
            <SidebarGroup>
              <SidebarGroupLabel className='px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
                Business Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {businessNavItems.map(item => (
                    <div key={item.text}>
                      <SidebarMenuItem>
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
                                <div className='absolute inset-0 bg-emerald-500/20 rounded-full animate-ping'></div>
                              )}
                            </div>
                            <div className='flex items-center gap-2 flex-1 group-data-[collapsible=icon]:hidden'>
                              <span className='font-medium'>{item.text}</span>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Render children if they exist */}
                      {item.children && (
                        <div className='ml-4 space-y-1'>
                          {item.children.map(child => (
                            <SidebarMenuItem key={child.text}>
                              <SidebarMenuButton
                                asChild
                                isActive={isActive(child.href)}
                                tooltip={child.text}
                                className='group relative overflow-hidden rounded-lg transition-all duration-200 ease-out
                                           data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 data-[active=true]:border data-[active=true]:border-gray-200
                                           dark:data-[active=true]:bg-gray-800 dark:data-[active=true]:text-gray-100 dark:data-[active=true]:border-gray-700
                                           hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100
                                           active:scale-[0.98] text-sm'
                              >
                                <Link
                                  href={child.href}
                                  className='flex items-center gap-3 w-full'
                                >
                                  <div className='relative'>
                                    <div className='w-2 h-2 bg-gray-400 rounded-full'></div>
                                  </div>
                                  <span className='font-medium group-data-[collapsible=icon]:hidden'>
                                    {child.text}
                                  </span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        )}

        <SidebarSeparator className='mx-3 bg-gray-200 dark:bg-gray-700' />

        {/* System navigation */}
        <div className='px-3 py-2'>
          <SidebarGroup>
            <SidebarGroupLabel className='px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
              System
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemNavItems.map(item => (
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
        </div>
      </SidebarContent>

      <SidebarFooter className='border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'>
        {/* User Profile Section */}
        <div className='px-3 py-3 group-data-[collapsible=icon]:px-2'>
          <div className='flex items-center gap-3 group-data-[collapsible=icon]:justify-center'>
            <Avatar className='h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm'>
              <AvatarImage
                src={user?.profileImage || '/placeholder.svg'}
                alt='User Avatar'
              />
              <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold'>
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col flex-1 min-w-0 group-data-[collapsible=icon]:hidden'>
              <p className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate'>
                {user?.firstName} {user?.lastName}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
                Owner
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className='px-3 pb-3'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 
                           dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300
                           transition-all duration-200 rounded-lg group-data-[collapsible=icon]:justify-center 
                           group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 
                           group-data-[collapsible=icon]:p-0 hover:scale-[1.02] active:scale-[0.98]'
              >
                <LogOut className='h-4 w-4 shrink-0 mr-2 group-data-[collapsible=icon]:mr-0 transition-transform group-hover:translate-x-0.5' />
                <span className='group-data-[collapsible=icon]:hidden font-medium'>
                  Sign Out
                </span>
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
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default SideBarOwner;
