"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Search, MenuIcon, ChevronRight, Coffee, Utensils } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

import MenuItemCard from "./menu_item_card"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import type { PriceType, MenuCategory } from "../lib/types/types"
import type { MenuItem } from "@/lib/types/types"
import { getMenuItemsPerCompany } from "@/redux/companyMenuSlice"
import { fetchUserFromToken, selectUser } from "@/redux/authSlice"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@reduxjs/toolkit"
import { fetchMenuCategoriesOfCompany } from "@/redux/CompanyCategoryMenuSlice"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { getCompanyDetails } from "@/redux/companySlice"
import { selectOrderById } from "@/redux/orderSlice"
import OrderSummary from "./orderSummary"

// Types
type CartItem = {
  menuItem: MenuItem
  selectedPrice: PriceType
  quantity: number
  notes?: string
}

type OrderScreenProp = {
  orderId?: string
}

export default function OrderScreen({ orderId }: OrderScreenProp) {
  const [activeCategory, setActiveCategory] = useState<string>("")
  const [isEditingExistingOrder, setIsEditingExistingOrder] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [orderNumber, setOrderNumber] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { toast } = useToast()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  const { categories } = useSelector((state: any) => state.menuCategories)
  const { menuItems, isLoading } = useSelector((state: RootState) => state.menu)
  const { company } = useSelector((state: RootState) => state.company)
  const existingOrder = useSelector((state: RootState) => (orderId ? selectOrderById(state, orderId) : null))

  useEffect(() => {
    if (user?.companyId) {
      setIsLoadingData(true)

      Promise.all([
        dispatch(fetchUserFromToken()),
        dispatch(getCompanyDetails(user.companyId)),
        dispatch(getMenuItemsPerCompany(user.companyId)),
        dispatch(fetchMenuCategoriesOfCompany(user.companyId)),
      ]).finally(() => {
        setIsLoadingData(false)
      })
    }
  }, [dispatch, user?.companyId])

  useEffect(() => {
    if (orderId && existingOrder && menuItems && menuItems.length > 0) {
      setIsEditingExistingOrder(true)
      setOrderNumber(existingOrder.orderNumber || "")
      const orderCart: CartItem[] = []

      for (const line of existingOrder.orderLines || []) {
        const menuItem = menuItems.find((item: MenuItem) => item.id === line.menuItemId)
        if (menuItem) {
          const priceOption =
            menuItem.price && menuItem.price.length > 0
              ? menuItem.price.find((p: PriceType) => p.price === line.price)
              : null

          const selectedPrice =
            priceOption || (menuItem.prices && menuItem.prices.length > 0 ? menuItem.prices[0] : null)

          if (selectedPrice) {
            orderCart.push({
              menuItem,
              selectedPrice,
              quantity: line.quantity || 1,
              notes: line.notes || "",
            })
          }
        }
      }

      setCart(orderCart)
      setIsLoadingData(false)
    }
  }, [orderId, existingOrder, menuItems])

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id)
    }
  }, [categories, activeCategory])

  const addToCart = (menuItem: MenuItem, selectedPrice: PriceType, quantity: number, notes = "") => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.menuItem.id === menuItem.id && item.selectedPrice.id === selectedPrice.id,
      )

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex].quantity += quantity
        if (notes) {
          updatedCart[existingItemIndex].notes = notes
        }
        return updatedCart
      } else {
        return [...prevCart, { menuItem, selectedPrice, quantity, notes }]
      }
    })

    toast({
      title: "Added to order",
      description: `${quantity} × ${menuItem.name} (${selectedPrice.name})`,
    })
  }

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart]
      if (newQuantity <= 0) {
        updatedCart.splice(index, 1)
      } else {
        updatedCart[index].quantity = newQuantity
      }
      return updatedCart
    })
  }

  const updateCartItemNotes = (index: number, notes: string) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart]
      updatedCart[index].notes = notes
      return updatedCart
    })
  }

  const totalCartItems = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0

  const filteredMenuItems =
    menuItems && menuItems.length > 0
      ? menuItems.filter(
          (item: MenuItem) =>
            item.categoryId === activeCategory &&
            (searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase())),
        )
      : []

  const CategoryList = () => {
    const getCategoryIcon = (categoryName: string) => {
      // You can expand this with more icons based on category names
      if (categoryName.toLowerCase().includes("drink") || categoryName.toLowerCase().includes("beverage")) {
        return <Coffee className="h-4 w-4 mr-2" />
      }
      return <Utensils className="h-4 w-4 mr-2" />
    }

    return (
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-4 px-2 text-gray-800">Categories</h2>
        <ScrollArea className="h-[calc(90vh-200px)]">
          <div className="space-y-1 p-2">
            {categories && categories.length > 0 ? (
              categories.map((category: MenuCategory) => (
                <motion.div key={category.id} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Button
                    variant={activeCategory === category.id ? "default" : "ghost"}
                    className={`w-full justify-between text-left h-auto py-3 px-4 rounded-lg ${
                      activeCategory === category.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      setActiveCategory(category.id)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <span className="flex items-center">
                      {getCategoryIcon(category.name)}
                      {category.name}
                    </span>
                    {activeCategory === category.id && <ChevronRight className="h-4 w-4" />}
                  </Button>
                </motion.div>
              ))
            ) : (
              <div className="text-gray-500 p-2">No categories available</div>
            )}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-gray-50 min-h-screen">
      {/* Mobile category menu */}
      <div className="lg:hidden flex items-center justify-between mb-4 px-4 py-3 bg-white shadow-sm  top-0 z-20">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 border-r border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Menu Categories</h2>
            </div>
            <CategoryList />
          </SheetContent>
        </Sheet>

        <h2 className="text-xl font-semibold text-gray-800">
          {categories && categories.length > 0 && activeCategory
            ? categories.find((c: MenuCategory) => c.id === activeCategory)?.name || "Menu"
            : "Menu"}
        </h2>

        <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(!isCartOpen)} className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalCartItems > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
              {totalCartItems}
            </Badge>
          )}
        </Button>
      </div>

      {/* Desktop category sidebar */}
      <div className="hidden lg:block w-72 border-r border-gray-200 bg-white rounded-lg shadow-sm p-4 h-[calc(100vh-150px)]  top-24">
        <CategoryList />
      </div>

      {/* Main menu section */}
      <div className="flex-1 px-4 lg:px-0">
        <div className=" top-0 lg:top-24 z-10 bg-gray-50 pt-4 pb-2">
          <div className="hidden lg:flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {categories && categories.length > 0 && activeCategory
                ? categories.find((c: MenuCategory) => c.id === activeCategory)?.name || "Menu"
                : "Menu"}
            </h2>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[250px] bg-white border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="lg:hidden relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Menu items grid */}
        <ScrollArea className="h-[calc(100vh-250px)] lg:h-[calc(100vh-220px)] pb-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4 h-40 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-500 py-8">No items available in this category</p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20 lg:pb-4">
              <AnimatePresence>
                {filteredMenuItems.map((item: MenuItem) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} currency={company?.currency ?? "GHS"} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Order summary */}
      <div className={`lg:w-96 lg:block ${isCartOpen ? "block fixed inset-0 z-50 bg-black/50" : "hidden"}`}>
        <div className={`h-full ${isCartOpen ? "bg-white w-full max-w-md ml-auto" : ""}`}>
          <OrderSummary
            cart={cart}
            updateQuantity={updateCartItemQuantity}
            updateNotes={updateCartItemNotes}
            onClose={() => setIsCartOpen(false)}
            isEditingExistingOrder={isEditingExistingOrder}
            orderNumber={orderNumber}
            orderId={orderId}
          />
        </div>
      </div>

      {/* Mobile cart button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-10">
        <Button size="lg" onClick={() => setIsCartOpen(!isCartOpen)} className="rounded-full h-14 w-14 shadow-lg">
          <ShoppingCart className="h-6 w-6" />
          {totalCartItems > 0 && (
            <Badge className="absolute -top-2 -right-2 px-2 py-1 min-w-[24px]">{totalCartItems}</Badge>
          )}
        </Button>
      </div>
    </div>
  )
}
