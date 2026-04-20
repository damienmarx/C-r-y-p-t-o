import React, { useState, useEffect } from "react";
import { formatCurrency } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, AlertTriangle, Key, Users, Activity, Terminal, Database, Send } from "lucide-react";

export function Admin() {
  const { user } = useAuth();
  const [systemData, setSystemData] = useState<{ logs: any[], users: any[], transactions: any[] } | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"TRANSCRIPTION" | "USERS">("TRANSCRIPTION");

  const fetchSystemData = () => {
    if (user?.role !== "ADMIN") {
      setUnauthorized(true);
      return;
    }
    setUnauthorized(false);
    fetch(`/api/admin/system?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setSystemData({ logs: d.auditLogs || [], users: d.users || [], transactions: d.transactions || [] }))
      .catch(e => console.error(e));
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
                         value={u.role}
                         onChange={(e) => updateUserRole(u.id, e.target.value)}
                         className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase outline-none cursor-pointer border ${u.role === "ADMIN" ? "bg-gold/10 text-[#C5A059] border-[#C5A059]/30" : "bg-[#181B1F] text-white border-[#1F2937]"}`}
                       >
                         <option value="USER">Base User</option>
                         <option value="ADMIN">Overseer (Admin)</option>
                       </select>
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
      </div>
    </div>
  );
}
