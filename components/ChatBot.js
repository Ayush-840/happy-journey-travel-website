"use client";
import { useState, useEffect, useRef } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Namaste! 🙏 I'm your Happy Journey assistant. How can I help you discover India today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: "bot", text: data.reply || "I'm sorry, I couldn't find information on that. Try asking about a state or city!" }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "Oops! My connection is a bit weak. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 10000, fontFamily: "var(--font-poppins)" }}>
      {/* TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            color: "white", border: "none", cursor: "pointer",
            boxShadow: "0 8px 30px rgba(212, 175, 55, 0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1) rotate(5deg)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}
        >
          💬
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div style={{
          width: "clamp(300px, 90vw, 400px)", height: "clamp(400px, 70vh, 600px)",
          background: "rgba(18, 18, 18, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(212, 175, 55, 0.2)",
          borderRadius: 24, display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          animation: "slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards"
        }}>
          {/* HEADER */}
          <div style={{
            padding: "20px 24px", borderBottom: "1px solid rgba(212, 175, 55, 0.1)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(to right, rgba(212, 175, 55, 0.05), transparent)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✈️</div>
              <div>
                <div style={{ fontWeight: 700, color: "white", fontSize: 15 }}>Happy Bot</div>
                <div style={{ fontSize: 10, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }}></span> Online
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 20 }}>✕</button>
          </div>

          {/* MESSAGES */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%", padding: "12px 16px", borderRadius: 16,
                fontSize: 14, lineHeight: 1.5,
                background: m.role === "user" ? "var(--primary)" : "rgba(255,255,255,0.05)",
                color: m.role === "user" ? "white" : "#cbd5e1",
                border: m.role === "bot" ? "1px solid rgba(255,255,255,0.05)" : "none",
                boxShadow: m.role === "user" ? "0 4px 15px rgba(212, 175, 55, 0.2)" : "none"
              }}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 16 }}>
                <div className="typing-dots"><span>.</span><span>.</span><span>.</span></div>
              </div>
            )}
          </div>

          {/* INPUT */}
          <form onSubmit={handleSend} style={{ padding: 20, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                style={{
                  flex: 1, padding: "12px 16px", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                  color: "white", outline: "none", fontSize: 14
                }}
              />
              <button type="submit" disabled={loading} style={{
                width: 44, height: 44, borderRadius: 12, background: "var(--primary)",
                border: "none", color: "white", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                ➞
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .typing-dots span {
          animation: blink 1.4s infinite both;
          font-weight: bold;
          font-size: 20px;
          margin: 0 1px;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0% { opacity: .2; }
          20% { opacity: 1; }
          100% { opacity: .2; }
        }
      `}</style>
    </div>
  );
}
