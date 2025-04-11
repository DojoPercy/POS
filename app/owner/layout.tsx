"use client";
import SideBarOwner from '@/components/owner-sidebar'
import SideBar from '../SideBar'
import { Provider } from 'react-redux'
import { store } from '../../redux/index';






export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
        <div className="h-screen ">
          <SideBarOwner/>
          <div className="bg-white sm:ml-16">
            {children}  
          </div>
        </div>
        </Provider>
     
  )
}
