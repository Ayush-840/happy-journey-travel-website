"use client";

export default function VerifiedBadge({ type }) {
  const label = type === 'Booking' ? 'Verified by Booking' : 'Verified by Visit';

  return (
    <div className="verified-badge-container" style={{ display: "inline-flex", alignItems: "center", position: "relative" }}>
      <div 
        className="verified-badge" 
        title={label}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)",
          color: "#1a1a1a",
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "10px",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          boxShadow: "0 0 15px rgba(212, 175, 55, 0.4)",
          cursor: "help"
        }}
      >
        <span style={{ fontSize: 12 }}>✨</span>
        {label}
      </div>
    </div>
  );
}
