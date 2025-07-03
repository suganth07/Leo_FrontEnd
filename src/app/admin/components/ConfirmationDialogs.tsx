"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ConfirmationDialogsProps {
  showConfirmation: boolean;
  showDeleteConfirmation: boolean;
  isCreatingEncoding: boolean;
  deleteLoading: boolean;
  handleConfirmYes: () => void;
  handleConfirmNo: () => void;
  confirmDeleteEncoding: () => void;
  setShowDeleteConfirmation: (show: boolean) => void;
}

export default function ConfirmationDialogs({
  showConfirmation,
  showDeleteConfirmation,
  isCreatingEncoding,
  deleteLoading,
  handleConfirmYes,
  handleConfirmNo,
  confirmDeleteEncoding,
  setShowDeleteConfirmation
}: ConfirmationDialogsProps) {
  return (
    <>
      {/* Confirmation Dialog for Encoding Replace */}
      {showConfirmation && (
        <Card className="border-destructive/50 bg-destructive/5 mb-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">Existing encoding found. Replace it?</p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="destructive"
                  onClick={handleConfirmYes}
                  disabled={isCreatingEncoding}
                >
                  {isCreatingEncoding ? "Replacing..." : "Yes, Replace"}
                </Button>
                <Button variant="outline" onClick={handleConfirmNo}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <Card className="border-destructive/50 bg-destructive/5 mb-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-destructive/20 rounded-full">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <p className="text-lg font-medium">Delete Encoding?</p>
              <p className="text-sm text-muted-foreground">
                This will permanently remove the AI facial recognition data for this portfolio. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="destructive"
                  onClick={confirmDeleteEncoding}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirmation(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
