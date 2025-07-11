import './globals.css'
import { Inter } from 'next/font/google'
import SideBar from './SideBar'
import { Toaster } from '@/components/toaster'
import { ToastProvider } from '@radix-ui/react-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ToastProvider swipeDirection="right">
      <Toaster />
        <div className="h-[85%]">
          
       
            {children}  
          </div>
        
        </ToastProvider>
      </body>
    </html>
  )
}
