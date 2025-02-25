interface DecodedToken {
    role: string
    userId?: string
    branchId?: string
    companyId?: string
    [key: string]: any
  }
  
 export interface OrderLine {
    menuItemId: string
    name: string
    quantity: number
    price: number
    totalPrice: number
  }

  export interface Company {
    name: string
    logo: string
  }

  export type OrderType = {
    id: string
    waiterId?: string
    branchId?: string
    orderLines: OrderLine[]
    companyId?: string
    totalPrice: number
    discount: number
    rounding: number
    finalPrice: number
    payment?: any[] // You might want to create a separate Payment type
    isCompleted: boolean
    isCheckedOut: boolean
    orderedDate?: string
    requiredDate?: string
    createdAt: string
    updatedAt?: string
    orderNumber: string
  }