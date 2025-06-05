"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, ShoppingBag, Star, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import type { PriceType, MenuItem } from "@/lib/types/types"

type MenuItemCardProps = {
  item: MenuItem
  currency: string
  onAddToCart: (item: MenuItem, selectedPrice: PriceType, quantity: number) => void
}

export default function MenuItemCard({ item, onAddToCart, currency }: MenuItemCardProps) {
  const [selectedPrice, setSelectedPrice] = useState<PriceType | null>(item.price.length > 0 ? item.price[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToCart = () => {
    if (selectedPrice) {
      onAddToCart(item, selectedPrice, quantity)
      // Reset quantity after adding to cart with animation feedback
      setQuantity(1)
    }
  }

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99))
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  // Mock data for enhanced features - replace with actual data
  const rating = 4.5
  const prepTime = "15-20 min"
  const isPopular = true
  const isAvailable  = true

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={`overflow-hidden h-full flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 ${
          !isAvailable ? "opacity-60" : ""
        }`}
      >
        <CardHeader className="p-0 relative">
          {/* Item image */}
          <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <Image
              src={item.imageUrl || "/placeholder.svg?height=200&width=300"}
              alt={item.name}
              fill
              className={`object-cover transition-transform duration-300 ${isHovered ? "scale-105" : "scale-100"}`}
            />

            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
            
              {!isAvailable && (
                <Badge variant="destructive" className="shadow-md">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Price badge */}
            {selectedPrice && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute bottom-3 right-3"
              >
                <Badge className="text-sm font-semibold px-3 py-1 bg-white/90 text-gray-900 shadow-md border">
                  {currency}
                  {selectedPrice.price.toFixed(2)}
                </Badge>
              </motion.div>
            )}

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Item details */}
          <div className="space-y-3 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 flex-1">{item.name}</h3>
              <div className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <Star className="h-3 w-3 fill-current" />
                <span className="font-medium">{rating}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {item.description || "Delicious menu item prepared with fresh ingredients"}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{prepTime}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Price options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Size & Price:</h4>
            <div className="grid gap-2">
              {item.price.map((price) => (
                <motion.div key={price.id} whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
                  <Button
                    variant={selectedPrice?.id === price.id ? "default" : "outline"}
                    size="sm"
                    className={`w-full justify-between h-10 transition-all duration-200 ${
                      selectedPrice?.id === price.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-gray-50 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPrice(price)}
                    disabled={!isAvailable}
                  >
                    <span className="font-medium">{price.name}</span>
                    <span className="font-semibold">
                      {currency}
                      {price.price.toFixed(2)}
                    </span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 border-t bg-gray-50/50">
          <div className="flex items-center justify-between w-full gap-3">
            {/* Quantity controls */}
            <div className="flex items-center border rounded-lg bg-white shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-lg hover:bg-gray-100"
                onClick={decrementQuantity}
                disabled={quantity <= 1 || !isAvailable}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-12 h-10 flex items-center justify-center border-x bg-gray-50">
                <span className="font-semibold text-gray-900">{quantity}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-lg hover:bg-gray-100"
                onClick={incrementQuantity}
                disabled={quantity >= 99 || !isAvailable}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Add to cart button */}
            <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }} className="flex-1">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedPrice || !isAvailable}
                className="w-full h-10 gap-2 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </Button>
            </motion.div>
          </div>

          {/* Total price preview */}
          {selectedPrice && quantity > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="w-full mt-2 pt-2 border-t"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-gray-900">
                  {currency}
                  {(selectedPrice.price * quantity).toFixed(2)}
                </span>
              </div>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
