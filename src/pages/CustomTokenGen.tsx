import React, { useState } from "react";
import { generateTokenImage } from "../lib/gemini";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, Wand2, Plus } from "lucide-react";

export function CustomTokenGen() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", ticker: "", origin: "", prompt: "" });
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [status, setStatus] = useState<"idle"|"generating"|"done"|"error">("idle");
  const [image, setImage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Must be logged in.");
    if (user.role !== "ADMIN") return alert("Only Admins can launch tokens.");
    
    setStatus("generating");
    try {
      const imgData = await generateTokenImage(`A high resolution, elegant crypto coin logo with no text. The coin represents: ${form.prompt}. Clean, graphic design, suitable for dark mode UI.`, size);
      setImage(imgData);

      // Register Token in Backend
      await fetch("/api/custom-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: form.name,
          ticker: form.ticker.toUpperCase(),
          supply: 1000000,
          description: form.prompt,
          eventOrigin: form.origin
        })
      });

      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <header className="mb-8">
          <h1 className="text-2xl font-serif tracking-widest font-bold uppercase gold-text mb-2">Token Generation</h1>
          <p className="text-[10px] uppercase tracking-widest text-[#6B7280]">Administrators may mint custom tokens for platform events, rallys, and special campaigns. Includes AI-generated iconography.</p>
        </header>

        {user?.role !== "ADMIN" && (
          <div className="mb-6 p-4 border border-[#EF4444] bg-[#EF4444]/5 rounded text-[#EF4444] text-[10px] tracking-widest uppercase flex gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Unauthorized entity. You lack permission to execute smart contracts or mint assets on this subnet.</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-5 bg-card p-6 border border-[#1F2937] rounded">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2">Asset Name</label>
            <input required disabled={user?.role !== "ADMIN" || status === "generating"} value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#0A0B0D] border border-[#1F2937] px-3 py-2 rounded text-white outline-none focus:border-gold/50" placeholder="e.g. Falador Riot Gold" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2">Ticker</label>
              <input required disabled={user?.role !== "ADMIN" || status === "generating"} value={form.ticker} onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})} className="w-full bg-[#0A0B0D] border border-[#1F2937] px-3 py-2 rounded text-white font-mono outline-none focus:border-gold/50" placeholder="FALA" maxLength={5} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2">Event Origin</label>
              <input required disabled={user?.role !== "ADMIN" || status === "generating"} value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} className="w-full bg-[#0A0B0D] border border-[#1F2937] px-3 py-2 rounded text-white outline-none focus:border-gold/50" placeholder="Summer Rally '26" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2">AI Image Generation Prompt (Gemini Pro)</label>
            <textarea required disabled={user?.role !== "ADMIN" || status === "generating"} value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} className="w-full h-24 bg-[#0A0B0D] border border-[#1F2937] px-3 py-2 rounded text-white outline-none focus:border-gold/50 resize-none font-serif text-sm" placeholder="A glowing golden sword inscribed with ancient runes..." />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2">Resolution Strategy</label>
            <div className="flex gap-2">
              {(["1K", "2K", "4K"] as const).map(s => (
                <button type="button" key={s} disabled={user?.role !== "ADMIN" || status === "generating"} onClick={() => setSize(s)} className={`flex-1 py-1 text-[10px] tracking-widest uppercase font-mono border rounded transition ${size === s ? "border-gold text-[#C5A059] bg-[#C5A059]/10" : "border-[#1F2937] text-[#6B7280] hover:border-[#374151]"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button disabled={user?.role !== "ADMIN" || status === "generating"} type="submit" className="w-full flex items-center justify-center gap-2 border border-gold text-[#C5A059] bg-[#C5A059]/5 hover:bg-[#C5A059]/10 font-serif tracking-widest py-3 mt-4 rounded transition disabled:opacity-50 uppercase text-xs">
            {status === "generating" ? <span className="animate-pulse flex items-center gap-2"><Wand2 className="w-3 h-3" /> Synthesizing...</span> : <span className="flex items-center gap-2"><Plus className="w-3 h-3" /> Mint Execution</span>}
          </button>
        </form>
      </div>

      <div className="flex flex-col pt-8 md:pt-0 border-t border-[#1F2937] md:border-t-0 md:border-l md:pl-10">
        <h2 className="text-[10px] font-sans uppercase tracking-widest text-[#6B7280] mb-4">Output Matrix</h2>
        <div className="flex-1 bg-card border border-[#1F2937] rounded flex items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#14161A] to-[#0A0B0D]">
          {image ? (
            <div className="p-6 w-full flex flex-col items-center">
              <div className="w-64 h-64 rounded-full overflow-hidden border border-gold shadow-[0_0_30px_rgba(197,160,89,0.15)] mb-6">
                <img src={image} className="w-full h-full object-cover" alt="Generated Custom Token" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-2xl font-serif tracking-widest gold-text">{form.ticker}</h3>
              <p className="text-[#6B7280] text-[10px] uppercase tracking-widest mt-2 font-mono">Contract Deployed & Secured.</p>
            </div>
          ) : (
            <div className="text-center text-[#374151] font-mono text-[10px] uppercase tracking-widest max-w-[200px]">
               No generative output. Initiate sequence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
