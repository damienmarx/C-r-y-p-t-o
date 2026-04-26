import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Send, Hash, ShieldAlert } from "lucide-react";

export function GlobalChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = () => {
    fetch("/api/chats")
      .then(r => r.json())
      .then(d => setMessages(d))
      .catch();
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    setInput("");
    await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, message: input })
    });
    fetchChats();
  };

  return (
    <div className="h-full flex flex-col p-6 max-h-[100dvh]">
      <div className="flex items-center gap-2 mb-6">
        <Hash className="w-5 h-5 text-gold-text" />
        <h1 className="text-2xl font-serif font-black tracking-widest text-[#E5E7EB] uppercase">Global Frequency</h1>
      </div>
      
      <div className="flex-1 bg-[#0D0F12] border border-[#1F2937] rounded-xl overflow-hidden flex flex-col relative shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0B0D]/50 pointer-events-none" />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-xl max-w-[80%] border ${msg.userId === user?.id ? 'bg-gold/10 border-gold/30 text-[#C5A059]' : 'bg-[#181B1F] border-[#1F2937] text-white'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded border border-[#374151] overflow-hidden flex-shrink-0 bg-[#0A0B0D]">
                    {msg.avatar ? (
                      <img src={msg.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-mono">{msg.username.slice(0,2)}</div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold font-mono">{msg.username}</span>
                    <span className="ml-2 text-[8px] text-[#6B7280]">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="text-sm font-sans">{msg.message}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1F2937] bg-[#14161A] z-10">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Broadcast to global frequency..."
              className="flex-1 bg-[#0A0B0D] border border-[#1F2937] rounded px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition font-mono text-sm"
              maxLength={200}
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-3 bg-gold/10 text-[#C5A059] border border-gold/30 hover:bg-gold/20 rounded font-serif uppercase tracking-widest text-[10px] transition disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
