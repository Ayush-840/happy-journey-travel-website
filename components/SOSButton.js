"use client";
import { useState } from "react";

export default function SOSButton() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSOS = async () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const message = `🚨 EMERGENCY: I need help! My live location: ${mapsUrl}`;
        
        // In a real app, this would send to an emergency contact via Twilio/SMS
        // For now, we open a WhatsApp share link
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
        setLoading(false);
        setActive(false);
      },
      (err) => {
        alert("Failed to get location. Please enable GPS for SOS.");
        setLoading(false);
      }
    );
  };

  return (
    <div style={{ position: "fixed", bottom: 40, right: 40, zIndex: 9999 }}>
      {/* Menu Expansion */}
      {active && (
        <div className="glass-card" style={{ 
          marginBottom: 16, padding: "20px 24px", width: 260, 
          background: "rgba(127, 29, 29, 0.95)", border: "1px solid rgba(248, 113, 113, 0.3)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)", borderRadius: 16,
          animation: "fadeUp 0.3s ease"
        }}>
          <h4 style={{ color: "white", fontSize: 14, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
             🚨 EMERGENCY SOS
          </h4>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, lineHeight: 1.5, marginBottom: 16 }}>
             Pressing the button below will get your GPS location and share it with your emergency contacts.
          </p>
          <button 
            onClick={handleSOS} disabled={loading}
            style={{ 
              width: "100%", background: "white", color: "#b91c1c", 
              border: "none", padding: "12px", borderRadius: 10,
              fontWeight: 900, fontSize: 13, cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={e => e.target.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          >
            {loading ? "FETCHING GPS..." : "GET HELP NOW"}
          </button>
        </div>
      )}

      {/* Main Toggle Button */}
      <button 
        onClick={() => setActive(!active)}
        style={{ 
          width: 60, height: 60, borderRadius: "50%", 
          background: active ? "#b91c1c" : "rgba(185, 28, 28, 0.8)",
          boxShadow: "0 8px 30px rgba(185, 28, 28, 0.4)",
          border: "none", color: "white", fontSize: 24, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: !active ? "pulse-red 2s infinite" : "none"
        }}
      >
        {active ? "✕" : "🆘"}
      </button>

      <style>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(185, 28, 28, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(185, 28, 28, 0); }
          100% { box-shadow: 0 0 0 0 rgba(185, 28, 28, 0); }
        }
      `}</style>
    </div>
  );
}
