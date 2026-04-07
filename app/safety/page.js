"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

// Leaflet markers can break SSR, so we dynamic import the map
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default function SafetyHub() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all places with their lat/lng and mock crowd data
    fetch("/api/places")
      .then(r => r.json())
      .then(d => {
        // For simulation, add a "crowd" level to each place
        const enriched = (d.data || []).map(p => ({
          ...p,
          crowd: Math.floor(Math.random() * 100)
        }));
        setPlaces(enriched);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ height: "100vh", background: "var(--dark)" }}>Loading Safety Hub...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />
      
      <main style={{ padding: "120px 24px 60px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>🛡️ Safety & Crowd Intelligence</span>
          <h1 style={{ fontSize: "3rem", fontWeight: 800 }}>India Live Safety Map</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Real-time heatmaps, crowd alerts, and safety scores across all major destinations.</p>
        </div>

        <div className="glass-card" style={{ height: 600, borderRadius: 24, overflow: "hidden", position: "relative" }}>
          {/* We use standard circles for the heatmap effect since leaflet.heat requires a browser-only side effect hack */}
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {places.map(place => (
              <Marker key={place.id} position={[place.lat, place.lng]}>
                <Popup>
                  <div style={{ color: "black", padding: 5 }}>
                    <strong style={{ fontSize: 14 }}>{place.name}</strong>
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ 
                        padding: "3px 8px", borderRadius: 10, fontSize: 10, fontWeight: 800,
                        background: place.crowd > 70 ? "#fee2e2" : "#fefce8",
                        color: place.crowd > 70 ? "#ef4444" : "#eab308"
                       }}>
                         {place.crowd}% CROWDED
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <style>{`
            .leaflet-container { background: #0f172a !important; }
            .leaflet-tile { filter: invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2); }
          `}</style>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginTop: 40 }}>
           <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>🔦</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Lighting Analysis</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>Real-time reports on visibility and street lighting coverage for evening travelers.</p>
           </div>
           <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>👮</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Police Presence</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>Active monitoring of nearby police stations and security checkpoints.</p>
           </div>
           <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>🚶</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Solo-Safe Scores</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>Verified feedback from solo travelers on local hospitality and safety standards.</p>
           </div>
        </div>
      </main>
    </div>
  );
}
