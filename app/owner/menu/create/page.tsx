"use client"

import AddMenuItemForm from '@/components/addmenu'
import { useState } from 'react'


export default function MenuPage() {
  const [refreshTable, setRefreshTable] = useState(false)

  const handleAddItem = () => {
    setRefreshTable(true)
  }

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Menu Management</h1>
      <AddMenuItemForm onAddItem={handleAddItem} />
      
    </div>
  )
}
