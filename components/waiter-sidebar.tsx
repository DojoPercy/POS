'use client';

import { useEffect, useState } from 'react'; // Import useState for local state
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  ClipboardList,
  FilePlus,
  User,
  Settings,
  LogOut,
  Building2,
  ChevronRight,
  Utensils,
  Clock,
  Star,
  Zap,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser, fetchUserFromToken } from '@/redux/authSlice';
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
import Image from 'next/image';
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
import { RootState } from '@/redux';
import { getCompanyDetails } from '@/redux/companySlice';

// --- Navigation Item Definitions ---
const mainNavItems = [
  {
    icon: Home,
    text: 'Dashboard',
    href: '/waiter',
  },
];

const orderNavItems = [
  {
    icon: FilePlus,
    text: 'New Order',
    href: '/waiter/order/new',
    badge: 'Hot',
  },
  {
    icon: ClipboardList,
    text: 'View Orders',
    href: '/waiter/order/view',
    badge: '5',
  },
  {
    icon: Clock,
    text: 'Order History',
    href: '/waiter/order/history',
  },
];

const quickActions = [
  {
    icon: Utensils,
    text: 'Menu Items',
    href: '/waiter/menu',
  },
  {
    icon: Star,
    text: 'Favorites',
    href: '/waiter/favorites',
  },
];

const accountNavItems = [
  {
    icon: Settings,
    text: 'Settings',
    href: '/waiter/settings',
  },
  {
    icon: User,
    text: 'Profile',
    href: '/waiter/profile',
  },
];

export function WaiterSidebar() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const router = useRouter();
  const pathname = usePathname();
  const { company } = useSelector((state: RootState) => state.company);

  // Local state to track if company details have been fetched
  // This replaces the global setHasCompanies function, which was causing an error
  const [hasCompanyDetails, setHasCompanyDetails] = useState(false);

  // Fetch user token on initial load
  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  // Fetch company details once user.companyId is available
  useEffect(() => {
    if (user?.companyId && !hasCompanyDetails) {
      // Only fetch if companyId exists and hasn't been fetched yet
      dispatch(getCompanyDetails(user.companyId) as any) // Type assertion if TS complains about PromiseLike
        .then(() => {
          setHasCompanyDetails(true); // Mark as fetched
        })
        .catch((error: any) => {
          console.error('Failed to fetch company details:', error);
          setHasCompanyDetails(true); // Still set true to prevent re-fetching on error
        });
    }
  }, [dispatch, user?.companyId, hasCompanyDetails]);

  const handleLogout = async () => {
    await dispatch(logoutUser() as any); // Type assertion if TS complains
    router.push('/login');
  };

  const isActive = (href: string) => {
    // For exact match on dashboard, otherwise check if path starts with href
    if (href === '/waiter') {
      return pathname === '/waiter';
    }
    return pathname.startsWith(href);
  };

  // Determine user initials for AvatarFallback
  const userInitials =
    user?.firstName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'W';

  return (
    <Sidebar
      collapsible='offcanvas'
      className='border-r border-slate-200/60 bg-gradient-to-b from-white to-blue-50/30 flex flex-col h-full'
    >
      {/* Sidebar Header: Logo and Company Info */}
      <SidebarHeader className='border-b border-slate-200/60 bg-gradient-to-br from-blue-50 to-indigo-100 p-4 shrink-0'>
        {/* ChainPOS Branding */}
        <div className='flex items-center gap-3 py-2 px-2'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 shadow-lg shadow-blue-500/25'>
            <Utensils className='h-6 w-6 text-white' />
          </div>
          <div className='flex flex-col group-data-[collapsible=icon]:hidden'>
            <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none'>
              ChainPOS
            </span>
            <span className='text-xs text-slate-600 font-medium mt-1'>
              Waiter POS System
            </span>
          </div>
        </div>

        {/* Restaurant/Company Info Card */}
        <div className='mx-2 my-4 rounded-xl bg-gradient-to-r from-white to-blue-50/50 p-4 shadow-sm border border-blue-100/50 group-data-[collapsible=icon]:hidden'>
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
                {company?.name || 'Your Restaurant'}
              </span>
              <span className='text-xs text-slate-600 font-medium truncate'>
                Waiter Dashboard
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
      </SidebarHeader>
      {/* Sidebar Content: Navigation Menus */}
      <SidebarContent className='px-2 py-4'>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
            Main
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

        <SidebarSeparator className='my-4 bg-gradient-to-r from-transparent via-slate-200 to-transparent' />

        {/* Order Management */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
            Order Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {orderNavItems.map(item => (
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
                            className={`text-xs px-1.5 py-0.5 ${
                              item.badge === 'Hot'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                            }`}
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

        <SidebarSeparator className='my-4 bg-gradient-to-r from-transparent via-slate-200 to-transparent' />

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map(item => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.text}
                    className='group relative overflow-hidden rounded-xl transition-all duration-300 ease-out
                               data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-500/10 data-[active=true]:to-amber-500/10 
                               data-[active=true]:text-orange-700 data-[active=true]:border data-[active=true]:border-orange-200/50
                               data-[active=true]:shadow-sm data-[active=true]:shadow-orange-500/20
                               hover:bg-gradient-to-r hover:from-slate-50 hover:to-orange-50/30 hover:scale-[1.02]
                               active:scale-[0.98]'
                  >
                    <Link
                      href={item.href}
                      className='flex items-center gap-3 w-full'
                    >
                      <div className='relative'>
                        <item.icon className='h-5 w-5 transition-transform duration-200 group-hover:scale-110' />
                        {isActive(item.href) && (
                          <div className='absolute inset-0 bg-orange-500/20 rounded-full animate-ping'></div>
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

        <SidebarSeparator className='my-4 bg-gradient-to-r from-transparent via-slate-200 to-transparent' />

        {/* Account Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden'>
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
      </SidebarContent>
      {/* Sidebar Footer: User Profile and Logout */}
      <SidebarFooter className='border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-4 shrink-0'>
        {/* User Profile */}
        <div className='flex items-center gap-3 mb-4 group-data-[collapsible=icon]:justify-center'>
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
            <p className='text-sm font-semibold text-slate-900 truncate leading-tight'>
              {user?.firstName} {user?.lastName || user?.email}
            </p>
            <p className='text-xs text-slate-600 font-medium truncate leading-tight'>
              Waiter
            </p>
            <div className='flex items-center gap-1 mt-1'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <span className='text-xs text-green-600 font-medium'>Online</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
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
      </SidebarFooter>
      <SidebarRail />{' '}
      {/* This component usually controls the collapsible state or small rail version */}
    </Sidebar>
  );
}

// Removed the standalone setHasCompanies function to integrate it into the component's state.
// If this function was intended to be global, it needs to be defined appropriately (e.g., in a utility file).
// For now, it's handled by a useState hook within the component.
