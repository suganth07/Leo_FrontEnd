"use client";

import { useState } from "react";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordVerificationProps {
  onVerifyPassword: (password: string) => void;
}

const PasswordVerification = ({ onVerifyPassword }: PasswordVerificationProps) => {
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleVerify = () => {
    onVerifyPassword(password);
  };

  return (
    <Card className="border border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Access Verification
        </CardTitle>
        <CardDescription>Enter your access code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Label htmlFor="password" className="sr-only">Password</Label>
          <Input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Enter access code"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            className="pr-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setIsPasswordVisible(prev => !prev)}
          >
            {isPasswordVisible ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        
        <Button
          onClick={handleVerify}
          className="w-full"
          size="sm"
        >
          <Lock className="w-4 h-4 mr-2" />
          Access Gallery
        </Button>
      </CardContent>
    </Card>
  );
};

export default PasswordVerification;
