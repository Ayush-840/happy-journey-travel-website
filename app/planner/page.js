"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AILoader from "@/components/AILoader";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import BudgetBreakdownCard from "@/components/BudgetBreakdownCard";
import ExpenseSplitterWidget from "@/components/ExpenseSplitterWidget";

export default function UltimatePlannerDashboard() {
  const [prompt, setPrompt] = useState("");
  const [manualData, setManualData] = useState({ state: "", city: "", days: 3, budget: "Medium" });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [manualItinerary, setManualItinerary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/states').then(r => r.json()).then(data => {
      if (data.success) setStates(data.data);
    });
  }, []);

  const handleStateChange = async (e) => {
    const stateName = e.target.value;
    setManualData({ ...manualData, state: stateName, city: "" });
    const state = states.find(s => s.name === stateName);
    if (state) {
        const res = await fetch(`/api/states/${state.slug}`);
        const data = await res.json();
        if (data.success) setCities(data.data.cities || []);
    }
  };

  const generateAI = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true); setAiResult(null); setManualItinerary(null); setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: prompt, days: 3, budget: "Moderate" })
      });
      const data = await res.json();
      if (data.success) setAiResult(data.data);
      else setError(data.error || "AI failed.");
    } catch (err) { setError("AI Error."); } finally { setLoading(false); }
  };

  const generateManual = async (e) => {
    e.preventDefault();
    setLoading(true); setAiResult(null); setManualItinerary(null); setError(null);
    try {
      const res = await fetch(`/api/itinerary?state=${manualData.state}&city=${manualData.city}&days=${manualData.days}&budget=${manualData.budget}`);
      const data = await res.json();
      if (data.success) setManualItinerary(data.data);
      else setError("Manual generation failed.");
    } catch (err) { setError("Network Error."); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />

      <main style={{ padding: "100px 24px 60px", maxWidth: 1400, margin: "0 auto" }}>
        
        {/* TOP: AI PROMPT HERO */}
        <section className="glass-card" style={{ padding: "30px 40px", borderRadius: 24, marginBottom: 40, border: "1px solid rgba(212, 175, 55, 0.15)", background: "rgba(255,255,255,0.03)" }}>
           <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                 <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--primary)", marginBottom: 8, textTransform: "uppercase" }}>✨ AI Magic Planner</label>
                 <input 
                    type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
                    placeholder="Where to next? (e.g. A 5-day cultural trip to Rajasthan)"
                    style={{ width: "100%", background: "none", border: "none", color: "white", fontSize: 18, fontWeight: 600, outline: "none" }}
                 />
              </div>
              <button onClick={generateAI} disabled={loading} className="btn-primary" style={{ padding: "14px 30px", borderRadius: 16 }}>
                 {loading ? "Wait..." : "Generate My Trip"}
              </button>
           </div>
        </section>

        {/* 3-COLUMN DASHBOARD GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 340px", gap: 32, alignItems: "start" }} className="dashboard-grid">
           
           {/* LEFT: MANUAL CONTROL */}
           <aside className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 24, textTransform: "uppercase" }}>🛠️ Manual Params</h3>
              <form onSubmit={generateManual} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                 <div>
                    <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 6 }}>STATE</label>
                    <select value={manualData.state} onChange={handleStateChange} className="input-field" style={{ width: "100%" }} required>
                       <option value="">Select State</option>
                       {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 6 }}>CITY</label>
                    <select value={manualData.city} onChange={e => setManualData({...manualData, city: e.target.value})} className="input-field" style={{ width: "100%" }} required>
                       <option value="">Select City</option>
                       {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 6 }}>DAYS</label>
                    <input type="number" min="1" max="10" value={manualData.days} onChange={e => setManualData({...manualData, days: e.target.value})} className="input-field" style={{ width: "100%" }} />
                 </div>
                 <button type="submit" disabled={loading} className="btn-primary" style={{ padding: 12, fontSize: 13 }}>Apply Logic</button>
              </form>
           </aside>

           {/* CENTER: ITINERARY RESULTS */}
           <section style={{ minWidth: 0 }}>
              {loading && <AILoader />}
              {error && <div style={{ padding: 24, borderRadius: 16, background: "rgba(239, 68, 68, 0.05)", border: "1px solid #ef444433", color: "#fca5a5", textAlign: "center" }}>{error}</div>}
              
              {aiResult && (
                 <div style={{ animation: "fadeUp 0.8s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                       <h2 style={{ fontSize: 24, fontWeight: 800 }}>✨ AI Guided Journey</h2>
                       <span className="badge badge-primary">Day-by-Day View</span>
                    </div>
                    <ItineraryTimeline data={aiResult} />
                 </div>
              )}

              {manualItinerary && (
                 <div style={{ animation: "fadeUp 0.6s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                       <h2 style={{ fontSize: 24, fontWeight: 800 }}>🗺️ Manual Schedule</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                       {manualItinerary.itinerary.map(day => (
                          <div key={day.day} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                             <div style={{ padding: 24, background: "rgba(212, 175, 55, 0.08)", borderBottom: "1px solid rgba(212, 175, 55, 0.1)" }}>
                                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Day {day.day}: {day.title}</h3>
                             </div>
                             <div style={{ padding: 24 }}>
                                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 24 }}>{day.description}</p>
                                <div className="grid-places">
                                   {day.activities.map((act, i) => (
                                      <div key={i} className="glass-card" style={{ padding: 12, background: "rgba(255,255,255,0.02)" }}>
                                         <div style={{ height: 100, borderRadius: 8, backgroundImage: `url('${act.image}')`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: 10 }} />
                                         <h4 style={{ fontSize: 14, fontWeight: 700 }}>{act.name}</h4>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              {!aiResult && !manualItinerary && !loading && (
                 <div style={{ textAlign: "center", padding: "100px 0" }}>
                    <div style={{ fontSize: 64, marginBottom: 20 }}>🛸</div>
                    <h2 style={{ fontSize: 20, color: "#64748b" }}>Your journey is waiting for its architect.</h2>
                 </div>
              )}
           </section>

           {/* RIGHT: FINANCE HUB (Budget + Splitter) */}
           <aside style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <BudgetBreakdownCard initialBudget={15000} />
              <ExpenseSplitterWidget tripId={manualData.city || 'default'} />
           </aside>

        </div>

      </main>

      <style jsx>{`
        @media (max-width: 1100px) {
           .dashboard-grid { grid-template-columns: 1fr !important; }
           aside { order: 2; }
           section { order: 1; }
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
