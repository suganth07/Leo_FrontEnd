"use client";

import { motion } from "framer-motion";
import { 
  Grid3X3, ImageIcon, Maximize2, Download, CheckSquare, X, Target, Users, XCircle 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Image {
  id: string;
  name: string;
  url: string;
}

interface ImageGalleryProps {
  images: Image[];
  filteredImages: Image[];
  allImages: Image[];
  displayImages: Image[];
  allImagesCount: number;
  selectedImages: Set<string>;
  searchTerm: string;
  onImageSelect: (id: string) => void;
  onSingleDownload: (id: string) => void;
  onClearSearch: () => void;
  onShowLightbox: (index: number) => void;
  onSelectAll: (images: Set<string>) => void;
  hasMatchedImages?: boolean;
  isLoadingImages?: boolean;
  progress?: { loaded: number; total?: number };
}

const ImageGallery = ({
  images,
  filteredImages,
  allImages,
  displayImages,
  allImagesCount,
  selectedImages,
  searchTerm,
  onImageSelect,
  onSingleDownload,
  onClearSearch,
  onShowLightbox,
  onSelectAll,
  hasMatchedImages = false,
  isLoadingImages = false,
  progress = { loaded: 0 },
}: ImageGalleryProps) => {
  // Show loading screen only when actively loading images
  // Don't show if loading is false (completed) even if no images found
  if (isLoadingImages && allImages.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-medium">Loading photos...</span>
          </div>
          {progress.total && progress.total > 0 && (
            <div className="w-64 mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{progress.loaded}/{progress.total}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.total ? (progress.loaded / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Filter all images based on search term
  const filteredAllImages = allImages.filter(image => 
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter matched images based on search term
  const filteredMatchedImages = displayImages.filter(image => 
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render image grid component
  const renderImageGrid = (imagesToRender: Image[], startIndex: number = 0) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {imagesToRender.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="relative group cursor-pointer"
        >
          <div 
            className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
              selectedImages.has(image.id) 
                ? 'border-primary shadow-md' 
                : 'border-transparent hover:border-border'
            }`}
            onClick={() => onImageSelect(image.id)}
          >
            <div className="aspect-square relative">
              <img
                src={`https://drive.google.com/thumbnail?id=${image.id}&sz=w300`}
                alt={image.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.classList.remove('opacity-0');
                  img.classList.add('opacity-100');
                }}
              />
              
              {/* Selection overlay */}
              {selectedImages.has(image.id) && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowLightbox(startIndex + index);
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSingleDownload(image.id);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-white text-xs truncate">{image.name}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Conditional rendering based on whether we have matched images
  if (hasMatchedImages && displayImages.length !== allImages.length) {
    // Dual Gallery View - Matched Results + All Images
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Matched Images Section */}
        <Card className="border border-green-500/30 bg-green-50/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-medium">Face Match Results</span>
                <span className="text-sm text-muted-foreground">({filteredMatchedImages.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Only select matched images, preserve existing selections from other sections
                    const currentSelected = new Set(selectedImages);
                    filteredMatchedImages.forEach(img => currentSelected.add(img.id));
                    onSelectAll(currentSelected);
                  }}
                  className="text-xs"
                >
                  <CheckSquare className="w-3 h-3 mr-1" />
                  Select All Matched
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Only clear matched images, preserve portfolio selections
                    const currentSelected = new Set(selectedImages);
                    filteredMatchedImages.forEach(img => currentSelected.delete(img.id));
                    onSelectAll(currentSelected);
                  }}
                  className="text-xs text-red-400"
                >
                  <XCircle className="w-3 h-3 mr-1 text-red-400" />
                  Clear Matched
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredMatchedImages.length > 0 ? (
              renderImageGrid(filteredMatchedImages, 0)
            ) : (
              <div className="py-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? `No matched images found for "${searchTerm}"` : "No face matches found"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Images Section */}
        <Card className="border border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Complete Portfolio</span>
                <span className="text-sm text-muted-foreground">({filteredAllImages.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Only select portfolio images, preserve existing selections from matched section
                    const currentSelected = new Set(selectedImages);
                    filteredAllImages.forEach(img => currentSelected.add(img.id));
                    onSelectAll(currentSelected);
                  }}
                  className="text-xs"
                >
                  <CheckSquare className="w-3 h-3 mr-1" />
                  Select All Portfolio
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Only clear portfolio images, preserve matched selections
                    const currentSelected = new Set(selectedImages);
                    filteredAllImages.forEach(img => currentSelected.delete(img.id));
                    onSelectAll(currentSelected);
                  }}
                  className="text-xs text-red-400"
                >
                  <XCircle className="w-3 h-3 mr-1 text-red-400" />
                  Clear Portfolio
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filteredAllImages.length > 0 ? (
              renderImageGrid(filteredAllImages, filteredMatchedImages.length)
            ) : (
              <div className="py-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? `No images found for "${searchTerm}"` : "No images in portfolio"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Single Gallery View - All Images
  return (
    <Card className="border border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-primary" />
          Photo Gallery
        </CardTitle>
        <CardDescription>
          {filteredImages.length > 0 
            ? `Showing ${filteredImages.length} of ${allImagesCount} photos`
            : "No photos to display"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {filteredImages.length > 0 ? (
          renderImageGrid(filteredImages, 0)
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No Photos Found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchTerm 
                ? `No photos match "${searchTerm}". Try a different search term.`
                : "Upload a photo using AI Photo Finder to get started."
              }
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={onClearSearch}>
                Clear Search
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageGallery;
