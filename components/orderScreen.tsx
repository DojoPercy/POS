"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import OrderSummary from "./orderSummary";
import MenuItemCard from "./menu_item_card";

import {  MenuIcon } from "lucide-react"
import { PriceType, Category, MenuCategory } from '../lib/types/types';
import { MenuItem } from "@/lib/types/types";
import { getMenuItemsPerCompany } from "@/redux/companyMenuSlice";
import { fetchUserFromToken, selectUser } from "@/redux/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@reduxjs/toolkit";
import { fetchMenuCategoriesOfCompany } from "@/redux/CompanyCategoryMenuSlice";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { getOrderCounter } from '@/lib/order';

// Types
type CartItem = {
  menuItem: MenuItem;
  selectedPrice: PriceType;
  quantity: number;
};

export default function OrderScreen() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { toast } = useToast();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);


  const { categories } = useSelector((state: any) => state.menuCategories);
  const { menuItems } = useSelector((state: RootState) => state.menu);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  useEffect(() => {
    setIsLoading(true)
    if (user?.companyId) {
      dispatch(getMenuItemsPerCompany(user.companyId));
      dispatch(fetchMenuCategoriesOfCompany(user.companyId));
    ;
    setIsLoading(false)
    }
  }, [dispatch, user?.companyId]);

 
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

 
  const addToCart = (menuItem: MenuItem, selectedPrice: PriceType, quantity: number) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.menuItem.id === menuItem.id && item.selectedPrice.id === selectedPrice.id
      );

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { menuItem, selectedPrice, quantity }];
      }
    });

    toast({
      title: "Added to order",
      description: `${quantity} × ${menuItem.name} (${selectedPrice.name})`,
    });
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      if (newQuantity <= 0) {
        updatedCart.splice(index, 1);
      } else {
        updatedCart[index].quantity = newQuantity;
      }
      return updatedCart;
    });
  };


  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  
  const filteredMenuItems = menuItems.filter((item: MenuItem) => item.categoryId === activeCategory);
  console.log(filteredMenuItems)

  const CategoryList = () => (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-2 px-2">Categories</h2>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-1 p-2">
          {categories.map((category: MenuCategory) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "ghost"}
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => {
                setActiveCategory(category.id)
                setIsMobileMenuOpen(false)
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Mobile category menu */}
      <div className="lg:hidden flex items-center mb-4">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] sm:w-[300px] p-0">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Menu Categories</h2>
            </div>
            <CategoryList />
          </SheetContent>
        </Sheet>

        <h2 className="text-xl font-semibold">{categories.find((c: MenuCategory) => c.id === activeCategory)?.name || "Menu"}</h2>
      </div>

      {/* Desktop category sidebar */}
      <div className="hidden lg:block w-64 border rounded-lg p-4 h-[calc(100vh-150px)] sticky top-24">
        <CategoryList />
      </div>

      {/* Main menu section */}
      <div className="flex-1">
        {/* Category title (desktop only) */}
        <div className="hidden lg:block mb-6">
          <h2 className="text-2xl font-semibold">{categories.find((c: MenuCategory) => c.id === activeCategory)?.name || "Menu"}</h2>
        </div>

        {/* Menu items grid */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4 h-40 animate-pulse bg-muted" />
              ))}
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No items available in this category</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20 lg:pb-4">
              {filteredMenuItems.map((item: MenuItem) => (
                <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Cart section - visible on larger screens, toggleable on mobile */}
      <div className={`lg:w-1/4 lg:block ${isCartOpen ? "block" : "hidden"}`}>
        <OrderSummary cart={cart} updateQuantity={updateCartItemQuantity} onClose={() => setIsCartOpen(false)} />
      </div>

      {/* Mobile cart button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-10">
        <Button size="lg" onClick={() => setIsCartOpen(!isCartOpen)} className="rounded-full h-16 w-16 shadow-lg">
          <ShoppingCart className="h-6 w-6" />
          {totalCartItems > 0 && <Badge className="absolute -top-2 -right-2 px-2 py-1">{totalCartItems}</Badge>}
        </Button>
      </div>
    </div>
  )
}
