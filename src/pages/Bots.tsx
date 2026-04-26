import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Cpu, Play, Square, Settings, TrendingUp, TrendingDown, Clock, Activity, Settings2, Trash2 } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export function Bots() {
  const { user, refreshBalances } = useAuth();
  const [bots, setBots] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Bot Form
  const [name, setName] = useState("");
  const [asset, setAsset] = useState("BTC");
  const [strategy, setStrategy] = useState("GRID");
  const [budget, setBudget] = useState("1000");

  const fetchBots = () => {
    if (!user) return;
    fetch(`/api/bots?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setBots(d))
      .catch();
  };

  useEffect(() => {
    fetchBots();
    const interval = setInterval(() => {
       fetchBots();
       refreshBalances();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || Number(budget) <= 0) return;
    
    await fetch("/api/bots", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ userId: user.id, name, asset, strategy, budget })
    });
    
    setIsCreating(false);
    setName("");
    fetchBots();
  };

  const handleToggle = async (id: string) => {
    if (!user) return;
    await fetch(`/api/bots/${id}/toggle`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ userId: user.id })
    });
    fetchBots();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await fetch(`/api/bots/${id}`, {
       method: "DELETE",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ userId: user.id })
    });
    fetchBots();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-gold-text" />
          <h1 className="text-2xl font-serif font-black tracking-widest text-[#E5E7EB] uppercase">Automation Scripts</h1>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-gold/10 hover:bg-gold/20 text-[#C5A059] border border-gold/30 px-6 py-3 rounded text-[10px] uppercase tracking-widest font-bold transition flex items-center justify-center gap-2"
        >
          <Settings2 className="w-4 h-4" /> Instantiate New Bot
        </button>
      </div>

      {isCreating && (
        <div className="bg-[#0D0F12] border border-[#1F2937] p-6 rounded-xl shadow-2xl mb-8">
          <h2 className="text-[#C5A059] text-[10px] font-mono uppercase tracking-widest mb-6 border-b border-[#1F2937] pb-2">Configure Bot Parameters</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Designation</label>
              <input 
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Ex: Grid_Alpha_1" required
                className="w-full bg-[#181B1F] border border-[#1F2937] rounded px-3 py-2 text-white font-mono text-xs focus:border-gold/50 outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Target Asset</label>
              <select 
                value={asset} onChange={e => setAsset(e.target.value)}
                className="w-full bg-[#181B1F] border border-[#1F2937] rounded px-3 py-2 text-white font-mono text-xs focus:border-gold/50 outline-none"
              >
                <option value="BTC">BTC / USD</option>
                <option value="ETH">ETH / USD</option>
                <option value="OSRS">OSRS / USD</option>
              </select>
            </div>
            <div>
               <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Trading Strategy</label>
               <select 
                value={strategy} onChange={e => setStrategy(e.target.value)}
                className="w-full bg-[#181B1F] border border-[#1F2937] rounded px-3 py-2 text-white font-mono text-xs focus:border-gold/50 outline-none"
              >
                <option value="GRID">Grid Scalping</option>
                <option value="MOMENTUM">Momentum Rider</option>
                <option value="ARBITRAGE">Cross-Exchange Arbitrage</option>
                <option value="RSI_MACD">RSI / MACD Divergence</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Max Budget Allocation Group</label>
              <input 
                type="number" value={budget} onChange={e => setBudget(e.target.value)}
                min="100" required
                className="w-full bg-[#181B1F] border border-[#1F2937] rounded px-3 py-2 text-white font-mono text-xs focus:border-gold/50 outline-none transition" 
              />
            </div>
            <div className="flex gap-2">
               <button type="submit" className="flex-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 hover:bg-[#10B981]/20 rounded font-serif tracking-widest text-[10px] uppercase font-bold py-2 px-4 transition">Deploy</button>
               <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded font-serif tracking-widest text-[10px] uppercase font-bold py-2 px-4 transition">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {bots.length === 0 ? (
          <div className="bg-[#0D0F12] border border-[#1F2937] border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-[#6B7280]">
               <Activity className="w-8 h-8 mb-4 opacity-50" />
               <p className="font-mono text-xs uppercase tracking-widest">No active automation scripts found in your node.</p>
          </div>
        ) : (
          bots.map(bot => (
            <div key={bot.id} className="bg-[#0D0F12] border border-[#1F2937] p-6 rounded-xl shadow-lg flex flex-col lg:flex-row items-center gap-6 group hover:border-[#374151] transition">
              
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className={`p-3 rounded-lg border ${bot.status === 'ACTIVE' ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' : 'bg-[#1F2937]/30 border-[#374151] text-[#9CA3AF]'}`}>
                   <Cpu className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-serif font-bold text-white tracking-widest capitalize">{bot.name}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${bot.status === 'ACTIVE' ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]'}`}></span>
                      <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-widest">{bot.status}</span>
                   </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1">Target Pair</div>
                  <div className="font-mono text-xs text-white">{bot.asset}/USD</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1">Logic Algorithm</div>
                  <div className="font-mono text-[10px] text-[#C5A059] uppercase tracking-widest">{bot.strategy.replace('_',' ')}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1">Allocated Capital</div>
                  <div className="font-serif text-sm text-white">{formatCurrency(bot.budget)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1">Executions</div>
                  <div className="font-mono text-xs text-white flex items-center gap-1"><Clock className="w-3 h-3 text-[10px] text-[#6B7280]" /> {bot.tradesExecuted} Cycles</div>
                </div>
              </div>
              
              <div className="min-w-[150px] text-right">
                 <div className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1 hidden lg:block">System PnL</div>
                 <div className={`font-mono text-lg font-bold flex items-center justify-end gap-2 ${bot.totalProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {bot.totalProfit >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {bot.totalProfit >= 0 ? '+' : ''}{formatCurrency(bot.totalProfit)}
                 </div>
              </div>

              <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-l border-[#1F2937] pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto mt-4 lg:mt-0 justify-end">
                <button 
                  onClick={() => handleToggle(bot.id)}
                  className={`p-2 rounded border transition w-10 h-10 flex items-center justify-center ${
                    bot.status === 'ACTIVE' 
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20' 
                      : 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/20'
                  }`}
                  title={bot.status === 'ACTIVE' ? 'Pause Execution' : 'Start Execution'}
                >
                  {bot.status === 'ACTIVE' ? <Square className="w-4 h-4 fill-current"/> : <Play className="w-4 h-4 fill-current"/>}
                </button>
                <button 
                  onClick={() => handleDelete(bot.id)}
                  className="p-2 rounded border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition w-10 h-10 flex items-center justify-center"
                  title="Delete Protocol"
                >
                   <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
