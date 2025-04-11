"use client";
import { useAuth } from "../config/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = "/login" 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      }
      setIsChecking(false);
    }
  }, [user, router, loading, redirectTo]);

  // Show nothing while checking authentication
  if (loading || isChecking) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Only render children if user is authenticated
  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
