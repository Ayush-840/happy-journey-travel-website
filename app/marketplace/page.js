"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ExperienceCard from "@/components/ExperienceCard";

export default function Marketplace() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(50);
  const [userLoc, setUserLoc] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi

  const fetchExperiences = async (lat, lng, r) => {
    try {
      const res = await fetch(`/api/experiences?lat=${lat}&lng=${lng}&radius=${r}`);
      const data = await res.json();
      if (data.success) {
        setExperiences(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(newLoc);
        fetchExperiences(newLoc.lat, newLoc.lng, radius);
      }, () => {
        fetchExperiences(userLoc.lat, userLoc.lng, radius);
      });
    } else {
      fetchExperiences(userLoc.lat, userLoc.lng, radius);
    }
  }, []);

  const onBook = async (id, qty) => {
    try {
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience_id: id,
          user_id: 1, // Default user
          quantity: qty,
          booking_date: new Date().toISOString().split('T')[0]
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("🎉 Booking Successful! You'll receive a confirmation email soon.");
      } else {
        alert("❌ Booking Failed: " + data.error);
      }
    } catch (err) {
      alert("An error occurred during booking.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />

      <main style={{ padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>🗺️ Discover Local Gems</span>
            <h1 style={{ fontSize: "2.8rem", fontWeight: 800 }}>Experience India</h1>
            <p style={{ color: "#94a3b8", marginTop: 8 }}>Unique activities hosted by local experts near you.</p>
          </div>

          <div className="glass-card" style={{ padding: "16px 24px", minWidth: 280 }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>SEARCH RADIUS</span>
                <span style={{ fontSize: 13, fontWeight: 800 }}>{radius} km</span>
             </div>
             <input 
              type="range" min="1" max="200" value={radius} 
              onChange={(e) => {
                setRadius(e.target.value);
                fetchExperiences(userLoc.lat, userLoc.lng, e.target.value);
              }}
              style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
             />
          </div>
        </div>

        {/* Feed List */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
             {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 350, borderRadius: 16 }}></div>)}
          </div>
        ) : experiences.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
             <div style={{ fontSize: 40, marginBottom: 20 }}>😔</div>
             <h3 style={{ fontSize: "1.5rem", fontWeight: 700 }}>No experiences found</h3>
             <p style={{ color: "#94a3b8", marginTop: 8 }}>Try expanding your search radius!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {experiences.map(exp => (
              <ExperienceCard key={exp.id} experience={exp} onBook={onBook} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
