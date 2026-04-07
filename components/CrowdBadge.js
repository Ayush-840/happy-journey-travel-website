"use client";
import { useState, useEffect } from "react";

export default function CrowdBadge({ placeId }) {
  const [occupancy, setOccupancy] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOccupancy = async () => {
    try {
      const res = await fetch(`/api/crowd?place_id=${placeId}`);
      const data = await res.json();
      if (data.success) {
        setOccupancy(data.occupancy);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupancy();
    const interval = setInterval(fetchOccupancy, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [placeId]);

  const handleCheckIn = async () => {
    try {
      const res = await fetch("/api/crowd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id: placeId })
      });
      if ((await res.json()).success) {
        setCheckedIn(true);
        fetchOccupancy();
      }
    } catch (err) {
      alert("Check-in failed.");
    }
  };

  if (loading) return <div className="skeleton" style={{ width: 120, height: 28, borderRadius: 20 }} />;

  const getStatus = (occ) => {
    if (occ < 30) return { label: "Peaceful", color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" };
    if (occ < 70) return { label: "Moderate", color: "#eab308", bg: "rgba(234, 179, 8, 0.1)" };
    return { label: "Crowded", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
  };

  const status = getStatus(occupancy || 0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "6px 16px", borderRadius: 20, 
        background: status.bg, border: `1px solid ${status.color}44`,
        color: status.color, fontSize: 11, fontWeight: 800, textTransform: "uppercase",
        letterSpacing: 0.5
      }}>
        <span style={{ 
          width: 8, height: 8, borderRadius: "50%", background: status.color,
          boxShadow: `0 0 10px ${status.color}`,
          animation: occupancy > 70 ? "pulse 1.5s infinite" : "none"
        }} />
        {status.label} • {occupancy}% LIVE
      </div>

      {!checkedIn && (
        <button onClick={handleCheckIn} style={{
          background: "none", border: "1px dashed rgba(255,255,255,0.2)",
          color: "#94a3b8", fontSize: 10, padding: "6px 12px", borderRadius: 20,
          cursor: "pointer", transition: "all 0.2s"
        }}
        onMouseEnter={e => e.target.style.borderColor = "var(--primary)"}
        onMouseLeave={e => e.target.style.borderColor = "rgba(255,255,255,0.2)"}>
          📍 Check-in
        </button>
      )}
    </div>
  );
}
