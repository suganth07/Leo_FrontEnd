"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Search, X } from "lucide-react";

interface UploadsTabProps {
  selectedPortfolioId: string;
  file: File | null;
  matchLoading: boolean;
  handleMatch: () => void;
  setFile: (file: File | null) => void;
}

export default function UploadsTab({
  selectedPortfolioId,
  file,
  matchLoading,
  handleMatch,
  setFile,
}: UploadsTabProps) {
    if(selectedPortfolioId){

  return (
    <div className="space-y-6">
      {/* Upload Preview */}
      {file && (
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Upload Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <img
                src={URL.createObjectURL(file)}
                className="w-16 h-16 object-cover rounded-lg border border-border"
                alt="Upload preview"
              />
              <div className="flex-1">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{Math.round(file.size/1024)}KB</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Processing Card */}
      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            AI Face Matching
          </CardTitle>
          <CardDescription>
            Upload a reference photo to find matching faces in the selected portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={() => document.getElementById('file-input')?.click()}
              className="flex items-center gap-2 h-20 text-left justify-start"
              variant="outline"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Upload Reference</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Select a master photo for matching
                </span>
              </div>
            </Button>
            
            <Button
              onClick={handleMatch}
              disabled={matchLoading || !file}
              className="flex items-center gap-2 h-20 text-left justify-start"
              variant="outline"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                  {matchLoading ? (
                    <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {matchLoading ? "Processing..." : "Find Matches"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  AI-powered face recognition
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
}