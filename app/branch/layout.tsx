"use client";
import SideBarOwner from '@/components/owner-sidebar'
import SideBar from '../SideBar'
import SiderBarWaiter from '@/components/waiter-sidebar'
import SiderBarBranch from '@/components/branch-sidebar'
import { store } from '../../redux/index';
import { Provider } from 'react-redux';






export default function BranchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
        <div className="h-screen">
          <SiderBarBranch/>
          <div className="bg-white sm:ml-16">
            {children}  
          </div>
        </div>
        </Provider>
  )
}
