import { OrderStatus } from '../enums/enums';
export interface DecodedToken {
    role?: string
    userId?: string
    branchId?: string
    companyId?: string
    [key: string]: any
  }
  
 export interface OrderLine {
    menuItemId: string
    name: string
    quantity: number
    notes?: string
    price: number
    totalPrice: number
  }

  export interface Company {
    name: string
    logo: string
    orderProcessingMode: string
    currency: string
    paymentMethods: string[]
    taxRate: number
    enableDiscount: boolean

  }
  export interface MenuCategory {
    id: string;
    name: string;
    description?: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

  export type OrderType = {
    branchName?: String
    id?: string
    waiterId?: string
    branchId?: string
    orderLines?: OrderLine[]
    companyId?: string
    totalPrice?: number
    discount?: number
    rounding?: number
    finalPrice?: number
    payment?: CreatePaymentRequest 
    orderStatus?: OrderStatus
    orderedDate?: string
    requiredDate?: string
    createdAt?: string
    updatedAt?: string
    orderNumber?: string
  }

export type Category ={
  id?:string,
  name: string,
  branchId: string
}

  export type Expense = {
    id?: string,
      itemName: string,
      categoryId: string,
      amount: number,
      quantity: number,
      dateAdded?: string,
      category?: Category
      isFrequent: boolean
  }

  export type Frequent ={ id:string,itemName: string; branchId: string , categoryId: string; quantity: number, isFrequent: boolean}


  export type PriceType = {
    id: string;
    name: string;
    price: number;
    menuItemId: string;
  };
  

  export type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: PriceType[];
    category: string;
    imageBase64: string;
    categoryId?: string;
  };



  export interface Payment {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    paymentStatus: "Pending" | "Completed" | "Failed";
    companyId: string;
    branchId: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface CreatePaymentRequest {
    orderId: string;
    amount: number;
    currency: string;
    paymentStatus: "Pending" | "Completed" | "Failed";
    companyId: string;
    branchId: string;
  }

  export interface UpdatePaymentStatusRequest {
    paymentStatus: "Pending" | "Completed" | "Failed";
  }
