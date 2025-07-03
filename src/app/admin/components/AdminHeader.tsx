"use client";

import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import LogoutButton from "./logout-button";

interface AdminHeaderProps {
  isLoading: boolean;
  handleRefresh: () => void;
  router: any;
}

export default function AdminHeader({ isLoading, handleRefresh, router }: AdminHeaderProps) {

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your photography studio</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LogoutButton />
        <Button 
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </>
          )}
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => router.push("/client")}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Client Portal
        </Button>
      </div>
    </div>
  );
}
