import React, { useState, useEffect } from "react";
import { Search, Database, Fingerprint, Activity } from "lucide-react";

export function Explorer() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTransactions = () => {
    fetch("/api/transactions")
      .then(r => r.json())
      .then(d => setTransactions(d.reverse()))
      .catch();
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const filtered = transactions.filter(t => t.id.includes(searchTerm) || t.userId.includes(searchTerm) || t.type.includes(searchTerm));

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-gold-text" />
          <h1 className="text-2xl font-serif font-black tracking-widest text-[#E5E7EB] uppercase">Global Ledger</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input 
            type="text" 
            placeholder="Search TXN Hash / UID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[#0A0B0D] border border-[#1F2937] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#C5A059]/50 transition w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0D0F12] border border-[#1F2937] p-4 rounded-xl shadow-lg">
          <div className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1">Network Status</div>
          <div className="text-[#10B981] font-mono text-sm uppercase flex items-center gap-2"><Activity className="w-3 h-3"/> Active / Secured</div>
        </div>
        <div className="bg-[#0D0F12] border border-[#1F2937] p-4 rounded-xl shadow-lg">
          <div className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1">Total Blocks</div>
          <div className="text-white font-serif text-lg">{transactions.length + 10243}</div>
        </div>
        <div className="bg-[#0D0F12] border border-[#1F2937] p-4 rounded-xl shadow-lg">
          <div className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1">Latest Hash</div>
          <div className="text-[#C5A059] font-mono text-xs truncate">{transactions[0]?.id || "0x00...000"}</div>
        </div>
        <div className="bg-[#0D0F12] border border-[#1F2937] p-4 rounded-xl shadow-lg">
          <div className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1">Consensus Model</div>
          <div className="text-white font-mono text-sm uppercase">Proof of Stake (Shadow)</div>
        </div>
      </div>

      <div className="bg-[#0D0F12] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#14161A] border-b border-[#1F2937]">
                <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">TXN Hash</th>
                <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">Block Time</th>
                <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">Type</th>
                <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">Value</th>
                <th className="p-4 text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#6B7280] font-mono text-xs">
                    <Fingerprint className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No transactions found in the global ledger.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-[#1F2937]/50 hover:bg-[#14161A]/50 transition">
                    <td className="p-4 font-mono text-xs text-[#C5A059]">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-3 h-3 text-[#374151]" />
                        {t.id.split('-')[0]}...{t.id.split('-')[4]}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-[#9CA3AF]">{t.timestamp ? new Date(t.timestamp).toLocaleString() : 'Just now'}</td>
                    <td className="p-4 font-mono text-[10px] tracking-widest uppercase text-white">
                      <span className="bg-[#181B1F] border border-[#374151] px-2 py-1 rounded">
                        {t.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-serif text-sm">
                      {t.amount} <span className="text-[10px] text-[#6B7280]">{t.currency}</span>
                    </td>
                    <td className="p-4 text-[10px] uppercase font-bold tracking-widest">
                       <span className={t.status === "COMPLETED" ? "text-[#10B981]" : t.status === "PENDING" ? "text-yellow-500" : "text-white"}>
                          {t.status}
                       </span>
                    </td>
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
