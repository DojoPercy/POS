"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryGrid } from "@/components/inventory/inventory-grid"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { InventoryFilters } from "@/components/inventory/inventory-filters"

import { Button } from "@/components/ui/button"
import { RefreshCw, Clipboard, Download, Package, AlertTriangle, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { jwtDecode } from "jwt-decode"
import { BranchInfo } from "@/components/inventory/branch-info"
import { StockAlerts } from "@/components/inventory/stock-alert"
import { AddStockDialog } from "@/components/inventory/add-stock-dialog"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/redux"
import { getCompanyDetails } from "@/redux/companySlice"
import { fetchUserFromToken, selectUser } from "@/redux/authSlice"


interface InventoryItem {
  id: string
  name: string
  unit: string
  stock: number
  stockId: string | null
  minStock?: number
  maxStock?: number
  category?: string
  lastUpdated?: string
}

interface Branch {
  id: string
  name: string
  location: string
  city: string
  status: string
}

interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  companyId? : string
  [key: string]: any
}

export default function BranchInventoryPage() {
  const [branchInfo, setBranchInfo] = useState<Branch | null>(null)
  const [ingredients, setIngredients] = useState<any[]>([])
  const [inventoryStock, setInventoryStock] = useState<any[]>([])
  const [isLoadingBranch, setIsLoadingBranch] = useState(true)
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(true)
  const [isLoadingStock, setIsLoadingStock] = useState(false)
  const [filterValue, setFilterValue] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [activeTab, setActiveTab] = useState("table")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [userToken, setUserToken] = useState<DecodedToken | null>(null)
  const [companyId, setCompanyId] = useState("");

  const { toast } = useToast()
 const { company } = useSelector((state: RootState) => state.company);
 
const dispatch = useDispatch();
  
  const user = useSelector(selectUser);
  const fetchBranchInfo = useCallback(async (branchId: string) => {
    setIsLoadingBranch(true);
    try {
      const response = await fetch(`/api/branches?id=${branchId}`);
      if (!response.ok) throw new Error("Failed to fetch branch info");
      const data = await response.json();
      setBranchInfo(data);
    } catch (error) {
      console.error("Error fetching branch info:", error);
      toast({
        title: "Error",
        description: "Failed to fetch branch information",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBranch(false);
    }
  },[toast])

  const fetchIngredients = useCallback(async () => {
    setIsLoadingIngredients(true);
    try {
      const response = await fetch(`/api/ingredient?companyId=${company?.id}`);
      if (!response.ok) throw new Error("Failed to fetch ingredients");
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch ingredients",
        variant: "destructive",
      });
    } finally {
      setIsLoadingIngredients(false);
    }
  }, [company?.id, toast])

  const fetchInventoryStock = useCallback(async (branchId: string) => {
    setIsLoadingStock(true);
    try {
      const response = await fetch(`/api/inventory_stock?branchId=${branchId}`);
      if (!response.ok) throw new Error("Failed to fetch inventory stock");
      const data = await response.json();
      setInventoryStock(data);
    } catch (error) {
      console.error("Error fetching inventory stock:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory stock",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStock(false);
    }
  }, [toast])

  const handleRefresh = () => {
    if (user?.branchId) {
      fetchInventoryStock(user.branchId);
      toast({
        title: "Refreshed",
        description: "Inventory data has been updated",
      });
    }
  };
 
  // Fetch user from token on first render
  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  // Fetch company and branch-related data when user is available
  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId));

      if (user.branchId) {
        fetchBranchInfo(user.branchId);
        fetchInventoryStock(user.branchId);
      }
    }
  }, [dispatch, fetchBranchInfo, fetchInventoryStock, user]);

  // Fetch ingredients when company is available
  useEffect(() => {
    if (company?.id) {
      fetchIngredients();
    }
  }, [company?.id, fetchIngredients]);

  

  const handleUpdateStock = async (ingredientId: string, quantity: number) => {
    if (!user?.branchId) return;

    try {
      const response = await fetch("/api/inventory_stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredientId,
          branchId: user.branchId,
          quantity,
        }),
      });

      if (!response.ok) throw new Error("Failed to update stock");

      toast({
        title: "Success",
        description: "Inventory stock updated successfully",
      });
      fetchInventoryStock(user.branchId);
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory stock",
        variant: "destructive",
      });
    }
  };

  const handleAddNewStock = async (ingredientId: string, quantity: number) => {
    if (!user?.branchId) return;

    try {
      const response = await fetch("/api/inventory_stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredientId,
          branchId: user.branchId,
          quantity,
        }),
      });

      if (!response.ok) throw new Error("Failed to add stock");

      toast({
        title: "Success",
        description: "New stock added successfully",
      });
      fetchInventoryStock(user.branchId);
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding stock:", error);
      toast({
        title: "Error",
        description: "Failed to add new stock",
        variant: "destructive",
      });
    }
  };


  // Prepare data for display - merge ingredients with their stock information
  const prepareInventoryData = (): InventoryItem[] => {
    return ingredients.map((ingredient: any) => {
      const stockItem = inventoryStock.find((stock: any) => stock.ingredientId === ingredient.id)
      return {
        ...ingredient,
        stock: stockItem ? stockItem.quantity : 0,
        stockId: stockItem ? stockItem.id : null,
        lastUpdated: stockItem?.updatedAt,
      }
    })
  }

  // Filter and sort the inventory data
  const getFilteredAndSortedData = (): InventoryItem[] => {
    const data = prepareInventoryData()

    // Filter
    const filtered = filterValue
      ? data.filter(
          (item: any) =>
            item.name.toLowerCase().includes(filterValue.toLowerCase()) ||
            item.category?.toLowerCase().includes(filterValue.toLowerCase()),
        )
      : data

    // Sort
    return filtered.sort((a: any, b: any) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortBy === "stock") {
        return sortOrder === "asc" ? a.stock - b.stock : b.stock - a.stock
      } else if (sortBy === "category") {
        return sortOrder === "asc"
          ? (a.category || "").localeCompare(b.category || "")
          : (b.category || "").localeCompare(a.category || "")
      }
      return 0
    })
  }

  const inventoryData = getFilteredAndSortedData()
  const lowStockItems = inventoryData.filter((item) => item.stock < (item.minStock || 10))
  const outOfStockItems = inventoryData.filter((item) => item.stock === 0)

  const exportToCSV = () => {
    const headers = ["Ingredient Name", "Category", "Unit", "Current Stock", "Status", "Last Updated"]
    const csvData = inventoryData.map((item: any) => [
      item.name,
      item.category || "N/A",
      item.unit,
      item.stock,
      item.stock === 0 ? "Out of Stock" : item.stock < (item.minStock || 10) ? "Low Stock" : "In Stock",
      item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : "N/A",
    ])
    const csvContent = [headers.join(","), ...csvData.map((row: any) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `${branchInfo?.name || "branch"}-inventory-${new Date().toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Exported",
      description: "Inventory data exported to CSV",
    })
  }

  const copyToClipboard = () => {
    const headers = ["Ingredient Name", "Category", "Unit", "Current Stock", "Status"]
    const textData = inventoryData.map((item: any) => [
      item.name,
      item.category || "N/A",
      item.unit,
      item.stock,
      item.stock === 0 ? "Out of Stock" : item.stock < (item.minStock || 10) ? "Low Stock" : "In Stock",
    ])
    const textContent = [headers.join("\t"), ...textData.map((row: any) => row.join("\t"))].join("\n")

    navigator.clipboard.writeText(textContent)
    toast({
      title: "Copied",
      description: "Inventory data copied to clipboard",
    })
  }

  const isLoading = isLoadingBranch || isLoadingIngredients || isLoadingStock

  // Get available ingredients that are not yet in stock
  const availableIngredients = ingredients.filter(
    (ingredient) => !inventoryStock.some((stock) => stock.ingredientId === ingredient.id),
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-8 w-8 text-emerald-600" />
            <h1 className="text-3xl font-bold tracking-tight">Branch Inventory</h1>
          </div>
          <p className="text-muted-foreground">Manage inventory for {branchInfo?.name || "your branch"}</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="default"
            onClick={() => setShowAddDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading} title="Refresh inventory">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" onClick={copyToClipboard} title="Copy to clipboard">
            <Clipboard className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={exportToCSV} title="Export to CSV">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Branch Info and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Package className="h-5 w-5" />
                Branch Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBranch ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <BranchInfo branch={branchInfo} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Stock Alerts
              </CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <StockAlerts lowStockItems={lowStockItems} outOfStockItems={outOfStockItems} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Inventory Statistics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>Current stock status for your branch</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <InventoryStats inventoryData={inventoryData} />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Inventory Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Manage stock levels for {branchInfo?.name || "your branch"}</CardDescription>
              </div>
              <InventoryFilters
                filterValue={filterValue}
                onFilterChange={setFilterValue}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
              />
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>

              <TabsContent value="table" className="space-y-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <InventoryTable
                    inventoryData={inventoryData}
                    onUpdateStock={handleUpdateStock}
                    isBranchManager={true}
                  />
                )}
              </TabsContent>

              <TabsContent value="grid">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                  </div>
                ) : (
                  <InventoryGrid
                    inventoryData={inventoryData}
                    onUpdateStock={handleUpdateStock}
                    isBranchManager={true}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Stock Dialog */}
      <AddStockDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        availableIngredients={availableIngredients}
        onAddStock={handleAddNewStock}
      />
    </div>
  )
}
