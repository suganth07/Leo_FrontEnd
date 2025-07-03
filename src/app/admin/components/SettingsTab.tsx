"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { QRCodeCanvas } from "qrcode.react";
import { Settings, QrCode, Shield, Download, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface SettingsTabProps {
  selectedPortfolioId: string;
  showQR: boolean;
  setShowQR: (show: boolean) => void;
  showPasswordInput: boolean;
  setShowPasswordInput: (show: boolean) => void;
  folderPassword: string;
  setFolderPassword: (password: string) => void;
  isPasswordVisible: boolean;
  setIsPasswordVisible: (visible: boolean) => void;
  bypassUrl: string;
  handleSetFolderPassword: () => void;
}

export default function SettingsTab({
  selectedPortfolioId,
  showQR,
  setShowQR,
  showPasswordInput,
  setShowPasswordInput,
  folderPassword,
  setFolderPassword,
  isPasswordVisible,
  setIsPasswordVisible,
  bypassUrl,
  handleSetFolderPassword,
}: SettingsTabProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);

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
if(selectedPortfolioId){

  return (
    <div className="space-y-6">
      {/* QR Code Generation */}
      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            QR Code Generation
          </CardTitle>
          <CardDescription>
            Generate QR codes for easy client access to portfolios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showQR ? (
            <Button
              onClick={() => setShowQR(true)}
              className="w-full"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-background p-4 rounded-lg border border-border text-center">
                <QRCodeCanvas 
                  value={bypassUrl} 
                  size={160}
                  className="mx-auto"
                  ref={qrRef}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(bypassUrl);
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Password Management */}
      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Portfolio Security
          </CardTitle>
          <CardDescription>
            Set password protection for the selected portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordInput ? (
            <Button
              onClick={() => setShowPasswordInput(true)}
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Set Portfolio Password
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="portfolio-password">Portfolio Password</Label>
                <div className="relative">
                  <Input
                    id="portfolio-password"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="Enter secure password..."
                    value={folderPassword}
                    onChange={(e) => setFolderPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSetFolderPassword}
                  disabled={!folderPassword}
                  className="flex-1"
                >
                  Set Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordInput(false);
                    setFolderPassword("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
}