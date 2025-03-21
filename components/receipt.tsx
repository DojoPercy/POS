import { Company } from '@/lib/types/types';
import React from 'react';


interface OrderLine {
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface ReceiptProps {
  order?: {
    orderLines: OrderLine[];
    totalPrice: number;
    discount: number;
    rounding: number;
    finalPrice: number;
    paymentType: string;
    receivedAmount: number;
    balance: number;
  };
  company: Company;
}

export const RestaurantReceipt: React.FC<ReceiptProps> = ({ order, company }) => {
  if (!order) {
    return <div>No order data available</div>;
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', width: '300px', padding: '10px' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>{company.name}</h1>
        {company.logo ? (
          <img src={company.logo} alt={`${company.name} Logo`} style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: '70px', height: '70px', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No Logo</div>
        )}
        <p style={{ margin: '0' }}>{new Date().toLocaleString()}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ textAlign: 'left' }}>Item</th>
            <th style={{ textAlign: 'right' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Price</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.orderLines.map((line, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{line.name}</td>
              <td style={{ textAlign: 'right' }}>{line.quantity}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(line.price)}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(line.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(order.totalPrice)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Discount:</span>
          <span>-{formatCurrency(order.discount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Rounding:</span>
          <span>{formatCurrency(order.rounding)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '5px 0', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Total:</span>
          <span>{formatCurrency(order.finalPrice)}</span>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Payment Type:</span>
          <span>{order.paymentType}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Amount Received:</span>
          <span>{formatCurrency(order.receivedAmount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Change:</span>
          <span>{formatCurrency(order.balance)}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '9px' }}>
        <p style={{ margin: '0 0 5px 0' }}>Thank you for dining with us!</p>
        <p style={{ margin: '0' }}>Please come again.</p>
      </div>
    </div>
  );
};
