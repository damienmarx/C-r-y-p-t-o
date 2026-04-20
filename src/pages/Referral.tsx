import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function Referral() {
  const [font, setFont] = useState("'Inter', sans-serif");
  const referralLink = "https://osrs-crypto-int.example.com/ref/TRADER_JOE_77X";

  const templateLetter = `Dear Partner,

I invite you to join the most sophisticated liquidity exchange bridging classical cryptographic assets and MMORPG stores of value. Secure your portfolio, minimize your slippage, and unlock unprecedented cross-game alpha.

Use my secure referral link below:
${referralLink}

Best regards,
A Verified Trader`;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-serif tracking-widest font-bold uppercase gold-text mb-2">Referral & Affiliates</h1>
        <p className="text-[10px] uppercase tracking-widest text-[#6B7280]">Generate structural network value via our decentralized referral matrix.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Generator Controls */}
        <div className="space-y-6">
          <div className="bg-card p-6 space-y-4 border border-[#1F2937] rounded">
            <h3 className="text-[10px] uppercase tracking-widest text-[#6B7280]">QR Matrix Synthesizer</h3>
            
            <div>
              <label className="block text-[10px] uppercase text-[#6B7280] mb-2 font-mono">Typography Select (Asset Branding)</label>
              <select 
                value={font}
                onChange={e => setFont(e.target.value)}
                className="w-full bg-[#0A0B0D] border border-[#1F2937] px-3 py-2 rounded text-white font-mono outline-none text-xs"
              >
                <option value="'Helvetica Neue', Arial, sans-serif">Modern Neo (Helvetica)</option>
                <option value="'Courier New', Courier, monospace">Terminal (Courier)</option>
                <option value="'Georgia', serif">Institutional (Georgia)</option>
              </select>
            </div>

            <div className="bg-[#181B1F] border border-[#1F2937] p-4 rounded">
              <div className="text-[10px] text-[#6B7280] mb-1 font-mono uppercase tracking-widest">Referral End-Node:</div>
              <div className="text-white font-mono text-[10px] truncate">{referralLink}</div>
            </div>
          </div>
          
          <div className="bg-card p-6 space-y-4 border border-[#1F2937] rounded">
            <h3 className="text-[10px] uppercase tracking-widest text-[#6B7280]">Outreach Template</h3>
            <textarea 
              readOnly 
              value={templateLetter} 
              className="w-full h-48 bg-[#0A0B0D] border border-[#1F2937] rounded p-4 text-[#9CA3AF] font-mono text-[10px] resize-none outline-none leading-loose"
            />
          </div>
        </div>

        {/* Visual Output */}
        <div className="bg-card border border-[#1F2937] rounded flex flex-col items-center justify-center p-10 bg-[#C5A059]/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-30"></div>
          
          <div className="p-4 bg-white rounded shadow-sm mb-8">
            <QRCodeSVG 
              value={referralLink} 
              size={200}
              level={"H"}
              fgColor={"#0A0B0D"}
              imageSettings={{
                src: "https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg",
                x: undefined,
                y: undefined,
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
          </div>

          <div style={{ fontFamily: font }} className="text-center space-y-2 relative z-10 transition-all duration-300">
            <h2 className="text-xl font-bold text-white tracking-widest uppercase">SCAN TO SECURE</h2>
            <p className="text-[10px] text-[#9CA3AF] max-w-[250px] mx-auto leading-relaxed uppercase tracking-widest">
              Unlock cross-chain alpha.
              Access high liquidity pools.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
