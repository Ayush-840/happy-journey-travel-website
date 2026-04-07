"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function PlannerPage() {
  const [formData, setFormData] = useState({ state: "", city: "", days: 3, budget: "Medium" });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/states').then(r => r.json()).then(data => {
      if (data.success) setStates(data.data);
    });
  }, []);

  const handleStateChange = async (e) => {
    const stateName = e.target.value;
    setFormData({ ...formData, state: stateName, city: "" });
    const state = states.find(s => s.name === stateName);
    if (state) {
        // In our current API, /api/states returns cities nested or we fetch them separately?
        // Let's check the API.
        const res = await fetch(`/api/states/${state.slug}`);
        const data = await res.json();
        if (data.success) setCities(data.data.cities || []);
    }
  };

  const generateTrip = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/itinerary?state=${formData.state}&city=${formData.city}&days=${formData.days}&budget=${formData.budget}`);
    const data = await res.json();
    if (data.success) setItinerary(data.data);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />
      <main className="container" style={{ padding: "100px 0 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span className="badge badge-primary">✨ AI Powered</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, margin: "20px 0" }}>Smart Trip Planner</h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Tell us your destination, and we&apos;ll craft the perfect journey for you.</p>
        </div>

        <div className="glass-card" style={{ padding: "clamp(20px, 5vw, 40px)", marginBottom: 60 }}>
          <form onSubmit={generateTrip} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px 20px", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "#94a3b8" }}>State</label>
              <select value={formData.state} onChange={handleStateChange} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} required>
                <option value="">Select State</option>
                {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "#94a3b8" }}>City</label>
              <select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} required>
                <option value="">Select City</option>
                {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "#94a3b8" }}>Duration (Days)</label>
              <input type="number" min="1" max="10" value={formData.days} onChange={e => setFormData({...formData, days: e.target.value})} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "#94a3b8" }}>Budget</label>
              <select value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} style={{ width: "100%", padding: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }}>
                <option value="Budget">Low Budget</option>
                <option value="Medium">Medium</option>
                <option value="Premium">Premium / Luxury</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "14px", height: "fit-content" }}>
              {loading ? "Generating..." : "Generate Itinerary"}
            </button>
          </form>
        </div>

        {itinerary && (
          <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 40, borderLeft: "4px solid var(--primary)", paddingLeft: 16 }}>
              Your {itinerary.days}-Day Plan for {itinerary.city}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              {itinerary.itinerary.map(day => (
                <div key={day.day} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "20px clamp(16px, 4vw, 30px)", background: "rgba(212, 175, 55, 0.08)", borderBottom: "1px solid rgba(212, 175, 55, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <h3 style={{ fontSize: "clamp(1.1rem, 3vw, 1.3rem)", fontWeight: 700 }}>{day.title}</h3>
                    <span className="badge badge-classy" style={{ flexShrink: 0 }}>Day {day.day}</span>
                  </div>
                  <div style={{ padding: "clamp(16px, 4vw, 30px)" }}>
                    <p style={{ color: "#94a3b8", marginBottom: 24, fontSize: "clamp(13px, 2vw, 14px)", lineHeight: 1.6 }}>{day.description}</p>
                    <div className="grid-places" style={{ gap: 20 }}>
                      {day.activities.map((act, idx) => (
                        <div key={idx} className="glass-card" style={{ padding: 16, background: "rgba(255,255,255,0.02)" }}>
                          <div style={{ height: 160, borderRadius: 12, backgroundImage: `url('${act.image}')`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: 16 }} />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <h4 style={{ fontWeight: 700, fontSize: 16 }}>{act.name}</h4>
                            <span style={{ fontSize: 12, color: "#eab308" }}>⭐ {act.rating}</span>
                          </div>
                          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>{act.description?.slice(0, 100)}...</p>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>💰 Est. Budget: {act.budget}</div>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
