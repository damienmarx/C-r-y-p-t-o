import React, { useState, useEffect } from "react";
import { formatCurrency } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, AlertTriangle, Key, Users, Activity, Terminal, Database, Send, Save, Trash2, Plus } from "lucide-react";

export function Admin() {
  const { user } = useAuth();
  const [systemData, setSystemData] = useState<{ logs: any[], users: any[], transactions: any[], tiers?: any[], themes?: any[] } | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"TRANSCRIPTION" | "USERS" | "INFRA" | "MARKETS" | "TIERS" | "THEMES" | "NARRATIVES" | "EVENTS">("TRANSCRIPTION");
  const [infraData, setInfraData] = useState<any>(null);
  const [marketData, setMarketData] = useState<Record<string, number>>({});
  const [newAsset, setNewAsset] = useState({ asset: "", price: "" });
  const [narratives, setNarratives] = useState<{id:string, name:string, prompt:string, target:string}[]>([]);
  const [events, setEvents] = useState<{id:string, name:string, date:string, platform:string, status:string}[]>([]);

  const isReadOnly = user?.role === "AUDITOR";

  const fetchSystemData = () => {
    if (!user || !["ADMIN", "AUDITOR"].includes(user.role)) {
      setUnauthorized(true);
      return;
    }
    setUnauthorized(false);
    fetch(`/api/admin/system?userId=${user.id}`)
      .then(r => r.json())
      .then(d => {
        setSystemData({ logs: d.auditLogs || [], users: d.users || [], transactions: d.transactions || [], tiers: d.tiers || [], themes: d.themes || [] });
        if (d.narratives) setNarratives(d.narratives);
        if (d.events) setEvents(d.events);
      })
      .catch(e => console.error(e));

    fetch(`/api/admin/infrastructure?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setInfraData(d))
      .catch(console.error);

    fetch(`/api/market`)
      .then(r => r.json())
      .then(d => setMarketData(d))
      .catch(console.error);
  }

  useEffect(() => {
    fetchSystemData();
  }, [user]);

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!user) return;
    const res = await fetch("/api/admin/system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        updates: { users: [{ id: userId, role: newRole }] }
      })
    });
    if (res.ok) fetchSystemData();
  };

  const handleUpdateMarketAsset = async (asset: string, price: string) => {
    if (!user) return;
    const res = await fetch("/api/admin/market", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, asset, price })
    });
    if (res.ok) fetchSystemData();
  };

  const handleDeleteMarketAsset = async (asset: string) => {
    if (!user) return;
    const res = await fetch(`/api/admin/market/${asset}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id })
    });
    if (res.ok) fetchSystemData();
  };

  const handleSaveTiers = async () => {
    if (!user || !systemData?.tiers) return;
    const res = await fetch("/api/admin/tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, tiers: systemData.tiers })
    });
    if (res.ok) fetchSystemData();
  };

  const handleSaveThemes = async () => {
    if (!user || !systemData?.themes || isReadOnly) return;
    const res = await fetch("/api/admin/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, themes: systemData.themes })
    });
    if (res.ok) fetchSystemData();
  };

  const handleSaveNarratives = async () => {
    if (!user || isReadOnly) return;
    const res = await fetch("/api/admin/narratives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, narratives })
    });
    if (res.ok) fetchSystemData();
  };

  const handleSaveEvents = async () => {
    if (!user || isReadOnly) return;
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, events })
    });
    if (res.ok) fetchSystemData();
  };

  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-[#EF4444] glow-red" />
        <h2 className="text-2xl font-serif tracking-widest text-white">ACCESS DENIED</h2>
        <p className="text-[#6B7280] text-[10px] uppercase tracking-widest font-mono">Administrative privileges are required for system configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-gold/10">
        <div>
          <h1 className="text-3xl font-serif tracking-widest font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-[#FCD34D] mb-2 drop-shadow-[0_0_15px_rgba(197,160,89,0.3)]">
            System Overseer V.26
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] opacity-80">
            God-Mode transcription & demographic modulation.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#10B981]/10 to-transparent border-l-2 border-[#10B981] rounded-r shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-md">
          <Key className="w-4 h-4 text-[#10B981]" /> 
          <span className="text-[#10B981] text-[10px] font-mono font-bold tracking-widest uppercase">
            Quant-Secure Session
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        <button 
          onClick={() => setActiveTab("TRANSCRIPTION")}
          className={`flex-shrink-0 snap-start px-4 md:px-6 py-3 rounded-t-lg transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest ${activeTab === "TRANSCRIPTION" ? "bg-card/80 backdrop-blur-xl border border-[#1F2937] border-b-0 text-gold-text shadow-[0_-5px_15px_rgba(197,160,89,0.05)]" : "text-[#6B7280] hover:text-[#9CA3AF]"}`}
        >
          <div className="flex items-center gap-2"><Terminal className="w-4 h-4" /> Omni-Transcription</div>
        </button>
        <button 
          onClick={() => setActiveTab("USERS")}
          className={`flex-shrink-0 snap-start px-4 md:px-6 py-3 rounded-t-lg transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest ${activeTab === "USERS" ? "bg-card/80 backdrop-blur-xl border border-[#1F2937] border-b-0 text-white shadow-[0_-5px_15px_rgba(255,255,255,0.05)]" : "text-[#6B7280] hover:text-[#9CA3AF]"}`}
        >
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Global Demographics & Config</div>
        </button>
        <button 
          onClick={() => setActiveTab("INFRA")}
          className={`flex-shrink-0 snap-start px-4 md:px-6 py-3 rounded-t-lg transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest ${activeTab === "INFRA" ? "bg-card/80 backdrop-blur-xl border border-[#1F2937] border-b-0 text-white shadow-[0_-5px_15px_rgba(255,255,255,0.05)]" : "text-[#6B7280] hover:text-[#9CA3AF]"}`}
        >
          <div className="flex items-center gap-2"><Database className="w-4 h-4" /> Node Infrastructure</div>
        </button>
        <button 
          onClick={() => setActiveTab("MARKETS")}
          className={`flex-shrink-0 snap-start px-4 md:px-6 py-3 rounded-t-lg transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest ${activeTab === "MARKETS" ? "bg-card/80 backdrop-blur-xl border border-[#1F2937] border-b-0 text-white shadow-[0_-5px_15px_rgba(255,255,255,0.05)]" : "text-[#6B7280] hover:text-[#9CA3AF]"}`}
        >
          <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Global Liquidity</div>
        </button>
        <button 
          onClick={() => setActiveTab("TIERS")}
          className={`flex-shrink-0 snap-start px-4 md:px-6 py-3 rounded-t-lg transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest ${activeTab === "TIERS" ? "bg-card/80 backdrop-blur-xl border border-[#1F2937] border-b-0 text-[#C5A059] shadow-[0_-5px_15px_rgba(197,160,89,0.05)]" : "text-[#6B7280] hover:text-[#9CA3AF]"}`}
        >
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Custom Ranks</div>
        </button>
        <button 
          onClick={() => setActiveTab("THEMES")}
          className={`flex-shrink-0 snap-start px-4 md:px-6 py-3 rounded-t-lg transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest ${activeTab === "THEMES" ? "bg-card/80 backdrop-blur-xl border border-[#1F2937] border-b-0 text-[#C5A059] shadow-[0_-5px_15px_rgba(197,160,89,0.05)]" : "text-[#6B7280] hover:text-[#9CA3AF]"}`}
        >
          <div className="flex items-center gap-2"><Terminal className="w-4 h-4" /> Global Themes</div>
        </button>
        <button 
          onClick={() => setActiveTab("NARRATIVES")}
          className={`flex-shrink-0 snap-start px-4 md:px-6 py-3 rounded-t-lg transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest ${activeTab === "NARRATIVES" ? "bg-card/80 backdrop-blur-xl border border-[#1F2937] border-b-0 text-[#C5A059] shadow-[0_-5px_15px_rgba(197,160,89,0.05)]" : "text-[#6B7280] hover:text-[#9CA3AF]"}`}
        >
          <div className="flex items-center gap-2"><Terminal className="w-4 h-4" /> Narrative Prompts</div>
        </button>
        <button 
          onClick={() => setActiveTab("EVENTS")}
          className={`flex-shrink-0 snap-start px-4 md:px-6 py-3 rounded-t-lg transition-all text-[10px] md:text-xs font-serif uppercase tracking-widest ${activeTab === "EVENTS" ? "bg-card/80 backdrop-blur-xl border border-[#1F2937] border-b-0 text-white shadow-[0_-5px_15px_rgba(255,255,255,0.05)]" : "text-[#6B7280] hover:text-[#9CA3AF]"}`}
        >
          <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Event Scheduler</div>
        </button>
      </div>

      <div className="bg-card/70 backdrop-blur-2xl border border-[#1F2937] shadow-2xl rounded-b-xl rounded-tr-xl overflow-hidden min-h-[500px]">
        {activeTab === "TRANSCRIPTION" && (
          <div className="p-0">
            <div className="p-4 border-b border-[#1F2937]/50 bg-black/40 flex items-center justify-between">
               <span className="text-[10px] text-[#6B7280] uppercase tracking-widest hidden sm:inline">Real-time system state transcriptions</span>
               <span className="text-[10px] text-[#6B7280] uppercase tracking-widest sm:hidden">System State</span>
               <Activity className="w-4 h-4 text-gold-text animate-pulse" />
            </div>
            <div className="overflow-x-auto p-4 max-h-[600px] overflow-y-auto w-full">
              <div className="space-y-3 font-mono text-[10px] min-w-min">
                {systemData?.logs.map((log) => (
                  <div key={log.id} className="p-3 bg-[#0A0B0D]/50 border border-[#1F2937] rounded flex flex-col md:flex-row gap-2 md:gap-4 hover:border-gold/30 transition shadow-sm w-full md:w-auto">
                     <div className="md:w-1/4">
                       <div className="text-[#9CA3AF] mb-1">{new Date(log.timestamp).toLocaleString()}</div>
                       <div className="text-[#6B7280] truncate text-[9px] w-[200px] md:w-full">ID: {log.id}</div>
                     </div>
                     <div className="md:w-1/4 flex-shrink-0">
                       <span className={`px-2 py-1 bg-black rounded inline-block font-bold mt-1 md:mt-0 ${
                         log.severity === 'CRITICAL' ? 'text-[#EF4444] border border-[#EF4444]/30' : 
                         log.severity === 'WARNING' ? 'text-[#C5A059] border border-[#C5A059]/30' : 
                         'text-[#3B82F6] border border-[#3B82F6]/30'
                       }`}>
                         [{log.severity}] {log.action}
                       </span>
                     </div>
                     <div className="md:w-2/4 text-[#9CA3AF] whitespace-pre-wrap break-words md:break-all overflow-hidden mt-1 md:mt-0">
                       {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "USERS" && (
           <div className="p-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {systemData?.users.map(u => (
                 <div key={u.id} className="relative group">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent blur-md rounded-xl group-hover:from-white/10 transition"></div>
                   <div className="relative bg-[#0A0B0D]/80 backdrop-blur-lg border border-[#1F2937] rounded-xl p-6 z-10 transition hover:border-[#374151]">
                     <div className="flex justify-between items-start mb-4 border-b border-[#1F2937] pb-4">
                       <div>
                         <h3 className="text-lg font-serif font-bold text-white tracking-widest">{u.username}</h3>
                         <div className="text-[10px] text-[#6B7280] font-mono mt-1">UUID: {u.id}</div>
                       </div>
                       <select 
                         disabled={isReadOnly}
                         value={u.role}
                         onChange={(e) => updateUserRole(u.id, e.target.value)}
                         className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase outline-none cursor-pointer border ${u.role === "ADMIN" ? "bg-gold/10 text-[#C5A059] border-[#C5A059]/30" : "bg-[#181B1F] text-white border-[#1F2937]"}`}
                       >
                         <option value="USER">Base User</option>
                         <option value="TRADER">Trader</option>
                         <option value="AUDITOR">Auditor</option>
                         <option value="ADMIN">Overseer (Admin)</option>
                       </select>
                     </div>

                     <div className="flex gap-4 mb-4 border-b border-[#1F2937] pb-4">
                        <div className="flex flex-col">
                           <span className="text-[10px] uppercase tracking-widest text-[#6B7280] font-mono mb-1">Rank</span>
                           <span className="text-xs text-[#C5A059] font-bold font-serif">{u.tier || "Unranked"}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] uppercase tracking-widest text-[#6B7280] font-mono mb-1">OSRS Main</span>
                           <span className="text-xs text-white font-mono">{u.osrsUsername || "Not Linked"}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] uppercase tracking-widest text-[#6B7280] font-mono mb-1">Discord</span>
                           <span className="text-xs text-[#5865F2] font-mono">{u.discordId || "Not Linked"}</span>
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                       <h4 className="text-[10px] uppercase font-semibold text-[#6B7280] tracking-widest flex items-center gap-2"><Database className="w-3 h-3" /> Liquidity Pool Allocations</h4>
                       <div className="grid grid-cols-2 gap-3">
                         {Object.entries(u.balances).map(([asset, amount]) => (
                           <div key={asset} className="bg-[#181B1F]/50 p-3 rounded border border-[#1F2937]/50">
                             <div className="text-[9px] uppercase tracking-widest text-[#6B7280] mb-1">{asset}</div>
                             <div className="font-mono text-sm text-white">{(amount as number).toLocaleString(undefined, {maximumFractionDigits: 4})}</div>
                           </div>
                         ))}
                       </div>
                     </div>
                     
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}
        {activeTab === "INFRA" && infraData && (
           <div className="p-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-[#0A0B0D] p-6 rounded-xl border border-[#1F2937]">
                 <h3 className="text-sm font-serif font-bold text-white tracking-widest mb-4">Server Node</h3>
                 <div className="space-y-4 font-mono text-xs">
                   <div className="flex justify-between border-b border-[#1F2937] pb-2">
                     <span className="text-[#6B7280]">ENVIRONMENT</span>
                     <span className="text-[#10B981]">{infraData.environment}</span>
                   </div>
                   <div className="flex justify-between border-b border-[#1F2937] pb-2">
                     <span className="text-[#6B7280]">PORT BINDING</span>
                     <span className="text-white">{infraData.port}</span>
                   </div>
                   <div className="flex justify-between border-b border-[#1F2937] pb-2">
                     <span className="text-[#6B7280]">DATABASE URI</span>
                     <span className="text-[#C5A059]">{infraData.databaseUrl}</span>
                   </div>
                 </div>
               </div>

               <div className="bg-[#0A0B0D] p-6 rounded-xl border border-[#1F2937]">
                 <h3 className="text-sm font-serif font-bold text-white tracking-widest mb-4">Proxy / Tunnel</h3>
                 <div className="space-y-4 font-mono text-xs">
                   <div className="flex justify-between border-b border-[#1F2937] pb-2">
                     <span className="text-[#6B7280]">PUBLIC DOMAIN</span>
                     <span className="text-[#3B82F6]">{infraData.tunnelUrl}</span>
                   </div>
                   <div className="flex justify-between border-b border-[#1F2937] pb-2">
                     <span className="text-[#6B7280]">CF TUNNEL ID</span>
                     <span className="text-white">{infraData.tunnelId}</span>
                   </div>
                 </div>
               </div>

               <div className="bg-[#0A0B0D] p-6 rounded-xl border border-[#1F2937] md:col-span-2">
                 <h3 className="text-sm font-serif font-bold text-white tracking-widest mb-4">Hardware Utilization (VPS)</h3>
                 <div className="space-y-4 font-mono text-xs">
                   <div className="flex justify-between border-b border-[#1F2937] pb-2">
                     <span className="text-[#6B7280]">CPU</span>
                     <span className="text-[#10B981]">{infraData.vpsCPU}</span>
                   </div>
                   <div className="flex justify-between border-b border-[#1F2937] pb-2">
                     <span className="text-[#6B7280]">MEMORY</span>
                     <span className="text-[#C5A059]">{infraData.vpsMemory}</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        )}

        {activeTab === "MARKETS" && (
           <div className="p-6">
             <div className="mb-6 bg-[#0A0B0D]/80 backdrop-blur-lg border border-[#1F2937] rounded-xl p-6">
               <h3 className="text-lg font-serif font-bold text-white tracking-widest mb-4">Configure Asset Peg</h3>
               <div className="flex flex-col md:flex-row gap-4 items-end">
                 <div className="flex-1 w-full">
                   <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Asset Ticker</label>
                   <input 
                     value={newAsset.asset} 
                     onChange={e => setNewAsset({...newAsset, asset: e.target.value})}
                     placeholder="e.g. SOL"
                     className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-3 rounded text-white outline-none focus:border-gold/50 transition font-mono uppercase" 
                   />
                 </div>
                 <div className="flex-1 w-full">
                   <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Price (USD)</label>
                   <input 
                     value={newAsset.price} 
                     onChange={e => setNewAsset({...newAsset, price: e.target.value})}
                     placeholder="e.g. 150.00"
                     className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-3 rounded text-white outline-none focus:border-gold/50 transition font-mono" 
                   />
                 </div>
                 <button 
                   disabled={isReadOnly}
                   onClick={() => handleUpdateMarketAsset(newAsset.asset.toUpperCase(), newAsset.price)}
                   className="w-full md:w-auto flex items-center justify-center gap-2 border border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 font-bold tracking-widest px-6 py-3 rounded transition uppercase text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Send className="w-4 h-4" /> Deploy Peg
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {Object.entries(marketData).map(([asset, price]) => (
                 <div key={asset} className="bg-[#181B1F] p-4 rounded-xl border border-[#1F2937] flex flex-col justify-between">
                   <div className="flex justify-between items-center mb-4">
                     <span className="text-xl font-bold text-white font-mono">{asset}</span>
                     <button 
                       disabled={isReadOnly}
                       onClick={() => handleDeleteMarketAsset(asset)}
                       className="text-[#EF4444] hover:text-[#EF4444]/70 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                       title="Delist Asset"
                     >
                       <AlertTriangle className="w-4 h-4" />
                     </button>
                   </div>
                   <div className="text-[#10B981] font-mono text-lg">{formatCurrency(Number(price))}</div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeTab === "TIERS" && (
           <div className="p-6">
             <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-lg font-serif font-bold text-white tracking-widest">Custom Rank Generation</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] opacity-80">Define hierarchy of node progression based on volume or manual invite.</p>
               </div>
               <button onClick={handleSaveTiers} disabled={isReadOnly} className="bg-gold/10 hover:bg-gold/20 text-[#C5A059] border border-gold/30 px-6 py-2 rounded text-[10px] uppercase tracking-widest transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <Save className="w-4 h-4"/> Commit Tiers
               </button>
             </div>
             <div className="space-y-4">
                {systemData?.tiers?.map((tier: any, idx: number) => (
                   <div key={tier.id} className="bg-[#181B1F] p-4 rounded-xl border border-[#1F2937] flex flex-col md:flex-row gap-4 md:items-end">
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Rank Name</label>
                        <input 
                          value={tier.name}
                          onChange={(e) => {
                             const newTiers = [...(systemData.tiers || [])];
                             newTiers[idx].name = e.target.value;
                             setSystemData({...systemData, tiers: newTiers});
                          }}
                          className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded text-white outline-none focus:border-gold/50 transition font-serif"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Color Aura (Hex)</label>
                        <input 
                          value={tier.color}
                          onChange={(e) => {
                             const newTiers = [...(systemData.tiers || [])];
                             newTiers[idx].color = e.target.value;
                             setSystemData({...systemData, tiers: newTiers});
                          }}
                          className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded font-mono text-[10px]"
                          style={{ color: tier.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Requirements</label>
                        <input 
                          value={tier.requirements}
                          onChange={(e) => {
                             const newTiers = [...(systemData.tiers || [])];
                             newTiers[idx].requirements = e.target.value;
                             setSystemData({...systemData, tiers: newTiers});
                          }}
                          className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded text-[#9CA3AF] outline-none font-mono text-xs"
                        />
                      </div>
                      <button 
                        disabled={isReadOnly}
                        onClick={() => {
                           const newTiers = systemData.tiers?.filter((_, i) => i !== idx);
                           setSystemData({...systemData, tiers: newTiers});
                        }}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded border border-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                ))}
                <button 
                  disabled={isReadOnly}
                  onClick={() => {
                     setSystemData({
                       ...systemData!, 
                       tiers: [...(systemData?.tiers || []), { id: crypto.randomUUID(), name: "New Rank", color: "#FFFFFF", requirements: "Manual Invite" }]
                     });
                  }}
                  className="w-full border border-dashed border-[#1F2937] text-[#6B7280] hover:text-white hover:border-[#374151] hover:bg-[#181B1F] py-4 rounded transition flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4"/> Add New Custom Rank
                </button>
             </div>
           </div>
        )}

        {activeTab === "THEMES" && (
           <div className="p-6">
             <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-lg font-serif font-bold text-white tracking-widest">Global Terminal Themes</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] opacity-80">Inject custom aesthetic presets accessible to operators.</p>
               </div>
               <button onClick={handleSaveThemes} disabled={isReadOnly} className="bg-gold/10 hover:bg-gold/20 text-[#C5A059] border border-gold/30 px-6 py-2 rounded text-[10px] uppercase tracking-widest transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <Save className="w-4 h-4"/> Commit Themes
               </button>
             </div>
             <div className="space-y-4">
                {systemData?.themes?.map((theme: any, idx: number) => (
                   <div key={theme.id} className="bg-[#181B1F] p-4 rounded-xl border border-[#1F2937] flex flex-col md:flex-row gap-4 md:items-end">
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Theme Alias</label>
                        <input 
                          value={theme.name}
                          onChange={(e) => {
                             const newThemes = [...(systemData.themes || [])];
                             newThemes[idx].name = e.target.value;
                             setSystemData({...systemData, themes: newThemes});
                          }}
                          className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded text-white outline-none focus:border-gold/50 transition font-serif"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Primary Color</label>
                        <div className="flex gap-2">
                          <input 
                            type="color"
                            value={theme.primary}
                            onChange={(e) => {
                               const newThemes = [...(systemData.themes || [])];
                               newThemes[idx].primary = e.target.value;
                               setSystemData({...systemData, themes: newThemes});
                            }}
                            className="bg-transparent border-none appearance-none cursor-pointer w-8 h-8 rounded shrink-0 p-0"
                          />
                          <input 
                            value={theme.primary}
                            onChange={(e) => {
                               const newThemes = [...(systemData.themes || [])];
                               newThemes[idx].primary = e.target.value;
                               setSystemData({...systemData, themes: newThemes});
                            }}
                            className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded font-mono text-[10px] text-white"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Background Color</label>
                        <div className="flex gap-2">
                          <input 
                            type="color"
                            value={theme.bg}
                            onChange={(e) => {
                               const newThemes = [...(systemData.themes || [])];
                               newThemes[idx].bg = e.target.value;
                               setSystemData({...systemData, themes: newThemes});
                            }}
                            className="bg-transparent border-none appearance-none cursor-pointer w-8 h-8 rounded shrink-0 p-0"
                          />
                          <input 
                            value={theme.bg}
                            onChange={(e) => {
                               const newThemes = [...(systemData.themes || [])];
                               newThemes[idx].bg = e.target.value;
                               setSystemData({...systemData, themes: newThemes});
                            }}
                            className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded font-mono text-[10px] text-white"
                          />
                        </div>
                      </div>
                      <button 
                        disabled={isReadOnly}
                        onClick={() => {
                           const newThemes = systemData.themes?.filter((_, i) => i !== idx);
                           setSystemData({...systemData, themes: newThemes});
                        }}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded border border-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                ))}
                <button 
                  disabled={isReadOnly}
                  onClick={() => {
                     setSystemData({
                       ...systemData!, 
                       themes: [...(systemData?.themes || []), { id: crypto.randomUUID(), name: "Custom Variant", primary: "#FFFFFF", bg: "#000000" }]
                     });
                  }}
                  className="w-full border border-dashed border-[#1F2937] text-[#6B7280] hover:text-white hover:border-[#374151] hover:bg-[#181B1F] py-4 rounded transition flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4"/> Add New Theme Preset
                </button>
             </div>
           </div>
        )}
        {activeTab === "NARRATIVES" && (
           <div className="p-6">
             <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-lg font-serif font-bold text-white tracking-widest">Narrative Prompt Generator</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] opacity-80">Design affiliate marketing prompts for Twitter, Discord, and external campaigns.</p>
               </div>
               <button onClick={handleSaveNarratives} disabled={isReadOnly} className="bg-gold/10 hover:bg-gold/20 text-[#C5A059] border border-gold/30 px-6 py-2 rounded text-[10px] uppercase tracking-widest transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <Save className="w-4 h-4"/> Commit Narratives
               </button>
             </div>
             <div className="space-y-4">
                {narratives.map((narrative: any, idx: number) => (
                   <div key={narrative.id} className="bg-[#181B1F] p-4 rounded-xl border border-[#1F2937] flex flex-col gap-4">
                      <div className="flex gap-4">
                         <div className="flex-1">
                           <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Campaign Name</label>
                           <input 
                             value={narrative.name}
                             onChange={(e) => {
                                const nw = [...narratives];
                                nw[idx].name = e.target.value;
                                setNarratives(nw);
                             }}
                             className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded text-white outline-none focus:border-gold/50 transition font-serif"
                           />
                         </div>
                         <div className="flex-1">
                           <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Target Audience</label>
                           <input 
                             value={narrative.target}
                             onChange={(e) => {
                                const nw = [...narratives];
                                nw[idx].target = e.target.value;
                                setNarratives(nw);
                             }}
                             className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded text-white outline-none focus:border-gold/50 transition font-mono text-xs"
                           />
                         </div>
                         <button 
                           disabled={isReadOnly}
                           onClick={() => setNarratives(narratives.filter((_, i) => i !== idx))}
                           className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded border border-red-500/20 transition h-[38px] self-end disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      <div>
                         <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">System Prompt Instructions</label>
                         <textarea
                           value={narrative.prompt}
                           onChange={(e) => {
                              const nw = [...narratives];
                              nw[idx].prompt = e.target.value;
                              setNarratives(nw);
                           }}
                           className="w-full h-24 bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded text-[#9CA3AF] outline-none font-mono text-xs resize-none"
                         />
                      </div>
                   </div>
                ))}
                <button 
                  disabled={isReadOnly}
                  onClick={() => {
                     setNarratives([...narratives, { id: crypto.randomUUID(), name: "New Campaign", prompt: "Act as an affiliate marketer...", target: "Discord OSRS Servers" }]);
                  }}
                  className="w-full border border-dashed border-[#1F2937] text-[#6B7280] hover:text-white hover:border-[#374151] hover:bg-[#181B1F] py-4 rounded transition flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4"/> Add New Narrative
                </button>
             </div>
           </div>
        )}

        {activeTab === "EVENTS" && (
           <div className="p-6">
             <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-lg font-serif font-bold text-white tracking-widest">Global Event Scheduler</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] opacity-80">Schedule drops, maintenance, or high-roller tournaments.</p>
               </div>
               <button onClick={handleSaveEvents} disabled={isReadOnly} className="bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 px-6 py-2 rounded text-[10px] uppercase tracking-widest transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <Save className="w-4 h-4"/> Sync Events
               </button>
             </div>
             <div className="space-y-4">
                {events.map((evt: any, idx: number) => (
                   <div key={evt.id} className="bg-[#181B1F] p-4 rounded-xl border border-[#1F2937] flex flex-col md:flex-row gap-4 md:items-end">
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Event Title</label>
                        <input 
                          value={evt.name}
                          onChange={(e) => {
                             const nw = [...events];
                             nw[idx].name = e.target.value;
                             setEvents(nw);
                          }}
                          className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded text-white outline-none focus:border-gold/50 transition font-serif"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Date & Time</label>
                        <input 
                          type="datetime-local"
                          value={evt.date}
                          onChange={(e) => {
                             const nw = [...events];
                             nw[idx].date = e.target.value;
                             setEvents(nw);
                          }}
                          className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded text-white outline-none font-mono text-xs"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Platform/Target</label>
                        <input 
                          value={evt.platform}
                          onChange={(e) => {
                             const nw = [...events];
                             nw[idx].platform = e.target.value;
                             setEvents(nw);
                          }}
                          className="w-full bg-[#0A0B0D] border border-[#1F2937] px-4 py-2 rounded text-white outline-none font-mono text-xs"
                        />
                      </div>
                      <button 
                        disabled={isReadOnly}
                        onClick={() => setEvents(events.filter((_, i) => i !== idx))}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded border border-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                ))}
                <button 
                  disabled={isReadOnly}
                  onClick={() => {
                     setEvents([...events, { id: crypto.randomUUID(), name: "1B Drop Party", date: new Date().toISOString().slice(0, 16), platform: "W301 Grand Exchange", status: "PENDING" }]);
                  }}
                  className="w-full border border-dashed border-[#1F2937] text-[#6B7280] hover:text-white hover:border-[#374151] hover:bg-[#181B1F] py-4 rounded transition flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4"/> Schedule New Event
                </button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
