"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import Navbar from "@/components/ui/navbar";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// Component imports
import AdminHeader from "./components/AdminHeader";
import NavigationTabs from "./components/NavigationTabs";
import PortfolioSelection from "./components/PortfolioSelection";
import ConfirmationDialogs from "./components/ConfirmationDialogs";
import DashboardTab from "./components/DashboardTab";
import UploadsTab from "./components/UploadsTab";
import SettingsTab from "./components/SettingsTab";
import ImageGallery from "./components/ImageGallery";
import LightboxModal from "./components/LightboxModal";
import PageLoadingScreen from "@/components/ui/PageLoadingScreen";


// Supabase configuration
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-key';
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fallback.supabase.co';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "uploads" | "settings">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Enhanced state variables for new functionality
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [allImages, setAllImages] = useState<{ id: string; name: string; url: string }[]>([]);
  const [displayImages, setDisplayImages] = useState<{ id: string; name: string; url: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const [isCreatingEncoding, setIsCreatingEncoding] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [pklExists, setPklExists] = useState(false);
  const [encodingStatus, setEncodingStatus] = useState<{exists: boolean, created_date?: string} | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [folderPassword, setFolderPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);
  
  // Authentication check - redirect if not authenticated
  useEffect(() => {
    const authState = sessionStorage.getItem('isAuthenticated');
    if (!authState || authState !== 'true') {
      setPageLoading(true);
      setTimeout(() => {
        toast.error("Access denied. Please authenticate first.");
        router.push('/');
      }, 1000);
    } else {
      setIsAuthenticated(true);
      // Fetch folders from Google Drive
      fetchFolders();
    }
  }, [router]);

  // Fetch folders from Google Drive backend API
  const fetchFolders = async () => {
    try {
      setPageLoading(true);
      const response = await axios.get(`${BASE_URL}/api/folders`);
      setFolders(response.data.folders || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Failed to load folders from Google Drive");
      // Fallback to mock data for UI purposes if API fails
    } finally {
      setTimeout(() => {
        setPageLoading(false);
        setInitialLoadComplete(true);
      }, 800);
    }
  };

  // Fetch images when portfolio is selected
  useEffect(() => {
    if (selectedPortfolioId) {
      fetchImages(selectedPortfolioId);
      checkEncodingStatus(selectedPortfolioId);
      setPklExists(false); // Reset pkl exists state when portfolio changes
    } else {
      setEncodingStatus(null);
      setPklExists(false);
    }
  }, [selectedPortfolioId]);

  // Check if encoding exists for the selected folder
  const checkEncodingStatus = async (folderId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/check_encoding_exists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: folderId }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setEncodingStatus(data);
        setPklExists(data.exists || false);
      } else {
        setEncodingStatus({ exists: false });
        setPklExists(false);
      }
    } catch (error) {
      console.error("Error checking encoding status:", error);
      setEncodingStatus({ exists: false });
      setPklExists(false);
    }
  };

  // Generate bypass URL for QR code
  const bypassUrl = typeof window !== "undefined" && selectedPortfolioId
    ? `${window.location.origin}/client?folderId=${selectedPortfolioId}&bypass=1`
    : "";

  // Filter images based on search term
  const filteredImages = displayImages.filter(image => 
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getGoogleDriveViewUrl(fileId: string) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  async function fetchImages(folderId: string) {
    try {
      const response = await axios.get(`${BASE_URL}/api/images?folder_id=${folderId}`);
      const transformedImages = response.data.images?.map((img: any) => ({
        ...img,
        url: getGoogleDriveViewUrl(img.id),
      })) || [];
      setAllImages(transformedImages);
      setDisplayImages(transformedImages);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
    }
  }

  const handleSetFolderPassword = async () => {
    if (!folderPassword) {
      toast.error("Please enter a password");
      return;
    }
    
    try {
      const selectedFolder = folders.find(folder => folder.id === selectedPortfolioId);
      
      const { error } = await supabase
        .from("folders")
        .upsert({
          folder_id: selectedPortfolioId,
          password: folderPassword,
          folder_name: selectedFolder?.name || "Unknown Folder",
        });
      
      if (error) {
        console.error("Supabase Error:", error);
        toast.error("Failed to set password");
      } else {
        toast.success("Password set successfully");
        setShowPasswordInput(false);
        setFolderPassword("");
      }
    } catch (err) {
      console.error("Error setting password:", err);
      toast.error("Something went wrong");
    }
  };

  const handleCreateEncoding = async () => {
    if (!selectedPortfolioId) {
      toast.error("Please select a portfolio first.");
      return;
    }
    
    setIsCreatingEncoding(true);
    try {
      // Check local encoding status first
      if (encodingStatus?.exists) {
        setPklExists(true);
        setShowConfirmation(true);
        setIsCreatingEncoding(false);
        return;
      }
      
      // If local state says no encoding exists, double-check with backend
      const checkRes = await fetch(`${BASE_URL}/api/check_encoding_exists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: selectedPortfolioId }),
      });
      
      const checkData = await checkRes.json();
      if (!checkRes.ok) throw new Error(checkData.error || "Failed to check encoding");
      
      if (checkData.exists) {
        // Update local state to match backend
        setEncodingStatus({ exists: true, created_date: checkData.created_date });
        setPklExists(true);
        setShowConfirmation(true);
      } else {
        await createEncoding();
      }
    } catch (error) {
      console.error("Error creating encoding:", error);
      toast.error("Something went wrong");
    } finally {
      setIsCreatingEncoding(false);
    }
  };

  const createEncoding = async () => {
    setIsCreatingEncoding(true);
    try {
      const res = await fetch(`${BASE_URL}/api/images?folder_id=${selectedPortfolioId}`);
      const data = await res.json();
      const images = data.images?.map((img: any) => ({
        id: img.id,
        name: img.name,
        path_or_url: getGoogleDriveViewUrl(img.id),
      })) || [];

      const createRes = await fetch(`${BASE_URL}/api/create_encoding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: selectedPortfolioId,
          images: images,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Encoding failed");
      
      toast.success(createData.status || "Encoding created successfully!");
      setPklExists(true);
      setEncodingStatus({ exists: true, created_date: new Date().toISOString() });
      // Refresh encoding status after successful creation
      checkEncodingStatus(selectedPortfolioId);
    } catch (error) {
      console.error("Error creating encoding:", error);
      toast.error("Failed to create encoding");
    } finally {
      setIsCreatingEncoding(false);
      setShowConfirmation(false);
    }
  };

  const handleDeleteEncoding = () => {
    if (!selectedPortfolioId) {
      toast.error("Please select a portfolio first.");
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteEncoding = async () => {
    try {
      setDeleteLoading(true);
      setShowDeleteConfirmation(false);
      
      const res = await fetch(`${BASE_URL}/api/delete_encoding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: selectedPortfolioId }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete encoding");
      
      toast.success(data.status || "Encoding deleted successfully!");
      setPklExists(false);
      setEncodingStatus({ exists: false });
    } catch (error) {
      console.error("Error deleting encoding:", error);
      toast.error("Failed to delete encoding");
    } finally {
      setDeleteLoading(false);
    }
  };

  const deleteEncodings = async () => {
    if (!selectedPortfolioId) {
      toast.error("Please select a portfolio first.");
      return;
    }
    
    try {
      setDeleteLoading(true);
      const res = await fetch(`${BASE_URL}/api/delete_encoding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: selectedPortfolioId }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete encoding");
      
      toast.success(data.status || "Encoding deleted successfully!");
      setPklExists(false);
      setEncodingStatus({ exists: false });
    } catch (error) {
      console.error("Error deleting encoding:", error);
      toast.error("Failed to delete encoding");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmYes = async () => {
    try {
      setShowConfirmation(false);
      setIsCreatingEncoding(true);
      await deleteEncodings();
      await createEncoding();
    } catch (error) {
      toast.error("Failed to replace encoding");
      setIsCreatingEncoding(false);
    }
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
    setPklExists(false);
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current;
    if (canvas) {
      const url = canvas.toDataURL("image/jpeg");
      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-code.jpg";
      a.click();
    }
  };

  const handleMatch = async () => {
    if (!file || !selectedPortfolioId) {
      toast.error("Please select a portfolio and upload an image!");
      return;
    }

    setMatchLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder_id", selectedPortfolioId);

      const response = await fetch(`${BASE_URL}/api/match`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 404) {
        const errorData = await response.json();
        toast.error(errorData.detail || "Encoding file not found. Please create it first.");
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let matchedImages: any[] = [];

      if (!reader) {
        toast.error("Connection failed.");
        return;
      }

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        fullText += decoder.decode(value, { stream: true });
        const events = fullText.split("\n\n");
        fullText = events.pop() || "";
        
        for (const event of events) {
          const jsonLine = event.replace(/^data:\s*/, "");
          if (jsonLine) {
            try {
              const data = JSON.parse(jsonLine);
              if (data.images) {
                const matchedImageIds = data.images.map((img: any) => img.id);
                const res = await fetch(`${BASE_URL}/api/images?folder_id=${selectedPortfolioId}`);
                const imageData = await res.json();
                matchedImages = imageData.images.filter((img: any) =>
                  matchedImageIds.includes(img.id)
                );
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }
      
      setDisplayImages(matchedImages);
      toast.success(`Found ${matchedImages.length} matching images!`);
    } catch (err) {
      console.error("Error matching faces:", err);
      toast.error("Failed to match faces.");
    } finally {
      setMatchLoading(false);
    }
  };

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

  // Show loading or redirect while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }
  

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Dashboard data refreshed");
      setIsLoading(false);
    }, 1200);
  };
  
  const handleCreatePortfolio = () => {
    toast.info("Create portfolio functionality will be implemented in the next phase");
  };

  const handleDeletePortfolio = (id: number) => {
    toast.success(`Portfolio ${id} would be deleted (mock)`);
  };

  const handleEditPortfolio = (id: number) => {
    toast.info(`Edit portfolio ${id} functionality will be implemented in the next phase`);
  };
  
  return (
    <div className="min-h-screen bg-background transition-colors duration-300 relative">
      <AnimatedBackground />
      <Toaster position="top-center" />
      
      {/* Page Loading Screen */}
      {pageLoading && (
        <PageLoadingScreen 
          message={isAuthenticated === false ? "Access denied - redirecting..." : "Loading admin panel..."} 
        />
      )}
      
      {/* Navbar */}
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Admin Header */}
          {initialLoadComplete && (
            <AdminHeader 
              isLoading={isLoading}
              handleRefresh={handleRefresh}
              router={router}
            />
          )}
          
          {/* Navigation Tabs */}
          {initialLoadComplete && (
            <NavigationTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
          
          {/* Portfolio Selection Section */}
          {initialLoadComplete && (
            <PortfolioSelection
              folders={folders}
              selectedPortfolioId={selectedPortfolioId}
              setSelectedPortfolioId={setSelectedPortfolioId}
            />
          )}

          {/* Confirmation Dialogs */}
          {initialLoadComplete && (
            <ConfirmationDialogs
              showConfirmation={showConfirmation}
              showDeleteConfirmation={showDeleteConfirmation}
              isCreatingEncoding={isCreatingEncoding}
              deleteLoading={deleteLoading}
              handleConfirmYes={handleConfirmYes}
              handleConfirmNo={handleConfirmNo}
              confirmDeleteEncoding={confirmDeleteEncoding}
              setShowDeleteConfirmation={setShowDeleteConfirmation}
            />
          )}
          
          {/* Content Area */}
          {initialLoadComplete && (
            <div className="py-4">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <DashboardTab
                selectedPortfolioId={selectedPortfolioId}
                encodingStatus={encodingStatus}
                isCreatingEncoding={isCreatingEncoding}
                deleteLoading={deleteLoading}
                handleCreateEncoding={handleCreateEncoding}
                handleDeleteEncoding={handleDeleteEncoding}
              />
            )}
            
            {/* Uploads Tab */}
            {activeTab === "uploads" && (
              <UploadsTab
                selectedPortfolioId={selectedPortfolioId}
                file={file}
                matchLoading={matchLoading}
                handleMatch={handleMatch}
                setFile={setFile}
              />
            )}
            
            {/* Settings Tab */}
            {activeTab === "settings" && (
              <SettingsTab
                selectedPortfolioId={selectedPortfolioId}
                showQR={showQR}
                setShowQR={setShowQR}
                showPasswordInput={showPasswordInput}
                setShowPasswordInput={setShowPasswordInput}
                folderPassword={folderPassword}
                setFolderPassword={setFolderPassword}
                isPasswordVisible={isPasswordVisible}
                setIsPasswordVisible={setIsPasswordVisible}
                bypassUrl={bypassUrl}
                handleSetFolderPassword={handleSetFolderPassword}
              />
            )}
          </div>
          )}

          {/* Image Gallery Section - Shows when portfolio is selected */}
          {initialLoadComplete && (
            <ImageGallery
              selectedPortfolioId={selectedPortfolioId}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredImages={filteredImages}
              allImages={allImages}
              displayImages={displayImages}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              downloadLoading={downloadLoading}
              setEnlargedIndex={setEnlargedIndex}
              toggleSelectImage={toggleSelectImage}
              handleDownloadSelected={() => handleDownloadSelected()}
              hasMatchedImages={displayImages.length !== allImages.length && displayImages.length > 0}
            />
          )}
          
          {/* Image Lightbox Modal */}
          {initialLoadComplete && (
            <LightboxModal
              enlargedIndex={enlargedIndex}
              filteredImages={filteredImages}
              selectedImages={selectedImages}
              setEnlargedIndex={setEnlargedIndex}
              toggleSelectImage={toggleSelectImage}
              handleDownloadSelected={handleDownloadSelected}
            />
          )}

          {/* Hidden File Input */}
          {initialLoadComplete && (
            <input
              type="file"
              id="file-input"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          )}
          
          {/* Footer */}
          {initialLoadComplete && (
            <div className="mt-16 text-center text-muted-foreground text-sm space-y-1">
              <p>© {new Date().getFullYear()} Leo Photography Studio. Admin Panel v1.0</p>
              <p className="text-xs">Built with Next.js and shadcn/ui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
