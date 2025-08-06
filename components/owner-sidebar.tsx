'use client';

import { useEffect, useState } from 'react';
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
  Crown,
  TrendingUp,
  Store,
  FileText,
  Shield,
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
    badge: 'New',
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
    icon: Users,
    text: 'Staff',
    href: '/owner/staffs',
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
  {
    icon: Shield,
    text: 'Security',
    href: '/owner/security',
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
      className='border-r border-slate-200/60 bg-gradient-to-b from-white to-slate-50/30'
    >
      <SidebarHeader className='border-b border-slate-200/60 bg-white/80 backdrop-blur-sm'>
        <div className='flex items-center gap-3 px-4 py-4'>
          {/* Enhanced ChainPOS Logo */}
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 shadow-lg shadow-blue-500/25'>
            <Crown className='h-6 w-6 text-white' />
          </div>
          <div className='flex flex-col group-data-[collapsible=icon]:hidden'>
            <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              ChainPOS
            </span>
            <span className='text-xs text-slate-500 font-medium'>
              Enterprise Platform
            </span>
          </div>
        </div>

        {/* Enhanced Company Info Card */}
        {hasCompanies && (
          <div className='mx-4 mb-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100/50 shadow-sm group-data-[collapsible=icon]:hidden'>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <Image
                  src={company?.logo || '/default-logo.png'}
                  alt='Company Logo'
                  width={48}
                  height={48}
                  className='rounded-xl object-cover border-2 border-white shadow-sm'
                />
                <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
              </div>
              <div className='flex flex-col flex-1 min-w-0'>
                <span className='text-sm font-semibold text-slate-900 truncate'>
                  {company?.name || 'Restaurant Chain'}
                </span>
                <span className='text-xs text-slate-600 font-medium'>
                  Owner Dashboard
                </span>
                <div className='flex items-center gap-1 mt-1'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-xs text-green-600 font-medium'>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className='bg-transparent'>
        {/* Main navigation */}
        <div className='px-3 py-2'>
          <SidebarGroup>
            <SidebarGroupLabel className='px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
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
                      className='group relative overflow-hidden rounded-xl transition-all duration-300 ease-out
                                 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-500/10 data-[active=true]:to-purple-500/10 
                                 data-[active=true]:text-blue-700 data-[active=true]:border data-[active=true]:border-blue-200/50
                                 data-[active=true]:shadow-sm data-[active=true]:shadow-blue-500/20
                                 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 hover:scale-[1.02]
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

        <SidebarSeparator className='mx-3 bg-gradient-to-r from-transparent via-slate-200 to-transparent' />

        {/* Business management navigation */}
        {hasCompanies && (
          <div className='px-3 py-2'>
            <SidebarGroup>
              <SidebarGroupLabel className='px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
                Business Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {businessNavItems.map(item => (
                    <SidebarMenuItem key={item.text}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.text}
                        className='group relative overflow-hidden rounded-xl transition-all duration-300 ease-out
                                   data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-500/10 data-[active=true]:to-teal-500/10 
                                   data-[active=true]:text-emerald-700 data-[active=true]:border data-[active=true]:border-emerald-200/50
                                   data-[active=true]:shadow-sm data-[active=true]:shadow-emerald-500/20
                                   hover:bg-gradient-to-r hover:from-slate-50 hover:to-emerald-50/30 hover:scale-[1.02]
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
          </div>
        )}

        <SidebarSeparator className='mx-3 bg-gradient-to-r from-transparent via-slate-200 to-transparent' />

        {/* System navigation */}
        <div className='px-3 py-2'>
          <SidebarGroup>
            <SidebarGroupLabel className='px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
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
                      className='group relative overflow-hidden rounded-xl transition-all duration-300 ease-out
                                 data-[active=true]:bg-gradient-to-r data-[active=true]:from-slate-500/10 data-[active=true]:to-gray-500/10 
                                 data-[active=true]:text-slate-700 data-[active=true]:border data-[active=true]:border-slate-200/50
                                 data-[active=true]:shadow-sm
                                 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50/30 hover:scale-[1.02]
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

      <SidebarFooter className='border-t border-slate-200/60 bg-white/80 backdrop-blur-sm'>
        {/* User Profile Section */}
        <div className='px-3 py-3 group-data-[collapsible=icon]:px-2'>
          <div className='flex items-center gap-3 group-data-[collapsible=icon]:justify-center'>
            <Avatar className='h-10 w-10 ring-2 ring-blue-100 shadow-sm'>
              <AvatarImage
                src={user?.profileImage || '/placeholder.svg'}
                alt='User Avatar'
              />
              <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold'>
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col flex-1 min-w-0 group-data-[collapsible=icon]:hidden'>
              <p className='text-sm font-semibold text-slate-900 truncate'>
                {user?.firstName} {user?.lastName}
              </p>
              <p className='text-xs text-slate-500 font-medium'>Owner</p>
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
                           transition-all duration-200 rounded-xl group-data-[collapsible=icon]:justify-center 
                           group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 
                           group-data-[collapsible=icon]:p-0 hover:scale-[1.02] active:scale-[0.98]'
              >
                <LogOut className='h-4 w-4 shrink-0 mr-2 group-data-[collapsible=icon]:mr-0 transition-transform group-hover:translate-x-0.5' />
                <span className='group-data-[collapsible=icon]:hidden font-medium'>
                  Sign Out
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='bg-white rounded-2xl border border-slate-200 shadow-xl'>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-lg font-semibold text-slate-900'>
                  Sign Out
                </AlertDialogTitle>
                <AlertDialogDescription className='text-slate-600'>
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
