"use client";

import { Button } from "@/components/ui/button";
import { BarChart3, Upload, Settings } from "lucide-react";

type TabType = "dashboard" | "uploads" | "settings";

interface NavigationTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function NavigationTabs({ activeTab, setActiveTab }: NavigationTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b">
      <Button 
        variant={activeTab === "dashboard" ? "default" : "ghost"}
        size="sm"
        onClick={() => setActiveTab("dashboard")}
        className="rounded-none rounded-t-lg border-b-2 border-b-transparent data-[state=active]:border-b-primary"
        data-state={activeTab === "dashboard" ? "active" : "inactive"}
      >
        <BarChart3 className="mr-1.5 h-4 w-4" />
        Dashboard
      </Button>
      <Button 
        variant={activeTab === "uploads" ? "default" : "ghost"}
        size="sm"
        onClick={() => setActiveTab("uploads")}
        className="rounded-none rounded-t-lg border-b-2 border-b-transparent data-[state=active]:border-b-primary"
        data-state={activeTab === "uploads" ? "active" : "inactive"}
      >
        <Upload className="mr-1.5 h-4 w-4" />
        Uploads
      </Button>
      <Button 
        variant={activeTab === "settings" ? "default" : "ghost"}
        size="sm"
        onClick={() => setActiveTab("settings")}
        className="rounded-none rounded-t-lg border-b-2 border-b-transparent data-[state=active]:border-b-primary"
        data-state={activeTab === "settings" ? "active" : "inactive"}
      >
        <Settings className="mr-1.5 h-4 w-4" />
        Settings
      </Button>
    </div>
  );
}
