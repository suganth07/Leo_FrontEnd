"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Camera, Settings, Eye, EyeOff, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { toast } from "sonner"

const ADMIN_PASSWORD = "admin123" // In production, this should be handled more securely

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isOnAdminPage = pathname === '/admin'

  const handleAdminAccess = () => {
    setShowPasswordDialog(true)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500))

    if (password === ADMIN_PASSWORD) {
      // Set authentication state
      setShowPasswordDialog(false)
      setPassword("")
      setTimeout(() => {
        router.push("/admin")
      }, 1000)
      sessionStorage.setItem('isAuthenticated', 'true')
      toast.success("Access granted! Redirecting to admin panel...")
    } else {
      toast.error("Incorrect password. Please try again.")
    }
    
    setIsLoading(false)
  }

  const handleDialogClose = () => {
    setShowPasswordDialog(false)
    setPassword("")
    setShowPassword(false)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Leo Studio
                  </h1>
                </div>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* Direct Admin Access Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAdminAccess}
                disabled={isOnAdminPage}
                className="flex items-center gap-2 h-10"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isOnAdminPage ? 'Admin (Active)' : 'Admin'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Access Required
            </DialogTitle>
            <DialogDescription>
              Please enter the admin password to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !password}
              >
                {isLoading ? "Verifying..." : "Access Admin"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
