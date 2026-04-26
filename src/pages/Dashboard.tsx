import React, { useState, useEffect } from "react";
import { formatCurrency } from "../lib/utils";
import { explainJargonFast, analyzeMarketWithSearch, generateTTS } from "../lib/gemini";
import { TrendingUp, TrendingDown, RefreshCcw, Volume2, Info, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export function Dashboard() {
  const { user } = useAuth();
  const [marketData, setMarketData] = useState<Record<string, number>>({});
  const [news, setNews] = useState<Record<string, string>>({});
  const [loadingNews, setLoadingNews] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{term: string, text: string, x: number, y: number} | null>(null);

  const fetchMarket = async () => {
    try {
      const res = await fetch("/api/market");
      const data = await res.json();
      setMarketData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMarket();
    const intv = setInterval(fetchMarket, 2000);
    return () => clearInterval(intv);
  }, []);

  const handleFetchNews = async (asset: string) => {
    setLoadingNews(asset);
    try {
      const text = await analyzeMarketWithSearch(asset);
      setNews(prev => ({ ...prev, [asset]: text }));
    } catch {
      setNews(prev => ({ ...prev, [asset]: "Failed to retrieve market intel." }));
    } finally {
      setLoadingNews(null);
    }
  };

  const handleTTS = async (text: string) => {
    try {
      const audioUrl = await generateTTS(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch(e) {
      console.log("TTS Failed");
    }
  };

  const handleJargonHover = async (term: string, e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY - 40;
    setTooltip({ term, text: "Consulting oracle...", x, y });
    try {
       const text = await explainJargonFast(term);
       setTooltip({ term, text, x, y });
    } catch {
       setTooltip({ term, text: "Error fetching definition.", x, y });
    }
  };

  // Calculate Portfolio Top-level Value
  const calculateTotalValue = () => {
    if (!user || !user.balances) return 0;
    let total = 0;
    Object.entries(user.balances).forEach(([asset, amount]) => {
      if (asset === "USD" || asset === "USDC" || asset === "USDT") {
        total += Number(amount);
      } else if (marketData[asset]) {
        if (asset === "OSRS") {
           // OSRS is priced per 1M usually in marketData, or direct unit. In our db, OSRS price is e.g. 0.00025 per GP ($0.25/M)
           total += Number(amount) * marketData[asset];
        } else {
           total += Number(amount) * marketData[asset];
        }
      }
    });
    return total;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      {user && (
        <div className="bg-[#0D0F12] border border-[#1F2937] rounded-xl p-6 shadow-2xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Wallet className="w-32 h-32 text-gold-text" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1F2937] pb-6 mb-6">
            <div>
              <div className="text-[10px] text-[#6B7280] uppercase tracking-widest font-semibold flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-gold-text" /> Net Asset Value
              </div>
              <div className="text-4xl md:text-5xl font-serif text-white font-black tracking-tight drop-shadow-md">
                {formatCurrency(calculateTotalValue())}
              </div>
            </div>
            <div className="flex gap-2">
               <button className="px-6 py-3 bg-[#181B1F] hover:bg-[#1F2937] text-xs font-mono uppercase tracking-widest text-white border border-[#1F2937] rounded transition active:scale-95 shadow">Withdraw</button>
               <button className="px-6 py-3 bg-gold/10 hover:bg-gold/20 text-xs font-mono uppercase tracking-widest text-[#C5A059] border border-gold/30 rounded transition active:scale-95 shadow">Deposit</button>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(user.balances).map(([asset, amount]) => {
               const value = asset === "USD" || asset === "USDC" || asset === "USDT" 
                 ? amount 
                 : (amount as number) * (marketData[asset] || 0);
                 
               return (
                 <div key={asset} className="bg-[#181B1F] p-4 rounded border border-[#1F2937]">
                    <div className="text-[10px] text-[#6B7280] uppercase tracking-widest mb-1">{asset} Vault</div>
                    <div className="text-lg font-mono text-white flex items-center gap-2">
                      {asset === "OSRS" ? `${(Number(amount)/1000000).toFixed(0)}M` : Number(amount).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      <span className="text-xs text-[#10B981] ml-auto">{formatCurrency(value)}</span>
                    </div>
                 </div>
               )
            })}
          </div>
        </div>
      )}

      <header className="mb-4">
        <h1 className="text-2xl font-serif tracking-widest font-bold uppercase gold-text mb-2">Market Overview</h1>
        <p className="text-[10px] uppercase tracking-widest text-[#6B7280]">Real-time liquidity streams and order book indicators.</p>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(marketData).map(([asset, price]) => {
          const isGold = asset === "OSRS";
          return (
            <motion.div key={asset} layoutId={`card-${asset}`} className="bg-card p-5 rounded border border-[#1F2937] flex flex-col min-h-[140px]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] text-[#6B7280] uppercase tracking-widest font-semibold">{asset} Metrics</div>
                  <div 
                    className="cursor-help text-[#6B7280] hover:text-white"
                    onMouseEnter={(e) => handleJargonHover(`What is the asset ${asset}?`, e)}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <Info className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[#181B1F] border border-[#1F2937] rounded text-[#6B7280]">
                  {isGold ? "MMORPG" : "CRYPTO"}
                </div>
              </div>

              <div className={`text-2xl font-serif font-bold ${isGold ? 'gold-text' : 'text-white'}`}>
                {isGold ? `${((Number(price)) * 1000).toFixed(6)}` : formatCurrency(Number(price))}
                <span className="text-xs font-sans text-[#6B7280] ml-1 font-normal tracking-wide">
                  {isGold ? '/ 1M GP' : ''}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F2937]">
                {news[asset] ? (
                  <div className="text-[11px] text-[#9CA3AF] leading-relaxed relative pr-8 font-serif italic">
                    "{news[asset]}"
                    <button onClick={() => handleTTS(news[asset])} className="absolute right-0 top-0 text-[#6B7280] hover:gold-text">
                       <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleFetchNews(asset)}
                    disabled={loadingNews === asset}
                    className="text-[10px] uppercase tracking-widest flex items-center gap-2 gold-text hover:text-white transition disabled:opacity-50"
                  >
                    {loadingNews === asset ? <RefreshCcw className="w-3 h-3 animate-spin"/> : <TrendingUp className="w-3 h-3" />}
                    Ground Analysis
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tooltip Render */}
      {tooltip && (
        <div 
          className="fixed z-50 bg-[#181B1F] p-3 max-w-[250px] shadow-xl border border-gold rounded text-xs text-white pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
