import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Shield, Terminal, ArrowRight } from "lucide-react";

export function Login() {
  const { login } = useAuth();
  const [osrsUsername, setOsrsUsername] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!osrsUsername) return;
    setIsSubmitting(true);
    await login(osrsUsername, accessKey);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0D]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 blur-sm mix-blend-color-dodge"></div>
      
      <div className="relative z-10 p-8 bg-[#0D0F12] border border-[#1F2937] shadow-2xl rounded-2xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#181B1F] border border-gold rounded-xl mb-4 flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(197,160,89,0.2)]">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gold/20 to-transparent"></div>
            <Lock className="w-6 h-6 text-gold" />
          </div>
          <h1 className="text-2xl font-serif tracking-widest font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-[#FCD34D] text-center">
            Operator Access
          </h1>
          <p className="text-[#6B7280] text-[10px] font-mono tracking-widest text-center uppercase mt-2">
            Establish secure connection to node
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono flex items-center gap-2">
                <Terminal className="w-3 h-3" /> OSRS Username
              </label>
              <input 
                type="text"
                value={osrsUsername}
                onChange={e => setOsrsUsername(e.target.value)}
                className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-3 rounded text-white focus:border-[#C5A059]/50 transition font-mono outline-none"
                placeholder="Ex. Zezima"
                required
              />
           </div>
           
           <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#6B7280] mb-2 font-mono flex items-center gap-2">
                <Shield className="w-3 h-3" /> Global Access Key (Optional)
              </label>
              <input 
                type="password"
                value={accessKey}
                onChange={e => setAccessKey(e.target.value)}
                className="w-full bg-[#181B1F] border border-[#1F2937] px-4 py-3 rounded text-[#C5A059] focus:border-[#C5A059]/50 transition font-mono outline-none"
                placeholder="••••••••"
              />
           </div>

           <button 
             type="submit" 
             disabled={isSubmitting || !osrsUsername}
             className="w-full mt-4 flex items-center justify-center gap-2 border border-gold text-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059]/20 font-serif tracking-widest px-6 py-4 rounded transition uppercase text-[10px] font-bold disabled:opacity-50"
           >
             Initialize Uplink <ArrowRight className="w-4 h-4" />
           </button>
        </form>
      </div>
    </div>
  );
}
