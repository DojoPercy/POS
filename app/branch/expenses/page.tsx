"use client";

import { Plus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpensesList } from "@/components/expenses-list"
import { AddCategoryDialog } from "@/components/add-category"


export default function ExpensesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your business expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <AddCategoryDialog />
          <Button asChild>
            <Link href="expenses/add-expenses">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>View and manage your recent expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensesList />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="expenses/frequent-items">Manage Frequent Items</Link>
        </Button>
      </div>
    </div>
  )
}

