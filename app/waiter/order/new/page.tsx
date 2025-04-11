import { OrderForm } from '@/components/order-form'
import OrderScreen from '@/components/orderScreen'
import React from 'react'

const OrderPage = () => {
  return (
    <div className=" mx-auto py-10">
    <h1 className="text-2xl font-bold mb-5">New Order</h1>
    <OrderScreen />
  </div>
  )
}

export default OrderPage
