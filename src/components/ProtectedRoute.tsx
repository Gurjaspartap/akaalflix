"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (profile && profile.subscription_status !== 'active') {
        // Technically we would redirect to a pricing/subscription page
        // For now, we just alert or block them
        alert("Your subscription is inactive. Please upgrade to watch this movie.");
        router.push("/");
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !user || (profile && profile.subscription_status !== 'active')) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  return <>{children}</>;
}
