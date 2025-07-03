"use client";

import { motion } from "framer-motion";
import { Camera } from "lucide-react";

const ClientHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-lg">
          <Camera className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Client Portal</h1>
          <p className="text-muted-foreground">Access your personalized photo collection</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <span>AI-Powered Gallery</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientHeader;
