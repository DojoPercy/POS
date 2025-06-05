"use client"

import type React from "react"

import { Provider } from "react-redux"
import { store } from "../../redux/index"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { BranchSidebar } from "@/components/branch-sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function BranchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-50">
          <BranchSidebar />
          <SidebarInset className="flex-1">
            <main className="flex-1 ">{children}</main>
          </SidebarInset>
        </div>
        <Toaster />
      </SidebarProvider>
    </Provider>
  )
}
