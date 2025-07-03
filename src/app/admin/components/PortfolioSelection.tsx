"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, CheckCircle2 } from "lucide-react";

interface PortfolioSelectionProps {
  folders: { id: string; name: string }[];
  selectedPortfolioId: string;
  setSelectedPortfolioId: (portfolioId: string) => void;
}

export default function PortfolioSelection({ 
  folders, 
  selectedPortfolioId, 
  setSelectedPortfolioId 
}: PortfolioSelectionProps) {
  return (
    <Card className="border border-border/60 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          Portfolio Selection
        </CardTitle>
        <CardDescription>
          Select a portfolio to enable advanced features and management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portfolio-select">Active Portfolio</Label>
            <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
              <SelectTrigger>
                <SelectValue placeholder="Select portfolio for enhanced features..." />
              </SelectTrigger>
              <SelectContent>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedPortfolioId && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Portfolio selected - Advanced features are now available in the tabs below</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
