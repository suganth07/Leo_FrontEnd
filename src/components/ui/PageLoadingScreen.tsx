"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Camera, ArrowRight } from "lucide-react";

interface PageLoadingScreenProps {
  message?: string;
  progress?: number;
  className?: string;
}

const PageLoadingScreen = ({ 
  message = "Loading...", 
  progress,
  className 
}: PageLoadingScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-6 p-8">
        {/* Animated Logo/Icon */}
        <motion.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="p-6 rounded-full bg-primary/10 border border-primary/20"
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.1)",
                "0 0 0 20px rgba(59, 130, 246, 0)",
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Camera className="h-8 w-8 text-primary" />
          </motion.div>
        </motion.div>

        {/* Loading Spinner */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>

        {/* Progress Bar (if progress is provided) */}
        {progress !== undefined && (
          <motion.div
            className="w-64 h-2 bg-muted rounded-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </motion.div>
        )}

        {/* Loading Message */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-foreground">
            {message}
          </h3>
          {progress !== undefined && (
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          )}
        </motion.div>

        {/* Animated Dots */}
        <motion.div
          className="flex space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PageLoadingScreen;
