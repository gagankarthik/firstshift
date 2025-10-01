"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
  showLoader?: boolean;
}

// Enhanced NoSSR component to prevent hydration errors and provide smooth loading
export function NoSSR({ children, fallback = null, showLoader = false }: NoSSRProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasMounted(true);
    // Small delay to ensure proper hydration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!hasMounted) {
    if (showLoader) {
      return (
        <div className="flex items-center justify-center p-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      );
    }
    return <>{fallback}</>;
  }

  if (isLoading && showLoader) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}