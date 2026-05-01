"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import AILoader from "@/components/AILoader";

export default function UnifiedDashboard() {
  // Navigation & UI State
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // AI Planner State
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Unified Data State
  const [tripData, setTripData] = useState(null); // { trip_title, itinerary: [] }
  const [expenses, setExpenses] = useState([]);
  const [friends] = useState(["Me", "Aman", "Neha"]);
  const [newExpense, setNewExpense] = useState({ name: "", amount: "", paid_by: "Me" });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync AI itinerary with Expenses
  useEffect(() => {
    if (tripData && tripData.itinerary) {
      // Whenever tripData updates, let's extract costs and add them as implicit expenses 
      // or we just show them. Let's auto-generate a baseline expense list!
      const generatedExpenses = [];
      tripData.itinerary.forEach(day => {
        ['morning', 'afternoon', 'evening'].forEach(time => {
          if (day[time] && day[time].cost) {
            const costVal = parseInt(day[time].cost.replace(/[^0-9]/g, '')) || 0;
            // Converting roughly from USD to INR, or just treat as USD/INR.
            // Let's assume the mock generator returns $, we'll treat it as ₹ * 80 for realism,
            // or just use raw number. Let's multiply by 80 to look like rupees.
            const inrCost = costVal * 80;
            if (inrCost > 0) {
              generatedExpenses.push({
                id: Math.random().toString(),
                name: `${day[time].activity} (Day ${day.day})`,
                amount: inrCost,
                paid_by: "Me",
                isAuto: true
              });
            }
          }
        });
      });
      setExpenses(generatedExpenses);
    }
  }, [tripData]);

  const generateAITrip = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setTripData(null);
    setExpenses([]);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: prompt, days: 3, budget: "Moderate", interests: "General" })
      });
      const data = await res.json();
      if (data.success) {
        setTripData(data.data);
      } else {
        setError(data.error || "Failed to generate itinerary.");
      }
    } catch (err) {
      setError("Network or API Error.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.name || !newExpense.amount) return;
    setExpenses(prev => [...prev, {
      id: Math.random().toString(),
      name: newExpense.name,
      amount: parseInt(newExpense.amount),
      paid_by: newExpense.paid_by,
      isAuto: false
    }]);
    setNewExpense({ name: "", amount: "", paid_by: "Me" });
  };

  const removeExpense = (id) => {
    setExpenses(prev => prev.filter(ex => ex.id !== id));
  };

  // Calculate Totals
  const totalTripCost = expenses.reduce((sum, ex) => sum + ex.amount, 0);
  const perPersonCost = totalTripCost / friends.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white", paddingBottom: 60 }}>
      {/* STICKY HEADER */}
      <header style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: scrolled ? "rgba(18, 18, 18, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
        padding: scrolled ? "12px 24px" : "20px 24px",
        transition: "all 0.3s ease"
      }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
             <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 18, color: "white"
             }}>HJ</div>
             <div style={{ fontWeight: 700, fontSize: 16, color: "white", letterSpacing: "-0.5px" }}>Unified Dashboard</div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
             <button style={{ background: "none", border: "none", color: "white", fontSize: 20, cursor: "pointer", position: "relative" }}>
                🔔
                <span style={{ position: "absolute", top: 0, right: -4, width: 8, height: 8, background: "#ef4444", borderRadius: "50%" }} />
             </button>
             <div style={{ position: "relative" }}>
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{ 
                    width: 40, height: 40, borderRadius: "50%", border: "2px solid var(--primary)",
                    backgroundImage: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')",
                    backgroundSize: "cover", cursor: "pointer"
                  }} 
                />
                {profileOpen && (
                  <div className="glass-card" style={{
                    position: "absolute", top: 50, right: 0, padding: 16, minWidth: 200,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)"
                  }}>
                     <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Arjun Travel</div>
                     <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>arjun@happyjourney.in</div>
                     <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
                     <Link href="#" style={{ display: "block", color: "white", textDecoration: "none", fontSize: 13, padding: "8px 0" }}>⚙️ Settings</Link>
                     <Link href="/" style={{ display: "block", color: "#ef4444", textDecoration: "none", fontSize: 13, padding: "8px 0" }}>🚪 Logout</Link>
                  </div>
                )}
             </div>
          </div>
        </div>
      </header>

      {/* MAIN 3-COLUMN LAYOUT */}
      <main style={{ maxWidth: 1600, margin: "0 auto", padding: "30px 24px", display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 32 }} className="dashboard-grid">
        
        {/* COLUMN 1: AI PLANNER */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "calc(100vh - 120px)", position: "sticky", top: 90 }}>
           <div className="glass-card flex-col" style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: 20 }}>
                 <h2 style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>✨ AI Planner</h2>
                 <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Chat with our AI to generate a custom itinerary instantly.</p>
              </div>

              {/* Chat Interface Mockup */}
              <div style={{ flex: 1, overflowY: "auto", background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 16, marginBottom: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                 <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.05)", padding: "12px 16px", borderRadius: "16px 16px 16px 0", fontSize: 13, maxWidth: "90%", color: "#cbd5e1" }}>
                    Namaste! Where would you like to travel next? Try something like &quot;A 3-day spiritual trip to Varanasi&quot;.
                 </div>
                 {prompt && loading && (
                   <div style={{ alignSelf: "flex-end", background: "var(--primary)", color: "white", padding: "12px 16px", borderRadius: "16px 16px 0 16px", fontSize: 13, maxWidth: "90%" }}>
                     {prompt}
                   </div>
                 )}
              </div>

              <form onSubmit={generateAITrip} style={{ display: "flex", gap: 10 }}>
                 <input 
                   type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
                   placeholder="Enter your trip idea..."
                   className="input-field" style={{ flex: 1, fontSize: 13 }}
                 />
                 <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {loading ? "..." : "✈️"}
                 </button>
              </form>
           </div>
        </div>

        {/* COLUMN 2: TRIP PLANNER (Timeline) */}
        <div className="glass-card" style={{ padding: 32, minHeight: "calc(100vh - 120px)" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: 20, marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>🗺️ Trip Planner</h2>
              <div className="badge badge-primary">Interactive Timeline</div>
           </div>

           {loading && <div style={{ paddingTop: 60 }}><AILoader /></div>}
           {error && <div style={{ color: "#ef4444", padding: 20, background: "rgba(239, 68, 68, 0.1)", borderRadius: 12 }}>{error}</div>}
           
           {!loading && !tripData && !error && (
             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", opacity: 0.5 }}>
                <span style={{ fontSize: 48, marginBottom: 16 }}>🏝️</span>
                <p style={{ fontSize: 14 }}>Your itinerary will appear here once generated.</p>
             </div>
           )}

           {!loading && tripData && (
             <div style={{ animation: "fadeUp 0.6s ease" }}>
                <ItineraryTimeline data={tripData} />
             </div>
           )}
        </div>

        {/* COLUMN 3: EXPENSE SPLIT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "calc(100vh - 120px)", position: "sticky", top: 90 }}>
           <div className="glass-card" style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>💰 Expense Split</h2>
              
              {/* Summary Card */}
              <div style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))", borderRadius: 16, padding: 20, marginBottom: 20, border: "1px solid rgba(212,175,55,0.2)" }}>
                 <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Total Trip Cost</div>
                 <div style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 12 }}>₹{totalTripCost.toLocaleString()}</div>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>Split by {friends.length}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#4ade80" }}>₹{Math.round(perPersonCost).toLocaleString()} / ea</span>
                 </div>
              </div>

              {/* Expense List */}
              <div style={{ flex: 1, overflowY: "auto", marginBottom: 20, paddingRight: 4 }}>
                 <h3 style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 12, textTransform: "uppercase" }}>Itemized Expenses</h3>
                 {expenses.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#475569", textAlign: "center", padding: "20px 0" }}>No expenses yet.</div>
                 ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                       {expenses.map(ex => (
                          <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: 10 }}>
                             <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 6 }}>
                                  {ex.name} 
                                  {ex.isAuto && <span title="Auto-synced from timeline" style={{ fontSize: 10 }}>⚡</span>}
                                </div>
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>Paid by {ex.paid_by}</div>
                             </div>
                             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                               <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>₹{ex.amount.toLocaleString()}</div>
                               {!ex.isAuto && (
                                  <button onClick={() => removeExpense(ex.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14 }}>✕</button>
                               )}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* Quick Add Form */}
              <form onSubmit={handleAddExpense} style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 16, border: "1px solid var(--glass-border)" }}>
                 <h4 style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase" }}>+ Quick Add</h4>
                 <input 
                   type="text" placeholder="Description (e.g. Taxi)" value={newExpense.name}
                   onChange={e => setNewExpense({...newExpense, name: e.target.value})}
                   className="input-field" style={{ fontSize: 13, padding: "8px 12px", marginBottom: 8 }} required
                 />
                 <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input 
                      type="number" placeholder="₹ Amount" value={newExpense.amount}
                      onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                      className="input-field" style={{ flex: 1, fontSize: 13, padding: "8px 12px" }} required min="1"
                    />
                    <select 
                      value={newExpense.paid_by} onChange={e => setNewExpense({...newExpense, paid_by: e.target.value})}
                      className="input-field" style={{ width: "90px", fontSize: 13, padding: "8px" }}
                    >
                      {friends.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                 </div>
                 <button type="submit" className="btn-primary" style={{ width: "100%", padding: "10px", fontSize: 13, justifyContent: "center" }}>Add Expense</button>
              </form>
           </div>
        </div>

      </main>

      <style jsx>{`
        @media (max-width: 1200px) {
           .dashboard-grid { grid-template-columns: 1fr 1.5fr 1fr !important; }
        }
        @media (max-width: 992px) {
           .dashboard-grid { 
             grid-template-columns: 1fr !important;
             gap: 24px;
           }
           .dashboard-grid > div { height: auto !important; position: relative !important; top: 0 !important; }
        }
      `}</style>
    </div>
  );
}
