"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const getThemeIcon = () => {
    if (!mounted) return <Moon size={20} />;
    if (theme === 'dark') return <Moon size={20} />;
    if (theme === 'light') return <Sun size={20} />;
    return <Monitor size={20} />;
  };

  return (
    <nav className="glass-nav">
      <div className="container nav-content">
        <Link href="/" className="logo">
          AkaalFLIX
        </Link>
        <div className="flex-center">
          {profile?.role === 'admin' && (
            <Link href="/admin" className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>Admin</Link>
          )}
          
          {user ? (
            <button onClick={() => auth.signOut()} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
              <UserIcon size={16} /> Sign In
            </Link>
          )}

          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {getThemeIcon()}
          </button>
        </div>
      </div>
    </nav>
  );
}
