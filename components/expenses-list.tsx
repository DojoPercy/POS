"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, MoreHorizontal, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDispatch, useSelector } from 'react-redux';
import { RootState , AppDispatch} from '../redux/index';
import { DecodedToken, Expense } from "@/lib/types/types"
import { fetchUser } from "@/lib/auth"
import { jwtDecode } from 'jwt-decode';
import { fetchExpenses } from "@/redux/expensesSlice"



export function ExpensesList() {
  const [date, setDate] = useState<Date>()
  const [searchQuery, setSearchQuery] = useState("")
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, status, error } = useSelector((state: RootState) => state.expenses);
  useEffect(()  => {
     const fetchExpensesPerBranch = async () => {
         
            const token = localStorage.getItem("token");
                    if (!token) {
                      console.error("Token not found");
                      return;
                    }
                    const decodedToken: DecodedToken = jwtDecode(token);

                  dispatch(fetchExpenses({branchId: decodedToken.branchId ?? ""}));
                    console.log("Expenses:", expenses);
                  
                  
  }
  fetchExpensesPerBranch();
}, [dispatch, expenses])
  // Filter expenses based on search query and selected date
  const filteredExpenses = expenses.filter((expense: Expense) => {
    const matchesSearch =
      expense.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category!.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate =
      !date ||
      (expense.dateAdded!.getDate() === date.getDate() &&
        expense.dateAdded!.getMonth() === date.getMonth() &&
        expense.dateAdded!.getFullYear() === date.getFullYear())

    return matchesSearch && matchesDate
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search expenses..."
            className="w-full sm:w-[300px] pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense: Expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.itemName}</TableCell>
                  <TableCell>{expense.category!.name}</TableCell>
                  <TableCell>{expense.quantity}</TableCell>
                  <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

