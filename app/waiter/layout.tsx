'use client';

import type React from 'react';

import { Provider } from 'react-redux';
import { store } from '../../redux/index';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { WaiterSidebar } from '@/components/waiter-sidebar';

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldShowOrderList = !['/waiter/order/view', '/waiter'].includes(
    pathname
  );

  return (
    <Provider store={store}>
      <SidebarProvider>
        <div className='flex h-screen w-full bg-gray-50'>
          <WaiterSidebar />
          <SidebarInset className='flex-1'>
            <div className='flex h-full'>
              <main className='flex-1 overflow-hidden'>{children}</main>
            </div>
          </SidebarInset>
        </div>
        <Toaster />
      </SidebarProvider>
    </Provider>
  );
}
