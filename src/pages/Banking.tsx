import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, cn } from "../lib/utils";
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, CheckCircle, Copy, QrCode } from "lucide-react";

export function Banking() {
  const { user, refreshBalances } = useAuth();
  const [activeTab, setActiveTab] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<any>(null);
  
  const ASSETS = ["BTC", "ETH", "USDC", "USDT", "OSRS", "USD"];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const handleMax = () => {
    if (user && user.balances[asset]) {
      setAmount(user.balances[asset].toString());
    } else {
      setAmount("0");
    }
  };

  const processTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setStatus(null);

    try {
      const res = await fetch("/api/banking/transact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          type: activeTab,
          asset,
          amount: Number(amount),
          address
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus({ error: data.error });
      } else {
        setStatus({ success: `Successfully processed ${activeTab === 'DEPOSIT' ? 'deposit' : 'withdrawal'} of ${amount} ${asset}` });
        refreshBalances();
        setAmount("");
        setAddress("");
      }
    } catch (err) {
      setStatus({ error: "Transaction failed network execution." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header className="mb-4">
        <h1 className="text-3xl font-serif tracking-widest font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-[#FCD34D] mb-2 drop-shadow-[0_0_15px_rgba(197,160,89,0.3)]">
          Banking & Vault
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] opacity-80">Manage your fiat, crypto, and game asset liqudity.</p>
      </header>

      {/* TABS */}
      <div className="flex gap-2 border-b border-[#1F2937]">
        <button 
          onClick={() => { setActiveTab("DEPOSIT"); setStatus(null); }}
          className={cn(
            "flex items-center gap-2 px-6 py-4 uppercase tracking-widest font-serif text-xs transition border-b-2", 
            activeTab === "DEPOSIT" ? "text-gold-text border-[#C5A059] bg-[#181B1F]" : "text-[#6B7280] border-transparent hover:text-white"
          )}
        >
          <ArrowDownToLine className="w-4 h-4" /> Deposit
        </button>
        <button 
           onClick={() => { setActiveTab("WITHDRAW"); setStatus(null); }}
           className={cn(
            "flex items-center gap-2 px-6 py-4 uppercase tracking-widest font-serif text-xs transition border-b-2", 
            activeTab === "WITHDRAW" ? "text-white border-white bg-[#181B1F]" : "text-[#6B7280] border-transparent hover:text-white"
          )}
        >
          <ArrowUpFromLine className="w-4 h-4" /> Withdraw
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-[#0D0F12] border border-[#1F2937] p-6 rounded-xl shadow-2xl relative">
          
          <div className="mb-6">
            <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Select Asset</label>
            <select 
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full bg-[#181B1F] border border-[#1F2937] text-white px-4 py-3 rounded outline-none font-mono tracking-widest uppercase cursor-pointer focus:border-[#C5A059]/50 transition"
            >
              {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {activeTab === "DEPOSIT" && (
            <div className="space-y-6">
              <div className="p-4 border border-[#3B82F6]/30 bg-[#3B82F6]/5 rounded-lg flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                <div className="text-xs text-[#9CA3AF] leading-relaxed">
                  Send only <strong className="text-white">{asset}</strong> to this deposit configuration. Sending any other asset may result in permanent loss.
                </div>
              </div>

              {asset === "OSRS" ? (
                <div className="bg-[#181B1F] p-6 rounded border border-[#1F2937] text-center space-y-4">
                  <h3 className="text-sm font-serif text-gold-text uppercase tracking-widest">In-Game Transfer Protocol</h3>
                  <p className="text-[#6B7280] text-xs max-w-sm mx-auto">
                    Please log into Old School RuneScape and trade our automated wealth manager.
                  </p>
                  <div className="bg-[#0A0B0D] p-4 rounded border border-[#1F2937] inline-block font-mono text-left">
                    <div className="text-[10px] text-[#6B7280] mb-1">World</div>
                    <div className="text-white mb-3">W301 (Grand Exchange)</div>
                    <div className="text-[10px] text-[#6B7280] mb-1">Target Account</div>
                    <div className="text-white mb-3">Rhall_Proxy_004</div>
                    <div className="text-[10px] text-[#6B7280] mb-1">Auth Code (Say in chat)</div>
                    <div className="text-[#10B981] font-bold text-lg">A1B2-C3D4</div>
                  </div>
                  
                  {/* Internal Testing Protocol */}
                  <div className="pt-4 mt-4 border-t border-[#1F2937]/50">
                    <p className="text-[10px] text-[#6B7280] mb-2 uppercase tracking-widest">Simulate In-Game Deposit (Testnet)</p>
                    <form onSubmit={processTransaction} className="flex gap-2">
                       <input 
                         type="number"
                         value={amount}
                         onChange={e=>setAmount(e.target.value)}
                         placeholder="Amount in GP"
                         className="flex-1 bg-[#0A0B0D] border border-[#1F2937] px-3 py-2 rounded text-white text-xs font-mono"
                         required
                       />
                       <button className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-4 py-2 rounded text-[10px] uppercase tracking-widest font-bold hover:bg-[#10B981]/20">Simulate</button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-[#181B1F] p-6 rounded border border-[#1F2937] flex flex-col items-center">
                  <div className="bg-white p-2 rounded-lg mb-6">
                    {/* Placeholder QR */}
                    <QrCode className="w-48 h-48 text-[#0A0B0D]" />
                  </div>
                  <div className="w-full">
                    <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">Deposit Address</label>
                    <div className="flex">
                      <input 
                        type="text"
                        readOnly
                        value={`1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2`} 
                        className="flex-1 bg-[#0A0B0D] border border-[#1F2937] px-4 py-3 rounded-l text-[#10B981] font-mono text-xs w-full text-center"
                      />
                      <button onClick={() => handleCopy("1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2")} className="bg-[#1F2937] hover:bg-[#374151] px-4 rounded-r transition">
                        <Copy className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Internal Testing Protocol */}
                  <div className="pt-4 mt-4 border-t border-[#1F2937]/50">
                    <p className="text-[10px] text-[#6B7280] mb-2 uppercase tracking-widest">Simulate Network Deposit (Testnet)</p>
                    <form onSubmit={processTransaction} className="flex gap-2 justify-center max-w-xs mx-auto">
                       <input 
                         type="number"
                         value={amount}
                         onChange={e=>setAmount(e.target.value)}
                         placeholder={`Amount`}
                         className="flex-1 bg-[#0A0B0D] border border-[#1F2937] px-3 py-2 rounded text-white text-xs font-mono"
                         required
                       />
                       <button className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-4 py-2 rounded text-[10px] uppercase tracking-widest font-bold hover:bg-[#10B981]/20">Simulate Deposit</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "WITHDRAW" && (
            <form onSubmit={processTransaction} className="space-y-6">
               <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#6B7280] font-mono">Amount to Withdraw</label>
                    <span className="text-[10px] uppercase tracking-widest text-gold-text font-mono">
                      Available: {user?.balances?.[asset] ? Number(user.balances[asset]).toLocaleString(undefined, {maximumFractionDigits: 4}) : "0"} {asset}
                    </span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number"
                      step="any"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-4 rounded text-2xl text-white font-mono outline-none focus:border-[#C5A059]/50 transition"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={handleMax}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest bg-[#1F2937] hover:bg-[#374151] text-white px-3 py-1.5 rounded transition font-bold"
                    >
                      MAX
                    </button>
                  </div>
               </div>

               <div>
                 <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono">
                   {asset === "OSRS" ? "Recipient Character Name" : "Destination Address"}
                 </label>
                 <input 
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={asset === "OSRS" ? "e.g. Zezima" : "0x..."}
                    className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-3 rounded text-white font-mono text-sm outline-none focus:border-[#C5A059]/50 transition"
                    required
                 />
               </div>

               {status?.error && (
                 <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded text-[#EF4444] text-xs flex items-center gap-2 font-mono">
                   <AlertTriangle className="w-4 h-4 shrink-0" /> {status.error}
                 </div>
               )}
               {status?.success && (
                 <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded text-[#10B981] text-xs flex items-center gap-2 font-mono">
                   <CheckCircle className="w-4 h-4 shrink-0" /> {status.success}
                 </div>
               )}

               <button 
                 type="submit"
                 disabled={!amount || Number(amount) <= 0 || !address}
                 className="w-full py-4 rounded uppercase text-xs font-bold tracking-widest transition border disabled:opacity-50 disabled:cursor-not-allowed border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059]/20"
               >
                 Confirm {activeTab}
               </button>
            </form>
          )}

        </div>

        {/* Info pane */}
        <div className="bg-[#0A0B0D] border border-[#1F2937] p-6 rounded-xl flex flex-col space-y-6">
           <h3 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#6B7280] border-b border-[#1F2937] pb-3">Limits & Fees</h3>
           <div className="space-y-4 text-xs font-mono">
              <div className="flex justify-between border-b border-[#1F2937]/50 pb-2">
                <span className="text-[#6B7280]">Withdrawal Limit (24h)</span>
                <span className="text-white">100,000 USD</span>
              </div>
              <div className="flex justify-between border-b border-[#1F2937]/50 pb-2">
                <span className="text-[#6B7280]">Network Fee</span>
                <span className="text-[#C5A059]">0.00%</span>
              </div>
              <div className="flex justify-between border-b border-[#1F2937]/50 pb-2">
                <span className="text-[#6B7280]">Settlement Time</span>
                <span className="text-[#10B981]">Instant</span>
              </div>
           </div>

           <div className="mt-auto pt-6 border-t border-[#1F2937]">
              <p className="text-[10px] leading-relaxed text-[#6B7280] font-sans">
                Withdrawals are subjected to omni-chain security audits. Large transactions may require manual approval from the Overseer echelon.
              </p>
           </div>
        </div>
      </div>

    </div>
  )
}
