"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { fetchUserFromToken, selectUser } from "@/redux/authSlice"
import { addNewMenuCategory } from "@/redux/CompanyCategoryMenuSlice"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
})

interface MenuCategoryFormProps {
  onSuccess: () => void
}

export default function MenuCategoryForm({ onSuccess }: MenuCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    dispatch(fetchUserFromToken())
  }, [dispatch])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      const newCategory = {
        ...values,
        companyId: user?.companyId || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      dispatch(addNewMenuCategory(newCategory))

      toast.success("Menu category created successfully!")
      form.reset()
      onSuccess()
    } catch (error) {
      toast.error("Failed to create menu category")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Appetizers, Main Course, Desserts" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a brief description of this category"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => form.reset()} className="flex-1">
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 bg-purple-500 hover:bg-purple-600">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
