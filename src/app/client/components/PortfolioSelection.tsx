"use client";

import { motion } from "framer-motion";
import { CheckCircle, FolderSearch } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PortfolioSelectionProps {
  folders: { id: string; name: string }[];
  selectedFolderId: string;
  onFolderChange: (value: string) => void;
}

const PortfolioSelection = ({ 
  folders, 
  selectedFolderId, 
  onFolderChange 
}: PortfolioSelectionProps) => {
  return (
    <Card className="border border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FolderSearch className="h-5 w-5 text-primary" />
          Select Portfolio
        </CardTitle>
        <CardDescription>Choose your photo collection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedFolderId}
          onValueChange={(value) => onFolderChange(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose portfolio..." />
          </SelectTrigger>
          <SelectContent>
            {folders?.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedFolderId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 text-sm text-foreground p-2 bg-primary/5 rounded-md"
          >
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Portfolio selected</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioSelection;
