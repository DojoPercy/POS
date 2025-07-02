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
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden bg-slate-50">
          <SideBarOwner />
          <SidebarInset className="flex flex-col flex-1 min-w-0">
            <SidebarHeaderComponent />
            <main className="flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
              <div className="max-w-full">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Provider>
  )
}
