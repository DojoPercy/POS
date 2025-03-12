import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Business Setup - Restaurant POS",
  description: "Set up your business profile to start using the Restaurant POS system",
}

export default function BusinessSetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {children}
    </div>
  )
}

