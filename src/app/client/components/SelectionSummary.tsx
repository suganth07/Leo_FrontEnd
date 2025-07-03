"use client";

import { motion } from "framer-motion";
import { CheckCircle, Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SelectionSummaryProps {
  selectedCount: number;
  downloadLoading: boolean;
  onDownloadSelected: () => void;
}

const SelectionSummary = ({ 
  selectedCount, 
  downloadLoading, 
  onDownloadSelected 
}: SelectionSummaryProps) => {
  if (selectedCount === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border border-border/60">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">{selectedCount} Photos Selected</div>
              <div className="text-sm text-muted-foreground">Ready for download</div>
            </div>
          </div>
          <Button
            onClick={onDownloadSelected}
            disabled={downloadLoading}
            className="flex items-center gap-2"
          >
            {downloadLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download Selected</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SelectionSummary;
