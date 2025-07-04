"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageLoadingScreen from "@/components/ui/PageLoadingScreen";

export default function Home() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Add a brief delay for a smooth loading experience
    const timer = setTimeout(() => {
      router.push("/client");
    }, 1200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <PageLoadingScreen 
      message="Welcome to Leo's Photography"
    />
  );
}
