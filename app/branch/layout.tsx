import SideBarOwner from '@/components/owner-sidebar'
import SideBar from '../SideBar'
import SiderBarWaiter from '@/components/waiter-sidebar'
import SiderBarBranch from '@/components/branch-sidebar'






export default function BranchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    
        <div className="h-screen">
          <SiderBarBranch/>
          <div className="bg-white sm:ml-16">
            {children}  
          </div>
        </div>
     
  )
}
