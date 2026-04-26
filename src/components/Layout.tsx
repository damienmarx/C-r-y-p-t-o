import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, cn } from "../lib/utils";
import { Bot, LineChart, Wallet, Shield, Coins, Share2, LogOut, Activity, Menu, X, Lock, Landmark, MessageSquare, ArrowRightLeft, Search, Cpu } from "lucide-react";
import { Chatbot } from "./Chatbot";
import { Login } from "./Login";

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalThemes, setGlobalThemes] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/system?userId=admin-1") // Hack to just fetch public themes, but let's assume we can fetch anonymously or using system endpoint. Actually, we have GET /api/themes.
      .catch();
      
    fetch("/api/themes")
      .then(res => res.json())
      .then(data => setGlobalThemes(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!user || !globalThemes.length) {
       // Reset to default
       document.documentElement.style.setProperty("--accent-gold", "#C5A059");
       document.documentElement.style.setProperty("--bg-dark", "#0A0B0D");
       return;
    }
    const theme = globalThemes.find(t => t.id === user.theme || t.name === user.theme);
    if (theme) {
       document.documentElement.style.setProperty("--accent-gold", theme.primary);
       document.documentElement.style.setProperty("--bg-dark", theme.bg);
       document.documentElement.style.setProperty("--color-gold", theme.primary);
    } else {
       document.documentElement.style.setProperty("--accent-gold", "#C5A059");
       document.documentElement.style.setProperty("--bg-dark", "#0A0B0D");
       document.documentElement.style.setProperty("--color-gold", "#C5A059");
    }
  }, [user?.theme, globalThemes]);

  const navItems = [
    { name: "Dashboard", href: "/", icon: Activity },
    { name: "Global Chat", href: "/chat", icon: MessageSquare },
    { name: "P2P Trading", href: "/p2p", icon: ArrowRightLeft },
    { name: "Trading Bots", href: "/bots", icon: Cpu },
    { name: "Block Explorer", href: "/explorer", icon: Search },
    { name: "Exchange", href: "/exchange", icon: LineChart },
    { name: "Banking", href: "/banking", icon: Landmark },
    { name: "Rally Tokens", href: "/tokens", icon: Coins },
    { name: "Referral", href: "/referral", icon: Share2 },
    { name: "Settings", href: "/settings", icon: Wallet },
    { name: "Admin Portal", href: "/admin", icon: Shield, requiresAdmin: true }
  ];

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-[100dvh] bg-[#0A0B0D] text-[#E5E7EB] overflow-hidden font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0D0F12]/90 backdrop-blur border-b border-[#1F2937] z-40 flex items-center justify-between px-4">
        <h1 className="text-sm font-serif tracking-widest font-bold uppercase gold-text flex items-center gap-2">
          <div className="w-6 h-6 bg-card border-gold rounded flex items-center justify-center text-[10px]">O</div>
          OSRS
        </h1>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-[#C5A059] rounded hover:bg-[#181B1F] transition"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 border-r border-[#1F2937] bg-[#0D0F12] flex flex-col justify-between transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div>
          <div className="p-6 border-b border-[#1F2937] flex items-center justify-between">
            <h1 className="text-xl font-serif tracking-widest font-bold uppercase gold-text flex items-center gap-3">
              <div className="w-8 h-8 bg-card border-gold rounded flex items-center justify-center">O</div>
              OSRS Crypto
            </h1>
            <button className="md:hidden text-[#6B7280] p-1" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-5 h-5"/>
            </button>
          </div>
          
          <div className="p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-4">Module Navigation</h3>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const isLocked = item.requiresAdmin && !["ADMIN", "AUDITOR"].includes(user?.role || "");
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-3 md:py-2 rounded transition-colors border active:scale-[0.98]",
                      isActive ? "bg-[#181B1F] text-white border-[#1F2937] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]" : "text-[#6B7280] border-transparent hover:text-[#E5E7EB] hover:bg-[#14161A] hover:border-[#1F2937]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-4 h-4", isActive ? "gold-text" : "text-[#6B7280]")} /> 
                      <span className="text-[10px] font-semibold uppercase tracking-widest">{item.name}</span>
                    </div>
                    {isLocked && <Lock className="w-3 h-3 text-[#6B7280]" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-6 border-t border-[#1F2937] pb-safe">
          <div className="space-y-4">
            <div className="text-xs text-[#6B7280] flex items-center justify-between">
              <div>
                Operator: <span className="text-white font-mono">{user.username}</span>
              </div>
              {user.avatar && (
                <div className="w-8 h-8 rounded border border-gold/50 overflow-hidden ml-2">
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="text-xs text-[#6B7280]">
              <div className="mt-2 flex justify-between items-center bg-[#14161A] p-3 md:p-2 rounded border border-[#1F2937]">
                <span className="text-[10px] uppercase tracking-widest">Bal:</span> 
                <span className="font-mono text-white text-xs">{formatCurrency(user.balances["USD"] || 0)}</span>
              </div>
            </div>
            <div className="flex items-center text-[#10B981] text-[10px] font-bold uppercase mb-2">
              <span className="status-dot"></span>Secure Session Active
            </div>
            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#EF4444] hover:text-white transition w-full p-3 md:p-2 border border-[#EF4444]/20 rounded justify-center bg-[#EF4444]/5 hover:bg-[#EF4444]/20 active:scale-95">
              <LogOut className="w-3 h-3" /> Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full pt-16 md:pt-0">
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 w-full overflow-x-hidden pt-6">
          <Outlet />
        </div>
      </main>

      {/* Persistent AI Assistant */}
      <Chatbot />
    </div>
  );
}
