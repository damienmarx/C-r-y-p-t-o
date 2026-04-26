import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Key, Bell, Save, Plus, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";

export function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"ACCOUNT" | "API_KEYS" | "NOTIFICATIONS">("ACCOUNT");
  const [globalThemes, setGlobalThemes] = useState<any[]>([]);
  
  // Mock Settings State
  const [accountState, setAccountState] = useState({
    email: `${user?.username || 'user'}@osrs-crypto.net`,
    displayName: user?.username || '',
    osrsUsername: user?.osrsUsername || '',
    discordId: user?.discordId || '',
    theme: user?.theme || 'default',
  });

  useEffect(() => {
     fetch("/api/themes").then(r => r.json()).then(setGlobalThemes).catch();
  }, []);

  const [apiKeys, setApiKeys] = useState<{id: string, name: string, key: string, created: string}[]>([]);
  
  const [notifications, setNotifications] = useState({
    tradeExecutions: true,
    priceAlerts: false,
    securityLogins: true,
    marketing: false
  });

  const [showKeyId, setShowKeyId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/keys?userId=${user.id}`);
      if (res.ok) {
         const data = await res.json();
         setApiKeys(data);
      }
    } catch(e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "API_KEYS") fetchKeys();
  }, [activeTab, fetchKeys]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch("/api/profile", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           userId: user.id,
           osrsUsername: accountState.osrsUsername,
           discordId: accountState.discordId,
           theme: accountState.theme
         })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        updateUser(updatedUser);
      }
    } catch(e) {
      console.error(e);
    }
    alert("Configuration state saved securely.");
  };

  const generateApiKey = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        const newKey = await res.json();
        setApiKeys([...apiKeys, newKey]);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const revokeKey = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        setApiKeys(apiKeys.filter(k => k.id !== id));
      }
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <header className="flex flex-col items-start mb-8 pb-6 border-b border-gold/10">
        <h1 className="text-3xl font-serif tracking-widest font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-[#FCD34D] mb-2 drop-shadow-[0_0_15px_rgba(197,160,89,0.3)]">
          Operator Configuration
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] opacity-80">
          Manage digital identity, cryptographic access keys, and alert protocols.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory border-b border-[#1F2937]">
        <button 
          onClick={() => setActiveTab("ACCOUNT")}
          className={cn("flex-shrink-0 snap-start px-4 md:px-6 py-3 transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest border-b-2 hover:bg-[#181B1F]", activeTab === "ACCOUNT" ? "border-gold text-gold-text" : "border-transparent text-[#6B7280]")}
        >
          <div className="flex items-center gap-2"><User className="w-4 h-4" /> Identity</div>
        </button>
        <button 
          onClick={() => setActiveTab("API_KEYS")}
          className={cn("flex-shrink-0 snap-start px-4 md:px-6 py-3 transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest border-b-2 hover:bg-[#181B1F]", activeTab === "API_KEYS" ? "border-gold text-gold-text" : "border-transparent text-[#6B7280]")}
        >
          <div className="flex items-center gap-2"><Key className="w-4 h-4" /> API Keys</div>
        </button>
        <button 
          onClick={() => setActiveTab("NOTIFICATIONS")}
          className={cn("flex-shrink-0 snap-start px-4 md:px-6 py-3 transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest border-b-2 hover:bg-[#181B1F]", activeTab === "NOTIFICATIONS" ? "border-gold text-gold-text" : "border-transparent text-[#6B7280]")}
        >
          <div className="flex items-center gap-2"><Bell className="w-4 h-4" /> Alerts</div>
        </button>
      </div>

      <div className="bg-card p-6 md:p-8 border border-[#1F2937] shadow-2xl rounded-xl min-h-[400px]">
        {/* ACCOUNT TAB */}
        {activeTab === "ACCOUNT" && (
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Operator ID (UUID)</label>
              <input 
                disabled 
                value={user?.id || "N/A"} 
                className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-3 rounded text-[#6B7280] outline-none font-mono text-sm cursor-not-allowed opacity-70" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Display Name</label>
              <input 
                value={accountState.displayName} 
                onChange={e => setAccountState({...accountState, displayName: e.target.value})}
                className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-3 rounded text-white outline-none focus:border-gold/50 transition font-serif" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Secure COMMS Email</label>
              <input 
                type="email"
                value={accountState.email} 
                onChange={e => setAccountState({...accountState, email: e.target.value})}
                className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-3 rounded text-white outline-none focus:border-gold/50 transition font-mono" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">OSRS Character Name</label>
              <input 
                value={accountState.osrsUsername} 
                onChange={e => setAccountState({...accountState, osrsUsername: e.target.value})}
                className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-3 rounded text-white outline-none focus:border-gold/50 transition font-serif"
                placeholder="e.g. Zezima"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Discord Username (for Syndicate Roles)</label>
              <input 
                value={accountState.discordId} 
                onChange={e => setAccountState({...accountState, discordId: e.target.value})}
                className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-3 rounded text-white outline-none focus:border-[#5865F2]/50 transition font-mono"
                placeholder="e.g. username#1234"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Terminal Theme</label>
              <select 
                value={accountState.theme}
                onChange={e => setAccountState({...accountState, theme: e.target.value})}
                className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-3 rounded text-white outline-none focus:border-gold/50 transition font-mono"
              >
                {globalThemes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="flex items-center gap-2 border border-gold text-[#C5A059] bg-[#C5A059]/5 hover:bg-[#C5A059]/10 font-serif tracking-widest px-6 py-3 rounded transition uppercase text-[10px]">
              <Save className="w-4 h-4" /> Commit Identity Changes
            </button>
          </form>
        )}

        {/* API KEYS TAB */}
        {activeTab === "API_KEYS" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-xs text-[#9CA3AF] max-w-lg leading-relaxed">
                Tokens grant full REST access to your account balances and trading capabilities. Do not share these secrets with unauthorized nodes.
              </p>
              <button onClick={generateApiKey} className="flex-shrink-0 flex items-center gap-2 border border-[#10B981] text-[#10B981] bg-[#10B981]/5 hover:bg-[#10B981]/10 font-mono font-bold tracking-widest px-4 py-2 rounded transition uppercase text-[10px]">
                <Plus className="w-4 h-4" /> Provision Key
              </button>
            </div>

            <div className="space-y-4 mt-6">
              {apiKeys.length === 0 ? (
                <div className="text-[10px] uppercase tracking-widest text-[#6B7280] font-mono p-4 border border-[#1F2937] bg-[#0A0B0D] rounded text-center">
                  No cryptographic keys provisioned.
                </div>
              ) : (
                apiKeys.map(keyData => (
                  <div key={keyData.id} className="p-4 bg-[#0A0B0D] border border-[#1F2937] rounded flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-[#374151] transition">
                    <div>
                      <div className="text-sm font-serif text-white mb-1">{keyData.name}</div>
                      <div className="text-[9px] uppercase tracking-widest text-[#6B7280] font-mono">
                        Created: {new Date(keyData.created).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#181B1F] border border-[#1F2937] px-3 py-2 rounded flex items-center gap-3 font-mono text-xs w-full md:w-64">
                        <span className="text-[#10B981] truncate">{showKeyId === keyData.id ? keyData.key : 'sk_osrs_live_' + '•'.repeat(24)}</span>
                      </div>
                      <button 
                        onClick={() => setShowKeyId(showKeyId === keyData.id ? null : keyData.id)}
                        className="p-2 text-[#6B7280] hover:text-white transition bg-[#181B1F] border border-[#1F2937] rounded"
                      >
                        {showKeyId === keyData.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => revokeKey(keyData.id)}
                        className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 transition bg-[#181B1F] border border-[#1F2937] rounded"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "NOTIFICATIONS" && (
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <p className="text-xs text-[#9CA3AF] mb-6">
              Configure alert matrices to control which signals penetrate your focus mode.
            </p>

            <div className="space-y-4 divide-y divide-[#1F2937]">
              {Object.entries(notifications).map(([key, value]) => {
                const title = key.replace(/([A-Z])/g, ' $1').trim();
                return (
                  <div key={key} className="flex items-center justify-between pt-4 first:pt-0">
                    <div>
                      <div className="text-sm font-serif text-white capitalize">{title}</div>
                      <div className="text-[10px] uppercase tracking-widest text-[#6B7280] mt-1">Receive signals regarding {title.toLowerCase()}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={value}
                        onChange={() => setNotifications({...notifications, [key]: !value})}
                      />
                      <div className="w-11 h-6 bg-[#181B1F] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold border border-[#1F2937]"></div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="pt-6">
              <button type="submit" className="flex items-center gap-2 border border-gold text-[#C5A059] bg-[#C5A059]/5 hover:bg-[#C5A059]/10 font-serif tracking-widest px-6 py-3 rounded transition uppercase text-[10px]">
                <Save className="w-4 h-4" /> Update Signal Logic
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
