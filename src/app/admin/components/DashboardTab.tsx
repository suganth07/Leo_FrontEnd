"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Trash2, CheckCircle2 } from "lucide-react";

interface DashboardTabProps {
  selectedPortfolioId: string;
  encodingStatus: { exists: boolean; created_date?: string } | null;
  isCreatingEncoding: boolean;
  deleteLoading: boolean;
  handleCreateEncoding: () => void;
  handleDeleteEncoding: () => void;
}

export default function DashboardTab({
  selectedPortfolioId,
  encodingStatus,
  isCreatingEncoding,
  deleteLoading,
  handleCreateEncoding,
  handleDeleteEncoding,
}: DashboardTabProps) {
  if (!selectedPortfolioId) {
    return (
      <>
        {/* Stats Cards */}
        {/*  */}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            AI Encoding Management
          </CardTitle>
          <CardDescription>
            Create and manage AI facial recognition encodings for the selected portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Encoding Status Display */}
          {encodingStatus?.exists && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Encoding exists</span>
              </div>
              {encodingStatus.created_date && (
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  Created: {new Date(encodingStatus.created_date).toLocaleString()}
                </p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={handleCreateEncoding}
              disabled={isCreatingEncoding}
              className="flex items-center gap-2 h-20 text-left justify-start"
              variant="outline"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                  {isCreatingEncoding ? (
                    <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                  ) : (
                    <Database className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {isCreatingEncoding ? "Creating Encoding..." : "Create Encoding"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">

                </span>
              </div>
            </Button>
            
            <Button
              onClick={handleDeleteEncoding}
              disabled={deleteLoading || !encodingStatus?.exists}
              className="flex items-center gap-2 h-20 text-left justify-start text-destructive hover:text-destructive"
              variant="outline"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                  {deleteLoading ? (
                    <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-destructive rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {deleteLoading ? "Deleting Encoding..." : "Delete Encoding"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {encodingStatus?.exists ? "Remove AI recognition data" : "No encoding to delete"}
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
