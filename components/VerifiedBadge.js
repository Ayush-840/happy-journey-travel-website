"use client";

export default function VerifiedBadge({ type }) {
  const label = type === 'Booking' ? 'Verified by Booking' : 'Verified by Visit';

  return (
    <div className="verified-badge-container" style={{ display: "inline-flex", alignItems: "center", position: "relative" }}>
      <style jsx>{`
        .verified-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #FFD700 0%, #D4AF37 100%);
          color: #1a1a1a;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
          animation: pulse 2s infinite;
          cursor: help;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.4); }
          50% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.6); }
          100% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.4); }
        }
      `}</style>
      
      <div className="verified-badge" title={label}>
        <span style={{ fontSize: 12 }}>✨</span>
        {label}
      </div>
    </div>
  );
}
