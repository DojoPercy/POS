import SideBarOwner from '@/components/owner-sidebar'
import SideBar from '../SideBar'
import SiderBarWaiter from '@/components/waiter-sidebar'






export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    
        <div className="h-screen">
          <SiderBarWaiter/>
          <div className="bg-white sm:ml-16">
            {children}  
          </div>
        </div>
     
  )
}
