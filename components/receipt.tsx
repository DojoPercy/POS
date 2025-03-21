import React from "react";

interface Company {
  name: string;
  logo?: string;
}

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
  if (!order) return <div>No order data available</div>;

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div>
      {/* Inline CSS inside a <style> tag */}
      <style>
        {`
          .receipt-container {
            font-family: "Courier New", monospace;
            width: 300px;
            padding: 10px;
            margin: auto;
            text-align: center;
          }

          .header h1 {
            font-size: 16px;
            margin: 0 0 5px 0;
          }

          .logo {
            width: 70px;
            height: 70px;
            object-fit: contain;
          }

          .no-logo {
            width: 70px;
            height: 70px;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }

          .items th, .items td {
            border-bottom: 1px solid #ddd;
            text-align: right;
            padding: 5px;
          }

          .items th:first-child, .items td:first-child {
            text-align: left;
          }

          .totals, .payment-info {
            width: 100%;
            margin-bottom: 10px;
          }

          .totals div, .payment-info div {
            display: flex;
            justify-content: space-between;
          }

          .final-total {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 5px 0;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .footer {
            font-size: 9px;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .receipt-container {
              width: 100%;
            }
            .final-total {
              font-size: 12px;
            }
          }
        `}
      </style>

      <div className="receipt-container">
        {/* Header */}
        <div className="header">
          <h1>{company.name}</h1>
          {company.logo ? (
            <img src={company.logo} alt={`${company.name} Logo`} className="logo" />
          ) : (
            <div className="no-logo">No Logo</div>
          )}
          <p>{new Date().toLocaleString()}</p>
        </div>

        {/* Order Table */}
        <table className="items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderLines.map((line, index) => (
              <tr key={index}>
                <td>{line.name}</td>
                <td>{line.quantity}</td>
                <td>{formatCurrency(line.price)}</td>
                <td>{formatCurrency(line.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="totals">
          <div><span>Subtotal:</span><span>{formatCurrency(order.totalPrice)}</span></div>
          <div><span>Discount:</span><span>-{formatCurrency(order.discount)}</span></div>
          <div><span>Rounding:</span><span>{formatCurrency(order.rounding)}</span></div>
        </div>

        {/* Final Total */}
        <div className="final-total">
          <div><span>Total:</span><span>{formatCurrency(order.finalPrice)}</span></div>
        </div>

        {/* Payment Info */}
        <div className="payment-info">
          <div><span>Payment Type:</span><span>{order.paymentType}</span></div>
          <div><span>Amount Received:</span><span>{formatCurrency(order.receivedAmount)}</span></div>
          <div><span>Change:</span><span>{formatCurrency(order.balance)}</span></div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for dining with us!</p>
          <p>Please come again.</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantReceipt;
