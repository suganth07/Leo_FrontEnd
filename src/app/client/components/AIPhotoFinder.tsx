"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, Upload, X, Search, CheckCircle, XCircle, Loader2 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AIPhotoFinderProps {
  loading: boolean;
  matchLoading: boolean;
  progress: number;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onMatch: () => Promise<void>;
  onSelectAll: () => void;
  onClearAll: () => void;
}

const AIPhotoFinder = ({
  loading,
  matchLoading,
  progress,
  file,
  onFileChange,
  onMatch,
  onSelectAll,
  onClearAll
}: AIPhotoFinderProps) => {
  return (
    <>
      {/* AI Photo Matching */}
      <Card className="border border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Photo Finder
          </CardTitle>
          <CardDescription>Upload your photo to find all similar images using AI</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Upload Preview */}
          {file && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 border rounded-lg flex items-center gap-3 bg-muted/20"
            >
              <img
                src={URL.createObjectURL(file)}
                className="w-12 h-12 object-cover rounded-md"
                alt="Upload preview"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{Math.round(file.size/1024)}KB</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                onClick={() => onFileChange(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Upload Button */}
            <div className="relative">
              <label className="block w-full cursor-pointer group">
                <div className="p-4 rounded-lg border border-dashed hover:border-primary flex flex-col items-center justify-center gap-2 transition-colors min-h-[80px]">
                  <Upload className="w-5 h-5 group-hover:text-primary transition-colors" />
                  <div className="text-xs font-medium text-center">Upload Photo</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              
              {file && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full overflow-hidden border-2 border-primary shadow-lg"
                >
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </div>

            {/* AI Search Button */}
            <Button
              variant="outline"
              className="h-[80px] flex flex-col items-center justify-center gap-1.5 hover:border-primary/50 transition-colors"
              onClick={onMatch}
              disabled={matchLoading}
            >
              {matchLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <div className="text-xs font-medium text-center">
                {matchLoading ? "Searching..." : "Find Photos"}
              </div>
            </Button>

            {/* Select All Button */}
            <Button
              variant="outline"
              className="h-[80px] flex flex-col items-center justify-center gap-1.5 hover:border-primary/50 transition-colors"
              onClick={onSelectAll}
            >
              <CheckCircle className="w-5 h-5" />
              <div className="text-xs font-medium text-center">Select All</div>
            </Button>

            {/* Clear Button */}
            <Button
              variant="outline"
              className="h-[80px] flex flex-col items-center justify-center gap-1.5 hover:border-destructive/50 transition-colors"
              onClick={onClearAll}
            >
              <XCircle className="w-5 h-5 hover:text-destructive" />
              <div className="text-xs font-medium text-center">Clear All</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {loading && progress > 0 && (
        <Card className="border border-border/60">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing images...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AIPhotoFinder;
