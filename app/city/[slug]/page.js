"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function CityPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/cities/${slug}`).then(r => r.json()).then(d => { setData(d.data); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "float 1.5s ease-in-out infinite" }}>🏙️</div>
        <div style={{ color: "#94a3b8" }}>Loading city...</div>
      </div>
    </div>
  );

  if (!data) return <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>City not found.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position: "relative", height: "65vh", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${data.hero_image}')`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.4)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--dark) 0%, rgba(153,27,27,0.15) 60%, transparent 100%)" }} />
        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: 13 }}>Home</Link>
            <span style={{ color: "#475569" }}>›</span>
            <Link href={`/state/${data.state_slug}`} style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13 }}>{data.state_name}</Link>
            <span style={{ color: "#475569" }}>›</span>
            <span style={{ color: "var(--primary)", fontSize: 13 }}>{data.name}</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontWeight: 800, color: "white", marginBottom: 16 }}>{data.name}</h1>
          <p style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)", color: "#cbd5e1", maxWidth: 600, lineHeight: 1.7 }}>{data.description}</p>
          <div style={{ marginTop: 20, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <span className="badge badge-classy">📍 {data.lat?.toFixed(4)}, {data.lng?.toFixed(4)}</span>
            <span className="badge badge-primary">🏛️ {data.places?.length} Attractions</span>
          </div>
        </div>
      </div>

      {/* Places Grid */}
      <section style={{ padding: "80px 0 120px" }}>
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>🏛️ Top Attractions</span>
            <h2 className="section-title">Must-Visit Places in {data.name}</h2>
            <p className="section-subtitle">Tap any place to see details, photos, and book your visit</p>
          </div>

          <div className="grid-places">
            {data.places?.map((place, idx) => (
              <Link key={place.slug} href={`/place/${place.slug}`} style={{ textDecoration: "none" }}>
                <div className="glass-card hover-card" style={{ overflow: "hidden" }}>
                  <div style={{
                    height: 220, backgroundImage: `url('${place.hero_image}')`,
                    backgroundSize: "cover", backgroundPosition: "center", position: "relative"
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--dark) 0%, rgba(212,175,55,0.1) 60%, transparent 100%)" }} />
                    {/* Tags */}
                    <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {place.tags?.slice(0, 2).map(t => (
                        <span key={t} className="badge badge-primary" style={{ fontSize: 10 }}>{t}</span>
                      ))}
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px" }}>
                      <h3 style={{ fontSize: 20, fontWeight: 700, color: "white" }}>{place.name}</h3>
                    </div>
                  </div>
                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {place.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>🗓️ {place.best_time}</span>
                      <span style={{ marginLeft: "auto", color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>View Details →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: "30px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#475569", fontSize: 13 }}>
        © 2026 Happy Journey · <Link href="/" style={{ color: "var(--primary)", textDecoration: "none" }}>Back to Home</Link>
      </footer>
    </div>
  );
}
