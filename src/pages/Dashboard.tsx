import React, { useState, useEffect } from "react";
import { formatCurrency } from "../lib/utils";
import { explainJargonFast, analyzeMarketWithSearch, generateTTS } from "../lib/gemini";
import { TrendingUp, TrendingDown, RefreshCcw, Volume2, Info } from "lucide-react";
import { motion } from "motion/react";

export function Dashboard() {
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

  return (
    <div className="space-y-6">
      <header className="mb-8">
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
