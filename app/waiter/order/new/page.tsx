import { OrderForm } from '@/components/order-form'
import React from 'react'

const OrderPage = () => {
  return (
    <div className="container mx-auto py-10">
    <h1 className="text-2xl font-bold mb-5">New Order</h1>
    <OrderForm />
  </div>
  )
}

export default OrderPage
