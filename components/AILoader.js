"use client";

export default function AILoader() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "300px", padding: 40, textAlign: "center", position: "relative", overflow: "hidden",
      background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)"
    }}>
      <style jsx>{`
        @keyframes planeFly {
          0% { transform: translate(-150%, 20px) rotate(5deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(150%, -20px) rotate(5deg); opacity: 0; }
        }
        @keyframes cloudFloat {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .plane {
          font-size: 50px;
          animation: planeFly 3s infinite linear;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3));
          z-index: 10;
        }
        .cloud {
          position: absolute;
          background: rgba(255,255,255,0.1);
          filter: blur(20px);
          border-radius: 50%;
          animation: cloudFloat linear infinite;
        }
      `}</style>

      {/* Animated Clouds */}
      <div className="cloud" style={{ width: 120, height: 40, top: "30%", animationDuration: "8s" }} />
      <div className="cloud" style={{ width: 180, height: 60, top: "50%", animationDuration: "12s", animationDelay: "-4s" }} />
      <div className="cloud" style={{ width: 100, height: 30, top: "70%", animationDuration: "6s", animationDelay: "-2s" }} />

      <div className="plane">✈️</div>

      <div style={{ marginTop: 40, zIndex: 20 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 12, background: "linear-gradient(135deg, #fff, var(--primary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Generating Your Dream Trip...
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 300, margin: "0 auto", lineHeight: 1.6 }}>
          Our AI architect is analyzing destinations, budgets, and your interests to create the perfect itinerary.
        </p>
      </div>

      {/* Progress Line */}
      <div style={{ width: "200px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: 10, marginTop: 30, overflow: "hidden", position: "relative" }}>
         <div style={{ position: "absolute", inset: 0, background: "var(--primary)", width: "40%", borderRadius: 10, animation: "loadingBar 2s infinite ease-in-out" }} />
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
