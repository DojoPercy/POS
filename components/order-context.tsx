'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOrders } from '@/lib/order';
import { jwtDecode } from 'jwt-decode';
import type { Order } from '@prisma/client';

interface OrderContextType {
  orders: Order[];
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context)
    throw new Error('useOrderContext must be used within an OrderProvider');
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decodedToken: any = jwtDecode(token);
    const allOrders = await getOrders(undefined, decodedToken.branchId ?? '');
    const filtered = allOrders.filter(
      (o: { isCompleted: any; isCheckedOut: any }) =>
        !(o.isCompleted && o.isCheckedOut)
    );
    setOrders(filtered);
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  return (
    <OrderContext.Provider value={{ orders, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
