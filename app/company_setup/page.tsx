"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "../../components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().optional(),
  country: z.string().min(2, "Country must be at least 2 characters"),
  logo: z.string().optional(),
})

export default function CompanySetupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      city: "",
      state: "",
      country: "",
      logo: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    const formData = new FormData()
  
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value)
    })

    try {
      const result = await createCompany(formData)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Company created successfully",
        })
        router.push("/owner/profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        form.setValue("logo", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const createCompany = async (formData: FormData) => {
    try {
      const values = {
        name: formData.get('name') as string,
        location: formData.get('location') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string | undefined,
        country: formData.get('country') as string,
        logo: formData.get('logo') as string | undefined,
      }
  
      const response = await fetch("/api/company", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      })
      return await response.json()
    } catch (error) {
      return { error: "An unexpected error occurred" }
    }
  }
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Company Setup</CardTitle>
          <CardDescription>Create a new company profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter state or province" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={handleLogoChange} />
                    </FormControl>
                    <FormDescription>Upload a logo for your company (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Company"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

