"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { addNewMenuCategory } from "@/redux/CompanyCategoryMenuSlice"
import { fetchUserFromToken, selectUser } from "@/redux/authSlice"
import { Menu, MenuCategory } from "@prisma/client"

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  companyId: z.string().min(1, {
    message: "Company ID is required.",
  }),
})

export default function MenuCategoryForm() {
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const user = useSelector(selectUser);

  useEffect(() => {
      dispatch(fetchUserFromToken());
  }, [dispatch]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId:"",
    },
  })

  useEffect(() => {
    if (user) {
      form.setValue("companyId", user.companyId ?? "");
    }
  }, [user, form]);
  

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      // Create a new menu category object
      const newCategory = {
        ...values,
       
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      
      dispatch(addNewMenuCategory(newCategory ))
      
     
      form.reset()
      
      // Show success message
      toast({
        title: "Success",
        description: "Menu category has been created successfully.",
      })
    } catch (error) {
      console.error("Failed to create menu category:", error)
      toast({
        title: "Error",
        description: "Failed to create menu category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create Menu Category</CardTitle>
        <CardDescription>
          Add a new category to organize your menu items.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                  <FormDescription>
                    The name of the menu category.
                  </FormDescription>
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
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A short description to help identify this category.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={() => form.reset()}>
          Reset Form
        </Button>
      </CardFooter>
    </Card>
  )
}
