"use client"
import SideBarOwner from "@/components/owner-sidebar"
import type React from "react"

import { Provider } from "react-redux"
import { store } from "../../redux/index"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SidebarHeaderComponent } from "@/components/ui/sidebarHeader"

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
      
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <SideBarOwner />
          <SidebarInset>
            <main className="flex-1 overflow-auto bg-white p-4">
              <SidebarHeaderComponent/>
              {children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Provider>
  )
}
