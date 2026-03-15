"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function StatePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/states/${slug}`).then(r => r.json()).then(d => { setData(d.data); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "float 1.5s ease-in-out infinite" }}>✈️</div>
        <div style={{ color: "#94a3b8" }}>Loading destination...</div>
      </div>
    </div>
  );

  if (!data) return <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>State not found.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position: "relative", height: "65vh", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${data.hero_image}')`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.4)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--dark) 0%, rgba(15,23,42,0.3) 60%, transparent 100%)" }} />
        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
            ← Back to Home
          </Link>
          <span className="badge badge-primary" style={{ marginBottom: 16 }}>{data.region} India</span>
          <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontWeight: 800, color: "white", marginBottom: 16 }}>{data.name}</h1>
          <p style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)", color: "#cbd5e1", maxWidth: 600, lineHeight: 1.7, marginBottom: 32 }}>{data.description}</p>
          
          <Link href={`/planner?state=${data.name}`} className="btn-primary" style={{ padding: "16px 32px", fontSize: 16, borderRadius: 12 }}>
            ✨ Plan My {data.name} Trip
          </Link>
        </div>
      </div>

      {/* Cities */}
      <section style={{ padding: "80px 24px 60px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>🏙️ {data.cities?.length} Destinations</span>
            <h2 className="section-title">Explore Cities in {data.name}</h2>
            <p className="section-subtitle">The gateway to your next adventure</p>
          </div>

          <div className="grid-places">
            {data.cities?.map((city, idx) => (
              <Link key={city.slug} href={`/city/${city.slug}`} style={{ textDecoration: "none" }}>
                <div className="glass-card hover-card" style={{ overflow: "hidden", animationDelay: `${idx * 0.08}s` }}>
                  <div style={{
                    height: 220, backgroundImage: `url('${city.hero_image}')`,
                    backgroundSize: "cover", backgroundPosition: "center", position: "relative"
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.95) 0%, transparent 60%)" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px" }}>
                      <h3 style={{ fontSize: 20, fontWeight: 700, color: "white" }}>{city.name}</h3>
                    </div>
                  </div>
                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16, height: 44, overflow: "hidden" }}>
                      {city.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#64748b" }}>📍 Explore Now</span>
                      <span style={{ marginLeft: "auto", color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>Explore →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Attractions Section (Dynamic) */}
      <section style={{ padding: "60px 24px", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h2 className="section-title">Top Attractions</h2>
          <p className="section-subtitle">Must-visit landmarks in {data.name}</p>
          <div className="grid-places" style={{ marginTop: 40 }}>
            {/* We'll show placeholders for now or if we implement an API to get all places for a state, we use it */}
            <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🏛️</div>
              <h3 style={{ color: "white", marginBottom: 8 }}>Historical Monuments</h3>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Explore the rich heritage and colonial history of {data.name}.</p>
            </div>
            <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🏖️</div>
              <h3 style={{ color: "white", marginBottom: 8 }}>Nature & Beaches</h3>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Relax at the most beautiful tropical paradises in Asia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h2 className="section-title">Things to Do</h2>
          <p className="section-subtitle">Make your trip memorable with these activities</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginTop: 40 }}>
            {[
              { icon: "🤿", name: "Scuba Diving", desc: "Explore coral reefs" },
              { icon: "🚣", name: "Island Hopping", desc: "Visit hidden islands" },
              { icon: "🌅", name: "Sunset Cruise", desc: "Serene evening views" }
            ].map(act => (
              <div key={act.name} className="glass-card" style={{ padding: 24, borderRadius: 20, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{act.icon}</div>
                <h4 style={{ color: "white", fontSize: 16, marginBottom: 4 }}>{act.name}</h4>
                <p style={{ color: "#64748b", fontSize: 12 }}>{act.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section style={{ padding: "60px 24px 120px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h2 className="section-title" style={{ textAlign: "left" }}>Explore on Map</h2>
          <div className="glass-card" style={{ marginTop: 32, padding: 12, borderRadius: 24, overflow: "hidden" }}>
             <iframe
                src={`https://maps.google.com/maps?q=${data.name}&z=6&output=embed`}
                style={{ width: "100%", height: 450, border: "none" }}
                allowFullScreen loading="lazy"
             />
          </div>
        </div>
      </section>

      <footer style={{ padding: "30px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#475569", fontSize: 13 }}>
        © 2026 Happy Journey · <Link href="/" style={{ color: "var(--primary)", textDecoration: "none" }}>Back to Home</Link>
      </footer>
    </div>
  );
}
