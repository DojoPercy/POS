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