"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const Loading = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const visibilityTimer = setTimeout(() => setIsVisible(false), 2000)
    const completeTimer = setTimeout(() => onComplete(), 2500)

    return () => {
      clearTimeout(visibilityTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  const slideVariants = {
    initial: { x: "-100%" },
    animate: { x: "100%" },
    exit: { x: "100%" },
    transition: { duration: 1, ease: "easeInOut" },
  }

  return (
    <AnimatePresence>
          <div className="relative z-10 flex justify-center items-center min-h-screen text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-gray-200 text-lg font-bold tracking-widest"
            >
              LOADING RHD.
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, repeatType: "reverse" }}
              >
                ..
              </motion.span>
            </motion.p>
          </div>
    
    </AnimatePresence>
  )
}

export default Loading

