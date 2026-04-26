import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowRightLeft, Handshake, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export function P2PTrading() {
  const { user, refreshBalances } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [offerAsset, setOfferAsset] = useState("OSRS");
  const [offerAmount, setOfferAmount] = useState("");
  const [requestAsset, setRequestAsset] = useState("USD");
  const [requestAmount, setRequestAmount] = useState("");

  const fetchTrades = () => {
    fetch("/api/trades")
      .then(r => r.json())
      .then(d => setTrades(d))
      .catch();
  };

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 5000);
    return () => clearInterval(interval);
  }, []);

  const createOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAsset || !offerAmount || !requestAsset || !requestAmount || !user) return;
    await fetch("/api/trades", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         userId: user.id,
         type: "SELL",
         assetOffer: offerAsset,
         amountOffer: offerAmount,
         assetRequest: requestAsset,
         amountRequest: requestAmount
       })
    });
    setOfferAmount("");
    setRequestAmount("");
    fetchTrades();
  };

  const acceptTrade = async (tradeId: string) => {
    if (!user) return;
    const res = await fetch(`/api/trades/${tradeId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id })
    });
    if (res.ok) {
       alert("Trade accepted successfully");
       refreshBalances();
       fetchTrades();
    } else {
       const err = await res.json();
       alert(err.error || "Failed to accept trade");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ArrowRightLeft className="w-5 h-5 text-gold-text" />
        <h1 className="text-2xl font-serif font-black tracking-widest text-[#E5E7EB] uppercase">P2P Escrow Market</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Market */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-[#9CA3AF] text-[10px] font-mono uppercase tracking-widest pl-2">Open Orders (Escrow Secured)</h2>
          {trades.length === 0 ? (
             <div className="bg-[#181B1F] border border-[#1F2937] border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-[#6B7280]">
               <Handshake className="w-8 h-8 mb-4 opacity-50" />
               <p className="font-mono text-xs uppercase tracking-widest">No active P2P offers</p>
             </div>
          ) : (
            trades.map((trade) => (
              <div key={trade.id} className="bg-[#0D0F12] border border-[#1F2937] p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg hover:border-[#374151] transition">
                <div className="flex-1">
                  <div className="text-[10px] text-[#6B7280] font-mono uppercase tracking-widest mb-1">Provider: {trade.creatorName}</div>
                  <div className="flex items-center gap-4">
                    <div className="font-serif">
                       <span className="text-[#EF4444] font-bold">-{trade.amountOffer} {trade.assetOffer}</span>
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-[#9CA3AF]" />
                    <div className="font-serif">
                       <span className="text-[#10B981] font-bold">+{trade.amountRequest} {trade.assetRequest}</span>
                    </div>
                  </div>
                </div>
                {trade.creatorId !== user?.id && (
                  <button 
                    onClick={() => acceptTrade(trade.id)}
                    className="w-full md:w-auto px-6 py-3 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded font-serif uppercase tracking-widest text-[10px] font-bold hover:bg-[#10B981]/20 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept Offer
                  </button>
                )}
                {trade.creatorId === user?.id && (
                   <span className="bg-[#181B1F] border border-[#374151] text-[#9CA3AF] px-4 py-2 rounded text-[10px] uppercase font-mono tracking-widest">Your Offer</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Offer */}
        <div className="bg-[#0D0F12] border border-[#1F2937] p-6 rounded-xl shadow-2xl h-fit">
          <h2 className="text-[#C5A059] text-[10px] font-mono uppercase tracking-widest mb-6 border-b border-[#1F2937] pb-2">Initialize Escrow Contract</h2>
          <form onSubmit={createOffer} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">You Provide</label>
              <div className="flex gap-2">
                 <input 
                   type="number" 
                   value={offerAmount}
                   onChange={e => setOfferAmount(e.target.value)}
                   className="flex-1 bg-[#181B1F] border border-[#1F2937] rounded px-3 py-2 text-white font-mono text-sm focus:border-gold/50 outline-none transition" 
                   placeholder="Amount"
                   required
                 />
                 <select 
                   value={offerAsset}
                   onChange={e => setOfferAsset(e.target.value)}
                   className="bg-[#181B1F] border border-[#1F2937] rounded px-3 py-2 text-white font-mono text-xs focus:border-gold/50 outline-none"
                 >
                   <option>OSRS</option>
                   <option>BTC</option>
                   <option>ETH</option>
                   <option>USD</option>
                 </select>
              </div>
            </div>
            <div className="flex justify-center py-2">
              <ArrowRightLeft className="w-4 h-4 text-[#374151] rotate-90" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">You Require</label>
              <div className="flex gap-2">
                 <input 
                   type="number" 
                   value={requestAmount}
                   onChange={e => setRequestAmount(e.target.value)}
                   className="flex-1 bg-[#181B1F] border border-[#1F2937] rounded px-3 py-2 text-white font-mono text-sm focus:border-gold/50 outline-none transition" 
                   placeholder="Amount"
                   required
                 />
                 <select 
                   value={requestAsset}
                   onChange={e => setRequestAsset(e.target.value)}
                   className="bg-[#181B1F] border border-[#1F2937] rounded px-3 py-2 text-white font-mono text-xs focus:border-gold/50 outline-none"
                 >
                   <option>USD</option>
                   <option>BTC</option>
                   <option>ETH</option>
                   <option>OSRS</option>
                 </select>
              </div>
            </div>
            
            <button 
              type="submit"
              className="w-full mt-6 bg-gold/10 text-[#C5A059] hover:bg-gold/20 border border-gold/30 px-4 py-3 rounded font-serif uppercase tracking-widest text-[10px] font-bold transition"
            >
              Sign && Post Listing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
