import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Expense } from "@/lib/types/types";
import { useDispatch } from "react-redux";
import { editExpense } from "@/redux/expensesSlice";

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
 
}

export function EditExpenseModal({ isOpen, onClose, expense }: EditExpenseModalProps) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    itemName: expense?.itemName || "",
    quantity: expense?.quantity || 1,
    amount: expense?.amount || 0,
    dateAdded: expense?.dateAdded ? expense.dateAdded : new Date(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!expense) return;

    const updatedExpense: Expense = {
      ...expense,
      ...formData,
      dateAdded: new Date(formData.dateAdded).toISOString(), 
    };

    dispatch(editExpense({ id: expense.id || "", updatedExpense }));
    onClose();
  };
  const expenseDate = new Date(formData!.dateAdded!);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input name="itemName" value={formData.itemName} onChange={handleChange} placeholder="Item Name" />
          <Input name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="Quantity" />
          <Input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Amount" />

          {/* Date Picker for Date Added */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateAdded ? format(expenseDate, "PP") : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.dateAdded ? parseISO(formData.dateAdded.toString()) : undefined}
                onSelect={(selectedDate) => selectedDate && setFormData({ ...formData, dateAdded: selectedDate })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
