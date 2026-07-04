"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {getThemeIcon()}
          </button>
        </div>
      </div>
    </nav>
  );
}
