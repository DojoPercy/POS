"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { PriceType, MenuItem } from '@/lib/types/types';

// Types


type MenuItemCardProps = {
  item: MenuItem;
  currency: string;
  onAddToCart: (item: MenuItem, selectedPrice: PriceType, quantity: number) => void;
};

export default function MenuItemCard({ item, onAddToCart, currency }: MenuItemCardProps) {
  const [selectedPrice, setSelectedPrice] = useState<PriceType | null>(
    item.price.length > 0 ? item.price[0] : null
  );
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (selectedPrice) {
      onAddToCart(item, selectedPrice, quantity);
      // Reset quantity after adding to cart
      setQuantity(1);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="p-0">
        {/* Item image */}
        <div className="relative w-full h-40 bg-muted">
          <Image
            src={item.imageBase64 || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover"
          />
          {selectedPrice && (
            <Badge className="absolute bottom-2 right-2 text-sm font-medium px-2 py-1 bg-primary/90 hover:bg-primary">
              {}{selectedPrice.price.toFixed(2)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1">
        {/* Item details */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {item.description}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Price options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Select Size/Option:</h4>
          <div className="grid grid-cols-2 gap-2">
            {item.price.map((price) => (
              <Button
                key={price.id}
                variant={selectedPrice?.id === price.id ? "default" : "outline"}
                size="sm"
                className="w-full justify-between"
                onClick={() => setSelectedPrice(price)}
              >
                <span>{price.name}</span>
                <span>{currency}{price.price.toFixed(2)}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t mt-4">
        <div className="flex items-center justify-between w-full">
          {/* Quantity controls */}
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={incrementQuantity}
              disabled={quantity >= 99}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to cart button */}
          <Button
            onClick={handleAddToCart}
            disabled={!selectedPrice}
            className="gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
