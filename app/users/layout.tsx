"use client";
import SideBarOwner from '@/components/owner-sidebar'
import SideBar from '../SideBar'
import { Provider } from 'react-redux'
import { store } from '../../redux/index';






export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
        <div className="h-screen">
         
          <div className="">
            {children}  
          </div>
        </div>
        </Provider>
     
  )
}
