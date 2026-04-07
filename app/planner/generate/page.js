"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import AILoader from "@/components/AILoader";
import ItineraryTimeline from "@/components/ItineraryTimeline";

export default function AIGenerator() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("Economy");
  const [interests, setInterests] = useState("Sightseeing");
  
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setItinerary(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, budget, interests })
      });
      const data = await res.json();
      if (data.success) {
        setItinerary(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to generate itinerary. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />

      <main style={{ padding: "100px 24px 60px", maxWidth: 800, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>🤖 AI Travel Architect</span>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800 }}>Magic Trip Planner</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Describe your dream trip and let our AI handle the details.</p>
        </div>

        {/* Input Form */}
        {!itinerary && !loading && (
          <div className="glass-card" style={{ padding: 40, borderTop: "2px solid var(--primary)", animation: "fadeUp 0.6s ease" }}>
            <form onSubmit={handleGenerate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 30 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Destination</label>
                  <input 
                    type="text" placeholder="e.g. Paris, Tokyo, Goa" 
                    value={destination} onChange={(e) => setDestination(e.target.value)}
                    className="input-field" required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Trip Duration</label>
                  <select value={days} onChange={(e) => setDays(e.target.value)} className="input-field">
                    {[1,2,3,4,5,7,10,14].map(d => <option key={d} value={d}>{d} Days</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 40 }}>
                <div>
                   <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Budget Level</label>
                   <div style={{ display: "flex", gap: 10 }}>
                     {['Economy', 'Moderate', 'Luxury'].map(b => (
                       <button 
                        key={b} type="button" onClick={() => setBudget(b)} 
                        style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid rgba(212, 175, 55, 0.2)", background: budget === b ? "var(--primary)" : "rgba(255,255,255,0.05)", color: budget === b ? "var(--dark)" : "white", fontWeight: 700, cursor: "pointer", fontSize: 12 }}
                       >
                         {b}
                       </button>
                     ))}
                   </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Interests</label>
                  <input 
                    type="text" placeholder="Nature, History, Nightlife..." 
                    value={interests} onChange={(e) => setInterests(e.target.value)}
                    className="input-field" required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 16, height: 55 }}>
                ✨ Create My Magic Itinerary
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && <AILoader />}

        {/* Result Timeline */}
        {error && (
          <div style={{ padding: 20, background: "rgba(239, 68, 68, 0.1)", borderRadius: 12, color: "#ef4444", textAlign: "center" }}>
            {error}
          </div>
        )}

        {itinerary && (
          <div style={{ animation: "fadeUp 0.8s ease" }}>
             <ItineraryTimeline data={itinerary} />
             <div style={{ textAlign: "center", marginTop: 40 }}>
               <button onClick={() => setItinerary(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", textDecoration: "underline" }}>
                 Start a new plan
               </button>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}
