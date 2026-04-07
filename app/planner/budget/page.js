"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BudgetBreakdownCard from "@/components/BudgetBreakdownCard";

export default function BudgetPlannerPage() {
  const [lastBudget, setLastBudget] = useState(null);

  const fetchLastBudget = async () => {
    try {
      const res = await fetch("/api/budget?user_id=1");
      const d = await res.json();
      if (d.success && d.data) setLastBudget(d.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLastBudget();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />

      <main style={{ padding: "120px 24px 60px", maxWidth: 1000, margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>💳 Smart Budgeting</span>
          <h1 style={{ fontSize: "3rem", fontWeight: 800 }}>Trip Budget Simulator</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Drag the slider to see how your dream trip fits into your wallet.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>
          
          {/* Main Simulator */}
          <BudgetBreakdownCard 
            initialBudget={lastBudget ? lastBudget.total_budget : 15000} 
            onSave={fetchLastBudget}
          />

          {/* Info Side */}
          <aside className="glass-card" style={{ padding: 24 }}>
             <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📊 Why Simualte?</h3>
             <ul style={{ padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { icon: "🛶", text: "Avoid mid-trip cash crunch" },
                  { icon: "🏘️", text: "Compare Lux vs Economy" },
                  { icon: "📉", text: "Optimize your spending" },
                  { icon: "💼", text: "Share with travel partners" }
                ].map(item => (
                  <li key={item.text} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#94a3b8" }}>
                     <span style={{ fontSize: 18 }}>{item.icon}</span>
                     {item.text}
                  </li>
                ))}
             </ul>

             {lastBudget && (
                <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                   <h4 style={{ fontSize: 11, color: "#475569", fontWeight: 800, marginBottom: 16, textTransform: "uppercase" }}>
                      🕒 Your Last Saved
                   </h4>
                   <div style={{ padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>₹{lastBudget.total_budget.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>Saved on {new Date(lastBudget.created_at).toLocaleDateString()}</div>
                   </div>
                </div>
             )}
          </aside>

        </div>

      </main>
    </div>
  );
}
