"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, X, Square, CheckSquare, Download 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Image {
  id: string;
  name: string;
  url: string;
}

interface LightboxModalProps {
  images: Image[];
  currentIndex: number | null;
  selectedImages: Set<string>;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  onToggleSelect: (id: string) => void;
  onDownload: (id: string) => void;
}

const LightboxModal = ({
  images,
  currentIndex,
  selectedImages,
  onClose,
  onNavigate,
  onToggleSelect,
  onDownload
}: LightboxModalProps) => {
  if (currentIndex === null) return null;

  const currentImage = images[currentIndex];
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 z-20 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        
        {currentIndex < images.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 z-20 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 z-20 text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Main content */}
        <motion.div
          className="bg-card/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl max-w-5xl w-full border border-white/10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            src={`https://drive.google.com/file/d/${currentImage?.id}/preview`}
            className="w-full aspect-video"
            allow="autoplay"
          />
          
          {/* Controls */}
          <div className="p-4 border-t border-border bg-card/90 backdrop-blur">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Button
                variant={selectedImages.has(currentImage?.id) ? "secondary" : "outline"}
                className="flex items-center gap-2"
                onClick={() => onToggleSelect(currentImage?.id)}
              >
                {selectedImages.has(currentImage?.id) ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span className="font-medium">{currentImage?.name}</span>
              </Button>
              
              <Button
                className="studio-gradient"
                onClick={() => onDownload(currentImage?.id)}
              >
                <Download className="mr-2 h-4 w-4" />
                <span>Download Photo</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LightboxModal;
