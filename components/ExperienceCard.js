"use client";
import { useState } from 'react';

export default function ExperienceCard({ experience, onBook }) {
  const [booking, setBooking] = useState(false);
  const [qty, setQty] = useState(1);

  const handleBooking = async () => {
    setBooking(true);
    await onBook(experience.id, qty);
    setBooking(false);
  };

  return (
    <div className="glass-card hover-card" style={{ overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Badge for duration */}
      <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, zIndex: 10 }}>
        ⏱️ {experience.duration}
      </div>

      <div style={{ height: 180, backgroundImage: `url('${experience.image_url}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
      
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "white" }}>{experience.title}</h3>
          <div style={{ color: "var(--primary)", fontWeight: 800, fontSize: 18 }}>₹{experience.price_per_person}</div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 15, fontSize: 12, color: "#94a3b8" }}>
          <span>👤 Hosted by <span style={{ color: "white", fontWeight: 600 }}>{experience.host_name}</span></span>
        </div>

        <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 20, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {experience.description}
        </p>

        <div style={{ marginTop: "auto", display: "flex", gap: 10, padding: "15px 0 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
             <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: "8px 12px", border: "none", background: "transparent", color: "white", cursor: "pointer" }}>-</button>
             <span style={{ padding: "0 10px", width: 30, textAlign: "center", fontWeight: 700 }}>{qty}</span>
             <button onClick={() => setQty(qty + 1)} style={{ padding: "8px 12px", border: "none", background: "transparent", color: "white", cursor: "pointer" }}>+</button>
          </div>
          <button 
            onClick={handleBooking}
            disabled={booking}
            className="btn-primary" 
            style={{ flex: 1, padding: "10px", fontSize: 13, justifyContent: "center" }}
          >
            {booking ? "Booking..." : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
