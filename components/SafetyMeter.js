"use client";
import { useState, useEffect } from "react";

export default function SafetyMeter({ placeId }) {
  const [data, setData] = useState({ lighting: 0, police: 0, solo: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSafetyData = async () => {
    try {
      const res = await fetch(`/api/safety?place_id=${placeId}`);
      const d = await res.json();
      if (d.success) setData(d.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyData();
  }, [placeId]);

  if (loading) return <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />;

  const metrics = [
    { label: "🔦 Lighting", value: data.lighting, color: "#eab308" },
    { label: "👮 Police", value: data.police, color: "#3b82f6" },
    { label: "🚶 Solo Safety", value: data.solo, color: "#a855f7" }
  ];

  return (
    <div className="glass-card" style={{ padding: 24, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: 1 }}>🛡️ Traveler Safety Meter</h3>
        <span style={{ fontSize: 10, color: "#64748b" }}>{data.count} Verified Reports</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {metrics.map(m => (
          <div key={m.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#cbd5e1" }}>{m.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.value.toFixed(1)} / 5.0</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ 
                height: "100%", width: `${(m.value / 5) * 100}%`, 
                background: m.color, borderRadius: 10,
                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
              }} />
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 20, fontSize: 10, color: "#475569", fontStyle: "italic", lineHeight: 1.5 }}>
        *Ratings are community-sourced and verified via GPS check-ins at the location.
      </p>
    </div>
  );
}
