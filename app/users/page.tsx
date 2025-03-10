import React from 'react'
import OrderScreen from '../../components/orderScreen';

const OrderScreenPage = () => {
  return (
    <main className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-6">Place Your Order</h1>
    <OrderScreen />
  </main>
  )
}

export default OrderScreenPage