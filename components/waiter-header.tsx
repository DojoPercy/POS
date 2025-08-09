'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Search,

  LogOut,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserFromToken, logoutUser, selectUser } from '@/redux/authSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import router from 'next/router';
import { RootState } from '@/redux';
import { NotificationBell } from '@/components/notification-bell';

interface WaiterHeaderProps {
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  showSearch?: boolean;
  showOrderList?: boolean;
  cartItemCount?: number;
  onCartClick?: () => void;
}

export function WaiterHeader({
  title = 'Dashboard',
  breadcrumbs,
  showSearch = false,
  showOrderList = false,
  cartItemCount = 0,
  onCartClick,
}: WaiterHeaderProps) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [userDetails, setUser] = useState<any>(null);
  const { company } = useSelector((state: RootState) => state.company);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);
  useEffect(() => {
    const getUserDetails = async () => {
      if (user?.userId) {
        try {
          const res = await fetch(`/api/users/${user.userId}`);
          if (!res.ok) throw new Error('Failed to fetch user');
          const data = await res.json();
          setUser(data);
          console.log('User details fetched:', data.fullname);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };
    getUserDetails();
  }, [user?.userId]);
  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };
  return (
    <header className='flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4'>
      <SidebarTrigger className='-ml-1' />
      <Separator orientation='vertical' className='mr-2 h-4' />

      {/* Breadcrumbs or Title */}
      <div className='flex-1'>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className='flex items-center'>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <h1 className='text-lg font-semibold text-gray-900'>{title}</h1>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div className='relative hidden md:block'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            placeholder='Search menu...'
            className='pl-9 w-[250px] bg-gray-50 border-gray-200'
          />
        </div>
      )}

      {/* Actions */}
      <div className='flex items-center gap-2'>
        {/* Notifications */}
        <NotificationBell />

        {/* Cart (Mobile) */}
        {showOrderList && (
          <>
            <Button
              variant='ghost'
              size='icon'
              className='relative xl:hidden'
              onClick={onCartClick}
            >
              <ShoppingCart className='h-5 w-5' />
              {cartItemCount > 0 && (
                <Badge className='absolute -top-1 -right-1 px-1 min-w-[16px] h-4 text-xs'>
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </>
        )}
        <div className='hidden md:flex items-center gap-3'>
          <div className='text-right'>
            <p className='text-sm font-medium text-slate-900'>
              {userDetails?.fullname || 'Admin User'}
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full h-10 w-10'
          >
            <div className='h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold'>
              {userDetails?.fullname?.charAt(0) || 'A'}
            </div>
          </Button>
        </div>
        <div className='md:hidden bg-white z-50'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full h-8 w-8 b-white'
              >
                <div className='h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold'>
                  {userDetails?.fullname?.charAt(0) || 'A'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56 bg-white'>
              <DropdownMenuLabel>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {userDetails?.fullname || 'Admin User'}
                  </p>
                  <p className='text-xs leading-none text-muted-foreground'>
                    {company?.name || 'Restaurant'} Owner
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='flex items-center gap-2'
                onClick={() => router.push('/waiter')}
              >
                <User className='h-4 w-4' />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className='flex items-center gap-2 text-red-600 focus:text-red-600'
                onClick={handleLogout}
              >
                <LogOut className='h-4 w-4' />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
