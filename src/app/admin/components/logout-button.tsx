"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication state
    sessionStorage.removeItem('isAuthenticated');
    toast.success("Logged out successfully");
    
    // Redirect to home page
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
