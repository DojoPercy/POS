import { OrderStatus } from '../enums/enums';
export interface DecodedToken {
  role?: string;
  userId?: string;
  branchId?: string;
  companyId?: string;
  [key: string]: any;
}

export interface OrderLine {
  id?: string;
  menuItemId?: string;
  menuItem?: any;
  quantity: number;
  notes?: string;
  price: number;
  totalPrice: number;
  orderType?: 'MENU_ITEM' | 'INGREDIENT';
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id?: string;
  name: string;
  logo: string;
  orderProcessingMode: string;
  currency: string;
  paymentMethods: string[];
  taxRate: number;
  enableDiscount: boolean;
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
  branchName?: String;
  id?: string;
  waiterId?: string;
  branchId?: string;
  orderLines?: OrderLine[];
  companyId?: string;
  totalPrice?: number;
  discount?: number;
  rounding?: number;
  finalPrice?: number;
  payment?: CreatePaymentRequest;
  orderStatus?: OrderStatus;
  orderType?: 'pickup' | 'delivery'; // New field for order type
  orderedDate?: string;
  requiredDate?: string;
  createdAt?: string;
  updatedAt?: string;
  orderNumber?: string;

  // Customer information fields
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;

  // Delivery information fields
  deliveryAddress?: string;
  deliveryInstructions?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
};

export type Category = {
  id?: string;
  name: string;
  branchId: string;
};

export type Expense = {
  id?: string;
  itemName: string;
  categoryId: string;
  amount: number;
  quantity: number;
  dateAdded?: string;
  category?: Category;
  isFrequent: boolean;
};

export type Frequent = {
  id: string;
  itemName: string;
  branchId: string;
  categoryId: string;
  quantity: number;
  isFrequent: boolean;
};

export type PriceType = {
  id: string;
  name: string;
  price: number;
  menuItemId: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: PriceType[] | PriceType; // Can be array or single object
  category: string;
  imageBase64?: string;
  categoryId?: string;
  isAvailable?: boolean;
};

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  companyId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  companyId: string;
  branchId: string;
  paymentMethod: string;
}

// New types for the order system
export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface DeliveryInfo {
  address: string;
  instructions?: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
}

export interface OrderRequest {
  companyId: string;
  branchId: string;
  waiterId?: string;
  orderType: 'pickup' | 'delivery';
  orderLines: {
    menuItemId: string;
    quantity: number;
    price: number;
    totalPrice: number;
    notes?: string;
  }[];
  totalPrice: number;
  customerInfo: CustomerInfo;
  deliveryInfo?: DeliveryInfo;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
}

export interface Ingredient {
  id?: string;
  name: string;
  unit: string;
  companyId?: string;
}

export interface MenuIngredient {
  id?: string;
  ingredientId: string;
  menuId?: string;
  amount: number;
  ingredient: Ingredient;
}
