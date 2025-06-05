"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

import { fetchUserFromToken, selectUser } from "@/redux/authSlice"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  unit: z.string().min(1, "Unit is required"),
})

type FormValues = z.infer<typeof formSchema>

interface Ingredient {
  id: string
  name: string
  unit: string
}

interface EditIngredientDialogProps {
  ingredient: Ingredient
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditIngredientDialog({ ingredient, open, onOpenChange, onSuccess }: EditIngredientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
   const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const companyId = user?.companyId;  
      
      useEffect(() => {
        dispatch(fetchUserFromToken());
      }, [dispatch]);
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ingredient.name,
      unit: ingredient.unit,
    },
  })

  // Update form when ingredient changes
  useEffect(() => {
    form.reset({
      name: ingredient.name,
      unit: ingredient.unit,
    })
  }, [ingredient, form])

  const onSubmit = async (values: FormValues) => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "Company ID is missing",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/ingredient", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: ingredient.id,
          ...values,
          companyId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update ingredient")
      }

      toast({
        title: "Success",
        description: "Ingredient has been updated",
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error updating ingredient:", error)
      toast({
        title: "Error",
        description: "Failed to update ingredient",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Ingredient</DialogTitle>
          <DialogDescription>Update the details of this ingredient</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
