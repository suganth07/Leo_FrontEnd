"use client";

import { ImageIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface GalleryStatsProps {
  totalImages: number;
  filteredImages: number;
  selectedCount: number;
}

const GalleryStats = ({ totalImages, filteredImages, selectedCount }: GalleryStatsProps) => {
  return (
    <Card className="border border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5 text-primary" />
          Gallery Stats
        </CardTitle>
        <CardDescription>Current collection overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Photos:</span>
          <span className="font-semibold">{totalImages}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Filtered:</span>
          <span className="font-semibold">{filteredImages}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Selected:</span>
          <span className="font-semibold text-primary">{selectedCount}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GalleryStats;
