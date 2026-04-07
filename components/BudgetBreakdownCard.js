"use client";
import { useState, useEffect } from "react";

export default function BudgetBreakdownCard({ initialBudget = 10000, onSave }) {
  const [budget, setBudget] = useState(initialBudget);
  const [loading, setLoading] = useState(false);

  const calculateSplit = (total) => ({
    transport: total * 0.30,
    stay: total * 0.40,
    food: total * 0.20,
    sightseeing: total * 0.10,
  });

  const getTier = (total) => {
    if (total > 15000) return { transport: "🚙 Private SUV", stay: "🏰 5-Star Resort", color: "var(--primary)" };
    if (total > 5000) return { transport: "🚕 Private Sedan", stay: "🏨 3-Star Hotel", color: "#eab308" };
    return { transport: "🚍 Public Bus", stay: "🏠 Hostels", color: "#94a3b8" };
  };

  const split = calculateSplit(budget);
  const tier = getTier(budget);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_budget: budget,
          transport_type: tier.transport,
          stay_type: tier.stay,
          user_id: 1 // Mock user
        })
      });
      if ((await res.json()).success) {
        alert("Budget simulation saved to your profile!");
        if (onSave) onSave();
      }
    } catch (err) {
      alert("Error saving budget.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { label: "🚕 Transport", value: split.transport, color: "#3b82f6" },
    { label: "🏨 Stay", value: split.stay, color: "#eab308" },
    { label: "🍲 Food", value: split.food, color: "#22c55e" },
    { label: "🎟️ Sightseeing", value: split.sightseeing, color: "#a855f7" },
  ];

  return (
    <div className="glass-card" style={{ padding: 40, background: "rgba(255,255,255,0.02)", maxWidth: 600, margin: "0 auto" }}>
      
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 8 }}>₹{budget.toLocaleString()}</h2>
        <p style={{ color: "#94a3b8", fontSize: 13, textTransform: "uppercase", letterSpacing: 2 }}>Estimated Trip Budget</p>
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 40 }}>
        <input 
          type="range" min="1000" max="50000" step="500"
          value={budget} onChange={(e) => setBudget(parseInt(e.target.value))}
          style={{ 
            width: "100%", height: 6, background: "rgba(255,255,255,0.1)", 
            borderRadius: 10, appearance: "none", cursor: "pointer"
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 10, color: "#475569", fontWeight: 700 }}>
           <span>₹1,000</span>
           <span>DRAG TO SIMULATE</span>
           <span>₹50,000</span>
        </div>
      </div>

      {/* Breakdown Progress Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 40 }}>
        {categories.map(cat => (
          <div key={cat.label}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{cat.label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: cat.color }}>₹{cat.value.toLocaleString()}</span>
             </div>
             <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ 
                  height: "100%", width: `${(cat.value / budget) * 100}%`, 
                  background: cat.color, borderRadius: 10,
                  transition: "width 0.3s ease-out"
                }} />
             </div>
          </div>
        ))}
      </div>

      {/* Smart Suggestions */}
      <div style={{ 
        padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.03)", 
        border: `1px solid ${tier.color}33`, marginBottom: 32 
      }}>
         <h4 style={{ fontSize: 11, fontWeight: 800, color: tier.color, marginBottom: 16, textTransform: "uppercase" }}>
            💡 Smart Recommendations
         </h4>
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="glass-card" style={{ padding: 12, textAlign: "center" }}>
               <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Travel via</div>
               <div style={{ fontWeight: 700, fontSize: 14 }}>{tier.transport}</div>
            </div>
            <div className="glass-card" style={{ padding: 12, textAlign: "center" }}>
               <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Stay at</div>
               <div style={{ fontWeight: 700, fontSize: 14 }}>{tier.stay}</div>
            </div>
         </div>
      </div>

      <button 
        onClick={handleSave} disabled={loading}
        className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: 16, fontWeight: 800 }}
      >
        {loading ? "SAVING SIMULATION..." : "SAVE BUDGET TO PROFILE"}
      </button>

    </div>
  );
}
