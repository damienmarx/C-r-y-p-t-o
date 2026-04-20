import React, { useState, useEffect } from "react";
import { formatCurrency } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { ArrowDownUp } from "lucide-react";

export function Exchange() {
  const { user, refreshBalances } = useAuth();
  const [marketData, setMarketData] = useState<Record<string, number>>({});
  const [assetIn, setAssetIn] = useState("USD");
  const [assetOut, setAssetOut] = useState("BTC");
  const [amountIn, setAmountIn] = useState("");
  const [txStatus, setTxStatus] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const fetchTransactions = async () => {
    if (!user) return;
    const res = await fetch(`/api/transactions?userId=${user.id}`);
    if (res.ok) {
      const data = await res.json();
      setTransactions(data);
    }
  };

  useEffect(() => {
    const fetchMarket = async () => {
      const res = await fetch("/api/market");
      const data = await res.json();
      setMarketData(data);
    };
    fetchMarket();
    const intv = setInterval(fetchMarket, 2000);
    return () => clearInterval(intv);
  }, []);

  const handleSwap = () => {
    setAssetIn(assetOut);
    setAssetOut(assetIn);
    setAmountIn("");
  };

  const executeTrade = async () => {
    if (!user) return alert("Must be logged in.");
    
    const parsedAmount = parseFloat(amountIn);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          type: "BUY",
          asset: assetOut,
          amount: parsedAmount,
          quoteAsset: assetIn
        })
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setTxStatus(data);
      refreshBalances();
      fetchTransactions();
    } catch {
      alert("Trade execution failed.");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const inPrice = marketData[assetIn] || 1;
  const outPrice = marketData[assetOut] || 1;
  
  const estimatedOut = amountIn ? (parseFloat(amountIn) * inPrice) / outPrice : 0;
  const takerFeeRate = 0.002;
  const feeInAssetOut = estimatedOut * takerFeeRate;
  const finalOut = estimatedOut - feeInAssetOut;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-serif tracking-widest font-bold uppercase gold-text mb-2">Liquidity Exchange</h1>
        <p className="text-[10px] uppercase tracking-widest text-[#6B7280]">Execute low-latency swaps across crypto, fiat, and synthetic MMORPG assets.</p>
      </header>

      <div className="bg-card p-6 border border-[#1F2937] rounded space-y-6">
        
        {/* FROM */}
        <div className="bg-[#0A0B0D] border border-[#1F2937] rounded p-4">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#6B7280] mb-2">
            <span>Pay (Asset In)</span>
            <span className="font-mono">Bal: {formatCurrency(user?.balances[assetIn] || 0, assetIn)}</span>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="number"
              value={amountIn}
              onChange={e => setAmountIn(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-2xl md:text-3xl font-serif text-white outline-none w-full py-2"
            />
            <select 
              value={assetIn}
              onChange={e => setAssetIn(e.target.value)}
              className="bg-[#181B1F] border border-[#1F2937] text-white px-4 py-3 md:py-2 rounded text-xs font-mono tracking-widest uppercase cursor-pointer outline-none"
            >
              {Object.keys({ USD: 1, ...marketData }).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SWAP ICON */}
        <div className="flex justify-center -my-4 relative z-10">
          <button onClick={handleSwap} className="bg-[#181B1F] border border-[#1F2937] text-[#6B7280] hover:gold-text p-3 md:p-2 rounded-full hover:bg-[#14161A] transition active:scale-95 shadow-md">
            <ArrowDownUp className="w-5 h-5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* TO */}
        <div className="bg-[#0A0B0D] border border-[#1F2937] rounded p-4">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#6B7280] mb-2">
            <span>Receive (Asset Out)</span>
            <span className="font-mono">Bal: {formatCurrency(user?.balances[assetOut] || 0, assetOut)}</span>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="text"
              readOnly
              value={finalOut > 0 ? finalOut.toFixed(6) : "0.00"}
              className="bg-transparent text-2xl md:text-3xl font-serif text-[#10B981] outline-none w-full py-2"
            />
            <select 
              value={assetOut}
              onChange={e => setAssetOut(e.target.value)}
              className="bg-[#181B1F] border border-[#1F2937] text-white px-4 py-3 md:py-2 rounded text-xs font-mono tracking-widest uppercase cursor-pointer outline-none"
            >
              {Object.keys({ USD: 1, ...marketData }).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Jargon & Info */}
        <div className="border border-[#1F2937] rounded p-4 space-y-2 text-[10px] uppercase tracking-widest">
          <div className="flex justify-between">
            <span className="text-[#6B7280] border-b border-dotted cursor-help" title="Difference between expected price and executed price">Est. Slippage</span>
            <span className="text-white font-mono">0.05%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280] border-b border-dotted cursor-help" title="Cost of accessing liquidity">Taker Fee (0.2%)</span>
            <span className="text-white font-mono">{feeInAssetOut > 0 ? feeInAssetOut.toFixed(6) : "0.00"} {assetOut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Rate</span>
            <span className="text-white font-mono">1 {assetIn} = {(inPrice / outPrice).toFixed(6)} {assetOut}</span>
          </div>
        </div>

        <button 
          onClick={executeTrade}
          disabled={!amountIn || parseFloat(amountIn) <= 0}
          className="w-full border border-gold text-[#C5A059] bg-[#C5A059]/5 hover:bg-[#C5A059]/10 font-serif tracking-widest py-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed uppercase"
        >
          Execute Swap Order
        </button>

        {txStatus && (
          <div className="mt-4 p-4 border border-[#10B981] bg-[#10B981]/5 rounded text-[10px] font-mono space-y-1">
            <div className="text-[#10B981] font-bold mb-2 uppercase tracking-widest">++ ORDER EXECUTED ++</div>
            <div><span className="text-[#6B7280]">TXID:</span> {txStatus.id}</div>
            <div><span className="text-[#6B7280]">SIGNATURE:</span> {txStatus.signature.substring(0, 32)}...</div>
            <div><span className="text-[#6B7280]">TIME:</span> {new Date(txStatus.timestamp).toLocaleString()}</div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-card border border-[#1F2937] rounded overflow-hidden">
        <div className="p-4 border-b border-[#1F2937] bg-[#181B1F]">
          <h2 className="text-[10px] uppercase font-semibold text-[#6B7280] tracking-widest">Order History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0A0B0D]">
                <th className="p-3 text-[#6B7280] font-sans font-semibold uppercase text-[10px] tracking-widest">Time</th>
                <th className="p-3 text-[#6B7280] font-sans font-semibold uppercase text-[10px] tracking-widest">Pair</th>
                <th className="p-3 text-[#6B7280] font-sans font-semibold uppercase text-[10px] tracking-widest">Type</th>
                <th className="p-3 text-[#6B7280] font-sans font-semibold uppercase text-[10px] tracking-widest">Amount</th>
                <th className="p-3 text-[#6B7280] font-sans font-semibold uppercase text-[10px] tracking-widest">Total</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[10px]">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[#6B7280] uppercase tracking-widest">No order records found.</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-[#1F2937] hover:bg-[#181B1F] transition">
                    <td className="p-3 text-[#9CA3AF]">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 text-white">{tx.asset}/{tx.quoteAsset}</td>
                    <td className="p-3">
                      <span className={tx.type === "BUY" ? "text-[#10B981]" : "text-[#EF4444]"}>{tx.type}</span>
                    </td>
                    <td className="p-3 text-white">{tx.amount.toFixed(4)} {tx.asset}</td>
                    <td className="p-3 text-[#6B7280]">{tx.total.toLocaleString(undefined, {maximumFractionDigits:2})} {tx.quoteAsset}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
