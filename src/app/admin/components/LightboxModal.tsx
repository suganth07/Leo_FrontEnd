"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download, CheckSquare, Square } from "lucide-react";

interface LightboxModalProps {
  enlargedIndex: number | null;
  filteredImages: { id: string; name: string; url: string }[];
  selectedImages: Set<string>;
  setEnlargedIndex: (index: number | null) => void;
  toggleSelectImage: (id: string) => void;
  handleDownloadSelected: (imagesToDownload: Set<string>) => void;
}

export default function LightboxModal({
  enlargedIndex,
  filteredImages,
  selectedImages,
  setEnlargedIndex,
  toggleSelectImage,
  handleDownloadSelected,
}: LightboxModalProps) {
  if (enlargedIndex === null || !filteredImages[enlargedIndex]) {
    return null;
  }

  const currentImage = filteredImages[enlargedIndex];

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4"
      onClick={() => setEnlargedIndex(null)}
    >
      {/* Navigation buttons */}
      {enlargedIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white border-0 z-[10000]"
          onClick={(e) => {
            e.stopPropagation();
            setEnlargedIndex(enlargedIndex - 1);
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}
      
      {enlargedIndex < filteredImages.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white border-0 z-[10000]"
          onClick={(e) => {
            e.stopPropagation();
            setEnlargedIndex(enlargedIndex + 1);
          }}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white border-0 z-[10000]"
        onClick={() => setEnlargedIndex(null)}
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Main content */}
      <div 
        className="bg-card/80 backdrop-blur rounded-2xl overflow-hidden shadow-2xl max-w-5xl w-full border border-border/50 z-[10000] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://drive.google.com/file/d/${currentImage.id}/preview`}
          className="w-full aspect-video"
          allow="autoplay"
        />
        
        {/* Controls */}
        <div className="p-4 bg-card/80 backdrop-blur border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant={selectedImages.has(currentImage.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSelectImage(currentImage.id)}
                className="flex items-center gap-2"
              >
                {selectedImages.has(currentImage.id) ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span className="font-medium">{currentImage.name}</span>
              </Button>
            </div>
            
            <Button
              onClick={() => handleDownloadSelected(new Set([currentImage.id]))}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
