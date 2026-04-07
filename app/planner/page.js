"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AILoader from "@/components/AILoader";
import ItineraryTimeline from "@/components/ItineraryTimeline";

export default function UnifiedPlanner() {
  // Manual Planner State
  const [manualData, setManualData] = useState({ state: "", city: "", days: 3, budget: "Medium" });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  // AI Planner State
  const [prompt, setPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  
  // Shared Result State
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const generateManual = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setItinerary(null);
    setAiResult(null);

    try {
        const res = await fetch(`/api/itinerary?state=${manualData.state}&city=${manualData.city}&days=${manualData.days}&budget=${manualData.budget}`);
        const data = await res.json();
        if (data.success) setItinerary(data.data);
        else setError("Failed to generate manual itinerary.");
    } catch (err) {
        setError("Network error. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const generateAI = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    setAiLoading(true);
    setAiResult(null);
    setItinerary(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            destination: prompt, // Using prompt as general destination/intent
            days: 3, 
            budget: "Moderate" 
        })
      });
      const data = await res.json();
      if (data.success) setAiResult(data.data);
      else setError(data.error || "AI could not process this request.");
    } catch (err) {
      setError("AI Service unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />

      <main style={{ padding: "120px 24px 100px", maxWidth: 1000, margin: "0 auto" }}>
        
        {/* HERO: AI PLANNER */}
        <section style={{ textAlign: "center", marginBottom: 80 }}>
           <span className="badge badge-primary" style={{ marginBottom: 16 }}>✨ THE MAGIC PLANNER</span>
           <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800, marginBottom: 20 }}>Unified Journey Hub</h1>
           <p style={{ color: "#94a3b8", fontSize: "1.2rem", maxWidth: 600, margin: "0 auto 40px" }}>
              Experience the future of travel. Type your dream trip, or specify every detail manually.
           </p>

           <div className="glass-card" style={{ 
             padding: "10px", borderRadius: 24, background: "rgba(255,255,255,0.03)", 
             border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 10,
             maxWidth: 700, margin: "0 auto"
           }}>
              <input 
                 type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                 placeholder="Where to next? (e.g. A 3-day spiritual trip to Varanasi)"
                 style={{ 
                   flex: 1, background: "transparent", border: "none", color: "white", 
                   padding: "16px 24px", fontSize: 15, outline: "none" 
                 }}
              />
              <button onClick={generateAI} disabled={aiLoading} className="btn-primary" style={{ padding: "0 28px", borderRadius: 16 }}>
                 {aiLoading ? "Wait..." : "✨ Generate AI"}
              </button>
           </div>
        </section>

        {/* VISUAL SEPARATOR */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 80 }}>
           <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.1))" }} />
           <div style={{ display: "flex", flexOverlay: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: 2 }}>OR - Customize Manually</span>
              <div style={{ animation: "bounce 2s infinite", color: "#64748b", fontSize: 16 }}>↓</div>
           </div>
           <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(255,255,255,0.1))" }} />
        </div>

        {/* MANUAL PLANNER */}
        <section className="glass-card" style={{ padding: 40, borderTop: "2px solid rgba(212, 175, 55, 0.2)" }}>
           <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 30, textAlign: "center" }}>Manual Parameters</h3>
           <form onSubmit={generateManual} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, alignItems: "end" }}>
              <div>
                <label className="label">State</label>
                <select value={manualData.state} onChange={handleStateChange} className="input-field" required>
                  <option value="">Select State</option>
                  {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">City</label>
                <select value={manualData.city} onChange={(e) => setManualData({...manualData, city: e.target.value})} className="input-field" required>
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Duration (Days)</label>
                <input type="number" min="1" max="10" value={manualData.days} onChange={e => setManualData({...manualData, days: e.target.value})} className="input-field" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "16px", height: "fit-content" }}>
                 {loading ? "Constructing..." : "Apply Logic"}
              </button>
           </form>
        </section>

        {/* RESULTS OVERLAY / SECTION */}
        {(loading || aiLoading) && (
           <div style={{ marginTop: 60 }}>
              <AILoader />
           </div>
        )}

        {error && (
           <div className="glass-card" style={{ marginTop: 60, padding: 20, textAlign: "center", border: "1px solid #ef444433", color: "#ef4444" }}>
              {error}
           </div>
        )}

        {/* AI Result View */}
        {aiResult && (
           <div style={{ marginTop: 80, animation: "fadeUp 0.8s ease" }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                 <span className="badge badge-primary">✨ AI Generated Itinerary</span>
              </div>
              <ItineraryTimeline data={aiResult} />
           </div>
        )}

        {/* Manual Result View */}
        {itinerary && (
           <div style={{ marginTop: 80, animation: "fadeIn 0.5s ease-out" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 40, borderLeft: "4px solid var(--primary)", paddingLeft: 16 }}>
                 Static Parameters Result
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                {itinerary.itinerary.map(day => (
                  <div key={day.day} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "24px", background: "rgba(212, 175, 55, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <h3 style={{ fontSize: 18, fontWeight: 700 }}>Day {day.day}: {day.title}</h3>
                    </div>
                    <div style={{ padding: 24 }}>
                       <p style={{ color: "#94a3b8", marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>{day.description}</p>
                       <div className="grid-places">
                         {day.activities.map((act, idx) => (
                           <div key={idx} className="glass-card" style={{ padding: 16, background: "rgba(255,255,255,0.02)" }}>
                             <div style={{ height: 120, borderRadius: 10, backgroundImage: `url('${act.image}')`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: 12 }} />
                             <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{act.name}</h4>
                             <div style={{ fontSize: 11, color: "#94a3b8" }}>{act.budget}</div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}

      </main>

      <style jsx>{`
        .label { display: block; margin-bottom: 8px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
