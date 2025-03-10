"use client"

import { Provider } from 'react-redux'
import { store } from '../../redux/index';






export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
        <div className="h-screen">
          <div className="">
            {children}  
          </div>
        </div>
        </Provider>
     
  )
}
