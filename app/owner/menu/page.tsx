"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Search, Plus, Grid, List, Edit, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchUserFromToken, selectUser } from "@/redux/authSlice"
import { getMenuItemsPerCompany } from "@/redux/companyMenuSlice"
import type { RootState } from "@reduxjs/toolkit"
import IngredientDisplay from "./menu-indregient"
import MenuCategoryForm from "./menu-category"
import MenuItemForm from "./menu-form"

interface MenuItem {
  id: string
  name: string
  description: string
  price: Array<{
    id: string
    name: string
    price: number
    menuItemId: string
    createdAt: string
    updatedAt: string
  }>
  imageUrl?: string
  imageBase64?: string
  categoryId: string
  category?: {
    id: string
    name: string
  }
  ingredients?:
    | Array<{
        id: string
        menuId: string
        ingredientId: string
        amount: number
        ingredient?: {
          name: string
        }
      }>
    | string[]
}

interface MenuCategory {
  id: string
  name: string
  description?: string
  items?: MenuItem[]
}

export default function MenuManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("name")
  const [createItemOpen, setCreateItemOpen] = useState(false)
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [editItemOpen, setEditItemOpen] = useState(false)

  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const { menuItems, isLoading } = useSelector((state: RootState) => state.menu)

  useEffect(() => {
    dispatch(fetchUserFromToken())
  }, [dispatch])

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getMenuItemsPerCompany(user.companyId))
    }
  }, [dispatch, user?.companyId])

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
    const categoryName = item.category?.name || "Uncategorized"
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(item)
    return acc
  }, {})

  // Filter and sort items
  const filteredItems = menuItems.filter((item: MenuItem) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category?.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        const minPriceA = Math.min(...a.price.map((p: { price: any }) => p.price))
        const minPriceB = Math.min(...b.price.map((p: { price: any }) => p.price))
        return minPriceA - minPriceB
      case "price-high":
        const maxPriceA = Math.max(...a.price.map((p: { price: any }) => p.price))
        const maxPriceB = Math.max(...b.price.map((p: { price: any }) => p.price))
        return maxPriceB - maxPriceA
      case "name":
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item)
    setEditItemOpen(true)
  }

  const MenuItemCard = ({ item }: { item: MenuItem }) => {
    const minPrice = Math.min(...item.price.map((p) => p.price))
    const maxPrice = Math.max(...item.price.map((p) => p.price))
    const priceDisplay =
      minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`

    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white">
        <div className="relative">
          <div className="aspect-square overflow-hidden bg-gradient-to-br from-purple-100 to-red-100">
            {item.imageUrl ? (
              <img
                src={item.imageUrl || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-6xl">🍽️</div>
              </div>
            )}
          </div>

          <div className="absolute top-3 right-3 bg-white ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => handleEditItem(item)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="absolute bottom-3 left-3">
            <Badge className="bg-white/90 text-gray-900 font-semibold">{priceDisplay}</Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{item.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

            {/* Price Options */}
            {item.price.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {item.price.map((priceOption) => (
                  <Badge key={priceOption.id} variant="outline" className="text-xs">
                    {priceOption.name}: ${priceOption.price.toFixed(2)}
                  </Badge>
                ))}
              </div>
            )}

            {item.category && (
              <Badge variant="secondary" className="text-xs">
                {item.category.name}
              </Badge>
            )}

            <IngredientDisplay ingredients={item.ingredients || []} maxDisplay={3} className="mt-2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const CategoryCard = ({ categoryName, items }: { categoryName: string; items: MenuItem[] }) => (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-100 to-red-100">
          {items[0]?.imageUrl ? (
            <img
              src={items[0].imageUrl || "/placeholder.svg"}
              alt={categoryName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-8xl">🍽️</div>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-gray-900 font-semibold">{items.length} items</Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-xl text-gray-900">{categoryName}</h3>
          <div className="flex flex-wrap gap-1">
            {items.slice(0, 4).map((item, index) => (
              <span key={index} className="text-sm text-gray-600">
                {item.name}
                {index < Math.min(items.length - 1, 3) && " • "}
              </span>
            ))}
            {items.length > 4 && <span className="text-sm text-gray-500">+{items.length - 4} more</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const MenuItemSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600 mt-1">Manage your restaurant menu items and categories</p>
          </div>

          <div className="flex gap-3">
            <Dialog open={createCategoryOpen} onOpenChange={setCreateCategoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                </DialogHeader>
                <MenuCategoryForm onSuccess={() => setCreateCategoryOpen(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={createItemOpen} onOpenChange={setCreateItemOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-br from-blue-500 to-purple-500 hover:bg-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Menu Item</DialogTitle>
                </DialogHeader>
                <MenuItemForm onSuccess={() => setCreateItemOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(groupedItems).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <MenuItemSkeleton key={index} />
            ))}
          </div>
        ) : selectedCategory === "all" && searchTerm === "" ? (
          /* Category View */
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([categoryName, items]: [any,any]) => (
              <div key={categoryName}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{categoryName}</h2>
                  <Badge variant="outline" className="text-sm">
                    {items.length} items
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.slice(0, 4).map((item: MenuItem) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                  {items.length > 4 && (
                    <Card className="flex items-center justify-center min-h-[200px] border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors cursor-pointer">
                      <div className="text-center">
                        <p className="text-gray-500 font-medium">+{items.length - 4} more items</p>
                        <p className="text-sm text-gray-400">Click to view all</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Items View */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCategory === "all" ? "All Items" : selectedCategory}
                <span className="text-gray-500 ml-2">({sortedItems.length})</span>
              </h2>
            </div>

            {sortedItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first menu item"}
                </p>
                <Dialog open={createItemOpen} onOpenChange={setCreateItemOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-500 hover:bg-purple-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Menu Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Menu Item</DialogTitle>
                    </DialogHeader>
                    <MenuItemForm onSuccess={() => setCreateItemOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Item Dialog */}
        <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <MenuItemForm
                item={selectedItem}
                onSuccess={() => {
                  setEditItemOpen(false)
                  setSelectedItem(null)
                }}
                isEdit
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
