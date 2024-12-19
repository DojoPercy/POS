import SideBarOwner from '@/components/owner-sidebar'
import SideBar from '../SideBar'






export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    
        <div className="h-screen">
          <SideBarOwner/>
          <div className="bg-white sm:ml-16">
            {children}  
          </div>
        </div>
     
  )
}
