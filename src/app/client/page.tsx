"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { motion } from "framer-motion";
import { Toaster } from "sonner";
import { toast } from "sonner";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import Navbar from "@/components/ui/navbar";

// Components
import ClientHeader from "./components/ClientHeader";
import PortfolioSelection from "./components/PortfolioSelection";
import PasswordVerification from "./components/PasswordVerification";
import GalleryStats from "./components/GalleryStats";
import AIPhotoFinder from "./components/AIPhotoFinder";
import SearchBar from "./components/SearchBar";
import SelectionSummary from "./components/SelectionSummary";
import ImageGallery from "./components/ImageGallery";
import LightboxModal from "./components/LightboxModal";
import Footer from "./components/Footer";

// Supabase configuration with fallbacks
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// Only create supabase client if we have valid environment variables
const supabase = NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY 
  ? createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : null;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; 

console.log("Client Page - BASE_URL:", BASE_URL);

export default function ClientPage() {
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [allImages, setAllImages] = useState<{ id: string; name: string; url: string }[]>([]);
  const [displayImages, setDisplayImages] = useState<{ id: string; name: string; url: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [folderPassword, setFolderPassword] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  useEffect(() => {
    async function fetchFolders() {
      try {
        const res = await axios.get<{ folders: { id: string; name: string }[] }>(
          `${BASE_URL}/api/folders`
        );
        setFolders(res.data.folders ?? []);
        console.log("Fetched folders:", res.data.folders);
      } catch (error) {
        console.error("Error fetching folders:", error);
        toast.error("Unable to load folders");
      }
    }
    if (BASE_URL) fetchFolders();
    else console.warn("BASE_URL is not set");
  }, [BASE_URL]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const folderId = params.get("folderId");
    const bypass = params.get("bypass");

    if (folderId) {
      setSelectedFolderId(folderId);
      if (bypass === "1") {
        setIsPasswordVerified(true);
        fetchImages(folderId);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedFolderId && isPasswordVerified) {
      fetchImages(selectedFolderId);
    }
  }, [selectedFolderId, isPasswordVerified]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (enlargedIndex !== null) {
        if (e.key === "ArrowRight") setEnlargedIndex((prev) => (prev !== null ? (prev + 1) % filteredImages.length : null));
        if (e.key === "ArrowLeft") setEnlargedIndex((prev) => (prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : null));
        if (e.key === "Escape") setEnlargedIndex(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enlargedIndex, displayImages.length]);

  const filteredImages = displayImages.filter(image => 
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function fetchImages(folderId: string) {
    try {
      const response = await axios.get(`${BASE_URL}/api/images?folder_id=${folderId}`);
      setAllImages(response.data.images);
      setDisplayImages(response.data.images);
      console.log("Fetched images:", response.data.images.length);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
    }
  }

  async function handleMatch() {
    if (!file || !selectedFolderId) {
      toast.error("Please select a folder and upload an image!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder_id", selectedFolderId);

    try {
      setLoading(true);
      setProgress(0);
      
      const response = await fetch(`${BASE_URL}/api/match`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 404) {
        const errorData = await response.json();
        toast.error(errorData.error || "Encoding file not found. Please contact administrator.");
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("No response body from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let receivedText = "";
      let allMatchedImages: { id: string; name: string; url: string }[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedText += decoder.decode(value, { stream: true });
        const events = receivedText.split("\n\n");
        receivedText = events.pop() || "";
        for (const event of events) {
          if (event.startsWith("data: ")) {
            const parsed = JSON.parse(event.replace("data: ", ""));
            if (parsed.progress !== undefined) setProgress(parsed.progress);
            if (parsed.images) allMatchedImages = parsed.images;
          }
        }
      }

      setDisplayImages(allMatchedImages);
      toast.success(`Found ${allMatchedImages.length} matching photos!`);
    } catch (error) {
      console.error("Error matching faces:", error);
      toast.error("Failed to match faces. Try again.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  async function verifyFolderPassword(password: string) {
    if (!selectedFolderId || !password) {
      toast.error("Please enter a password.");
      return;
    }

    try {
      if (!supabase) {
        toast.error("Database connection not available.");
        return;
      }

      const { data, error } = await supabase
        .from("folders")
        .select("password")
        .eq("folder_id", selectedFolderId)
        .single();

      if (error || !data) {
        toast.error("Folder not found.");
        return;
      }

      console.log("Password verification for folder:", selectedFolderId);

      if (data.password === password) {
        toast.success("Access granted!");
        setIsPasswordVerified(true);
        setFolderPassword(password);
        fetchImages(selectedFolderId);
      } else {
        toast.error("Incorrect password. Try again.");
      }
    } catch (err) {
      console.error("Error verifying password:", err);
      toast.error("Something went wrong.");
    }
  }

  const toggleSelectImage = (id: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedImages(newSelected);
  };

  const handleDownloadSelected = async (imagesToDownload: Set<string> | null = null) => {
    const imagesToProcess = imagesToDownload || selectedImages;
    
    if (imagesToProcess.size === 0) return;
    
    try {
      setDownloadLoading(true);
      
      for (const fileId of imagesToProcess) {
        const metadataRes = await fetch(`${BASE_URL}/api/file-metadata?file_id=${fileId}`);
        if (!metadataRes.ok) throw new Error(`Failed to fetch metadata for ${fileId}`);
        const { name } = await metadataRes.json();

        const fileRes = await fetch(`${BASE_URL}/api/file-download?file_id=${fileId}`);
        if (!fileRes.ok) throw new Error(`Failed to download file ${fileId}`);
        const blob = await fileRes.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", name || `${fileId}.jpg`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      
      toast.success("Download complete!");
    } catch (error) {
      console.error("Error downloading files:", error);
      toast.error("Download failed.");
    } finally {
      setDownloadLoading(false);
    }
  }; 

  const handleSelectAll = () => setSelectedImages(new Set(filteredImages.map(img => img.id)));
  const handleClearAll = () => { 
    setSelectedImages(new Set()); 
    setDisplayImages(allImages); 
    setFile(null); 
  };
  
  const handleFolderChange = (value: string) => {
    setSelectedFolderId(value);
    setIsPasswordVerified(false);
    setDisplayImages([]);
  };

  const handleAIMatch = async () => {
    setMatchLoading(true);
    await handleMatch();
    setMatchLoading(false);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 relative overflow-hidden">
      <AnimatedBackground />
      <Toaster position="top-center" />
      
      {/* Navbar */}
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Client Header */}
          <ClientHeader />

          {/* Portfolio Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Portfolio Selection Card */}
            <PortfolioSelection 
              folders={folders}
              selectedFolderId={selectedFolderId}
              onFolderChange={handleFolderChange}
            />

            {/* Password Verification Card */}
            {selectedFolderId && !isPasswordVerified && (
              <PasswordVerification onVerifyPassword={verifyFolderPassword} />
            )}

            {/* Gallery Stats Card */}
            {selectedFolderId && isPasswordVerified && (
              <GalleryStats 
                totalImages={allImages.length}
                filteredImages={filteredImages.length}
                selectedCount={selectedImages.size}
              />
            )}
          </motion.div>

          {/* AI Photo Finder & Controls */}
          {selectedFolderId && isPasswordVerified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <AIPhotoFinder 
                loading={loading}
                matchLoading={matchLoading}
                progress={progress}
                file={file}
                onFileChange={setFile}
                onMatch={handleAIMatch}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
              />

              {/* Search Bar */}
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />

              {/* Selection Summary */}
              <SelectionSummary 
                selectedCount={selectedImages.size}
                downloadLoading={downloadLoading}
                onDownloadSelected={() => handleDownloadSelected()}
              />
            </motion.div>
          )}

          {/* Image Gallery */}
          {selectedFolderId && isPasswordVerified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <ImageGallery 
                images={allImages}
                filteredImages={filteredImages}
                allImages={allImages}
                displayImages={displayImages}
                allImagesCount={allImages.length}
                selectedImages={selectedImages}
                searchTerm={searchTerm}
                onImageSelect={toggleSelectImage}
                onSingleDownload={(id) => handleDownloadSelected(new Set([id]))}
                onClearSearch={() => setSearchTerm('')}
                onShowLightbox={(index) => setEnlargedIndex(index)}
                onSelectAll={setSelectedImages}
                hasMatchedImages={displayImages.length !== allImages.length && displayImages.length > 0}
              />
            </motion.div>
          )}

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Enhanced Lightbox Modal */}
      <LightboxModal
        images={filteredImages}
        currentIndex={enlargedIndex}
        selectedImages={selectedImages}
        onClose={() => setEnlargedIndex(null)}
        onNavigate={(newIndex) => setEnlargedIndex(newIndex)}
        onToggleSelect={toggleSelectImage}
        onDownload={(id) => handleDownloadSelected(new Set([id]))}
      />
    </div>
  );
}
