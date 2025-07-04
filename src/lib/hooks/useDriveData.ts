import { useState, useEffect, useCallback } from 'react';
import { listDriveFolders, listDriveFiles, batchFetchFiles, getFilesCount } from '@/lib/google-drive';

// Types
interface DriveFolder {
  id: string;
  name: string;
}

interface DriveFile {
  id: string;
  name: string;
  url: string;
}

interface UseDriveDataOptions {
  photosRootFolderId?: string;
  enableAutoFetch?: boolean;
}

interface UseDriveDataReturn {
  folders: DriveFolder[];
  images: DriveFile[];
  isLoadingFolders: boolean;
  isLoadingImages: boolean;
  error: string | null;
  fetchFolders: () => Promise<void>;
  fetchImages: (folderId: string, useBatching?: boolean) => Promise<void>;
  clearImages: () => void;
  progress: { loaded: number; total?: number };
}

/**
 * Custom hook for managing Google Drive data with direct API access
 * This provides much faster data fetching compared to backend proxy
 */
export function useDriveData(options: UseDriveDataOptions = {}): UseDriveDataReturn {
  const { photosRootFolderId, enableAutoFetch = true } = options;

  // State
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [images, setImages] = useState<DriveFile[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ loaded: number; total?: number }>({ loaded: 0 });

  /**
   * Fetch folders from Google Drive
   */
  const fetchFolders = useCallback(async () => {
    if (!photosRootFolderId) {
      setError('Photos root folder ID not configured');
      return;
    }

    setIsLoadingFolders(true);
    setError(null);

    try {
      console.log('Fetching folders directly from Google Drive...');
      const driveFolders = await listDriveFolders(photosRootFolderId);
      
      setFolders(driveFolders);
      console.log(`Successfully loaded ${driveFolders.length} folders from Google Drive`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch folders';
      setError(errorMessage);
      console.error('Error fetching folders:', err);
    } finally {
      setIsLoadingFolders(false);
    }
  }, [photosRootFolderId]);

  /**
   * Fetch images from a specific folder
   */
  const fetchImages = useCallback(async (folderId: string, useBatching: boolean = true) => {
    setIsLoadingImages(true);
    setError(null);
    setProgress({ loaded: 0 });

    try {
      console.log(`Fetching images directly from Google Drive folder: ${folderId}`);
      
      if (useBatching) {
        // Use batch fetching for large datasets with progress tracking
        const driveImages = await batchFetchFiles(
          folderId,
          'image/',
          100, // Batch size
          (loaded, total) => {
            setProgress({ loaded, total });
          }
        );
        setImages(driveImages);
        console.log(`Successfully loaded ${driveImages.length} images using batch fetching`);
      } else {
        // Use simple fetching for smaller datasets
        const driveFiles = await listDriveFiles(folderId, 'image/');
        const transformedImages = driveFiles.map(file => ({
          id: file.id,
          name: file.name,
          url: `https://drive.google.com/uc?export=view&id=${file.id}`,
        }));
        setImages(transformedImages);
        setProgress({ loaded: transformedImages.length, total: transformedImages.length });
        console.log(`Successfully loaded ${transformedImages.length} images using simple fetching`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch images';
      setError(errorMessage);
      console.error('Error fetching images:', err);
    } finally {
      setIsLoadingImages(false);
    }
  }, []);

  /**
   * Clear images from state
   */
  const clearImages = useCallback(() => {
    setImages([]);
    setProgress({ loaded: 0 });
  }, []);

  /**
   * Auto-fetch folders on mount if enabled
   */
  useEffect(() => {
    if (enableAutoFetch && photosRootFolderId) {
      fetchFolders();
    }
  }, [fetchFolders, enableAutoFetch, photosRootFolderId]);

  return {
    folders,
    images,
    isLoadingFolders,
    isLoadingImages,
    error,
    fetchFolders,
    fetchImages,
    clearImages,
    progress,
  };
}

/**
 * Helper hook for getting files count without loading all files
 * Useful for progress indication
 */
export function useFilesCount(folderId: string | null) {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    if (!folderId) return;

    setIsLoading(true);
    try {
      const fileCount = await getFilesCount(folderId, 'image/');
      setCount(fileCount);
    } catch (error) {
      console.error('Error getting files count:', error);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return { count, isLoading, refetch: fetchCount };
}
