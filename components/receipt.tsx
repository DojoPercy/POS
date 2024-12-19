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
}

export const RestaurantReceipt: React.FC<ReceiptProps> = ({ order }) => {
  if (!order) {
    return <div>No order data available</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', width: '300px', padding: '10px' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>Gourmet Delights</h1>
        <p style={{ margin: '0 0 5px 0' }}>123 Tasty Street, Flavortown</p>
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
              <td style={{ textAlign: 'right' }}>${line.price.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>${line.totalPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>${order.totalPrice.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Discount:</span>
          <span>-${order.discount.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Rounding:</span>
          <span>${order.rounding.toFixed(2)}</span>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '5px 0', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Total:</span>
          <span>${order.finalPrice.toFixed(2)}</span>
        </div>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Payment Type:</span>
          <span>{order.paymentType}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Amount Received:</span>
          <span>${order.receivedAmount.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Change:</span>
          <span>${order.balance.toFixed(2)}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '9px' }}>
        <p style={{ margin: '0 0 5px 0' }}>Thank you for dining with us!</p>
        <p style={{ margin: '0' }}>Please come again.</p>
      </div>
    </div>
  );
};

