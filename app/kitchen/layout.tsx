"use client"
import type React from "react"
import type { Metadata } from "next"
import { Provider } from "react-redux"
import { store } from "@/redux"
import SiderBarKitchen from "@/components/kitchen-waiter"



export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   
    <Provider store={store}>
     <div className="flex h-screen">
      <SiderBarKitchen />
      <div className="flex min-h-screen flex-col w-full">
        <div className="flex-1">{children}</div>
      </div>
      
    </div>
    </Provider>
    
  )
}

