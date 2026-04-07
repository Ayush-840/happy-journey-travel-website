"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import VisualSearchZone from "@/components/VisualSearchZone";
import Link from "next/link";

export default function VisualDiscovery() {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />

      <main style={{ padding: "100px 24px 60px", maxWidth: 800, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>✨ Visual Discovery</span>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800 }}>Search by Photo</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Seen a beautiful place in a reel? Upload it and we will find it for you.</p>
        </div>

        {/* Search Zone */}
        <div style={{ marginBottom: 40 }}>
           <VisualSearchZone 
             onMatch={(data) => setMatch(data)} 
             onLoading={(val) => setLoading(val)} 
           />
        </div>

        {/* Loading State Overlay */}
        {loading && (
          <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeUp 0.3s ease" }}>
             <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 2s linear infinite" }}>🤖</div>
             <p style={{ color: "var(--primary)", fontWeight: 700, letterSpacing: 1 }}>AI ANALYZING LANDMARKS...</p>
          </div>
        )}

        {/* Match Found Result */}
        {match && (
           <div className="glass-card" style={{ padding: 40, borderLeft: "4px solid var(--primary)", animation: "fadeUp 0.6s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                   <span className="badge badge-primary" style={{ marginBottom: 12, background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>✅ MATCH FOUND!</span>
                   <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white" }}>{match.location_name}</h2>
                   <p style={{ color: "#94a3b8", marginTop: 10, fontSize: 14, maxWidth: 500, lineHeight: 1.6 }}>{match.summary}</p>
                </div>
                <div style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", padding: "10px 20px", borderRadius: 16 }}>
                   <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>CONFIDENCE</div>
                   <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>{(match.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                 <Link href={`/planner/generate?destination=${match.location_name}`} className="btn-primary" style={{ textDecoration: "none", flex: 1, justifyContent: "center", fontSize: 15, fontWeight: 700, padding: "15px" }}>
                   ✨ Generate My Plan
                 </Link>
                 <button onClick={() => setMatch(null)} className="btn-secondary" style={{ padding: "15px 30px" }}>
                   Try Another Photo
                 </button>
              </div>
           </div>
        )}

      </main>

      <style jsx>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
