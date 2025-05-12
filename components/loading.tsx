"use client"

import { motion } from "framer-motion"

export default function Skeleton() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer circle */}
        <motion.div
          className="w-20 h-20 rounded-full border-4 border-gray-200"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        ></motion.div>

        {/* Spinning loader */}
        <motion.div
          className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-transparent border-t-brand-red"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, rotate: 360 }}
          transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        ></motion.div>

        {/* Inner pulsing circle */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-brand-red/10 rounded-full"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-brand-red rounded-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 0.8, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          ></motion.div>
        </motion.div>
      </div>

      {/* Text with fade-in animation */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-gray-800">Loading</h2>
        <p className="text-gray-600 mt-2">Please wait while we prepare your content</p>
      </motion.div>

      {/* Animated dots */}
      <div className="flex space-x-2 mt-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full bg-brand-red"
            initial={{ opacity: 0.3, y: 0 }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  )
}
