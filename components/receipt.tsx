import { OrderLine } from "@/lib/types/types";
import React from "react";
import { DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Printer } from "lucide-react";

interface Company {
  name: string;
  logo?: string;
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

  const formatReceiptText = () => {
    let receiptText = `${company.name.toUpperCase()}\n`;
    receiptText += "---------------------------------\n";
    receiptText += `${new Date().toLocaleString()}\n\n`;

    receiptText += `Item           Qty  Price  Total\n`;
    receiptText += `---------------------------------\n`;

    order.orderLines.forEach((line) => {
      const item = line.name.padEnd(12, " ").substring(0, 11);
      const qty = line.quantity.toString().padStart(4, " ");
      const price = formatCurrency(line.price).padStart(8, " ");
      const total = formatCurrency(line.totalPrice).padStart(8, " ");
      receiptText += `${item}  ${qty}  ${price}  ${total}\n`;
    });

    receiptText += `---------------------------------\n`;
    receiptText += `Subtotal:      ${formatCurrency(order.totalPrice)}\n`;
    receiptText += `Discount:     -${formatCurrency(order.discount)}\n`;
    receiptText += `Rounding:      ${formatCurrency(order.rounding)}\n`;
    receiptText += `Total:         ${formatCurrency(order.finalPrice)}\n`;
    receiptText += `---------------------------------\n`;

    receiptText += "  THANK YOU FOR DINING WITH US!  \n";
    receiptText += "        Please come again!       \n";
    receiptText += "---------------------------------\n";

    return receiptText;
  };

  const printReceipt = () => {
    const receiptContent = formatReceiptText();
    const printWindow = window.open("", "_blank", "width=400,height=600");

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @page { margin: 0; } /* Removes browser print headers */
              body { font-family: 'Courier New', monospace; font-size: 14px; text-align: center; }
              pre { margin: 0; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            ${company.logo ? `<img src="${company.logo}" alt="${company.name} Logo" style="max-width: 100px; max-height: 100px; display: block; margin: auto; margin-bottom: 10px;" />` : ''}
            <pre>${receiptContent}</pre>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "Courier New, monospace" }}>
      {company.logo && (
        <img
          src={company.logo}
          alt={`${company.name} Logo`}
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          style={{
            maxWidth: "100px",
            maxHeight: "100px",
            display: "block",
            margin: "auto",
            marginBottom: "10px",
          }}
        />
      )}
      <pre style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>{formatReceiptText()}</pre>
      <button onClick={printReceipt} style={{ marginTop: "10px", padding: "5px 10px", cursor: "pointer" }}>
        Print Receipt
      </button>
      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="w-full sm:w-auto flex items-center justify-center"
          onClick={printReceipt}
        >
          <Printer className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
        <Button className="w-full sm:w-auto bg-primary" onClick={() => {}}>
          Done
        </Button>
      </DialogFooter>
    </div>
  );
};

export default RestaurantReceipt;
