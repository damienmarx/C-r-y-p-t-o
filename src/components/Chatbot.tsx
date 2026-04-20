import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Mic } from "lucide-react";
import { sendChatMessage } from "../lib/gemini";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<{role: "user" | "model", content: string}[]>([
    { role: "model", content: "Greetings, trader. I am your AI Investment Advisor. How can I assist you with generating alpha today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput("");
    
    const newHistory = [...history, { role: "user" as const, content: userMsg }];
    setHistory(newHistory);
    setIsTyping(true);

    try {
      const responseText = await sendChatMessage(history, userMsg);
      setHistory([...newHistory, { role: "model", content: responseText }]);
    } catch (e) {
      setHistory([...newHistory, { role: "model", content: "Error: Could not reach the oracle." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-card border border-gold rounded-full flex items-center justify-center shadow-2xl transition hover:scale-105 z-50 group hover:bg-[#C5A059]/10"
      >
        <Bot className="w-5 h-5 text-[#C5A059] group-hover:glow-gold" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-0 right-0 w-full h-[70vh] sm:h-[500px] sm:bottom-20 sm:right-6 sm:w-96 bg-card border-t sm:border border-[#1F2937] sm:rounded flex flex-col shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#1F2937] flex items-center justify-between bg-[#181B1F]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#C5A059]" />
                <span className="text-[10px] uppercase tracking-widest text-white font-semibold">AI Advisor</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#6B7280] hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {history.map((msg, i) => (
                <div key={i} className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "self-end items-end ml-auto" : "self-start items-start")}>
                  <div className={cn(
                    "p-3 rounded text-xs",
                    msg.role === "user" ? "bg-[#181B1F] text-white border border-[#1F2937]" : "bg-transparent text-[#9CA3AF] border border-[#1F2937] font-serif"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="bg-transparent text-[#6B7280] border border-[#1F2937] p-3 rounded text-[10px] uppercase tracking-widest w-fit animate-pulse font-mono">
                  Synthesizing...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#1F2937] flex items-center gap-2 bg-[#181B1F]">
              <input 
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Query semantic alpha..."
                className="flex-1 bg-transparent border border-[#1F2937] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/50 font-serif"
              />
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className="w-8 h-8 flex items-center justify-center bg-[#C5A059] hover:bg-[#a9813c] text-black rounded disabled:opacity-50 transition">
                <Send className="w-3 h-3 ml-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
