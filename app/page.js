"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const heroSlides = [
  { url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600", title: "Taj Mahal, Agra", sub: "Uttar Pradesh" },
  { url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600", title: "Baga Beach", sub: "Goa" },
  { url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600", title: "Kerala Backwaters", sub: "Kerala" },
  { url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1600", title: "Thar Desert", sub: "Rajasthan" },
  { url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600", title: "Manali Mountains", sub: "Himachal Pradesh" },
];

export default function HomePage() {
  const [states, setStates] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch("/api/states").then(r => r.json()).then(d => { setStates(d.data || []); setLoading(false); });
    // Geolocation
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch(`/api/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
            .then(r => r.json()).then(d => { setNearby(d.data || []); setNearbyLoading(false); });
        },
        () => setNearbyLoading(false)
      );
    }
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 4500);
    return () => clearInterval(intervalRef.current);
  }, []);

  const currentSlide = heroSlides[slide];

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)" }}>
      <Navbar />

      {/* HERO */}
      <section style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        {/* Background image */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url('${currentSlide.url}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          transition: "background-image 0.8s ease",
          filter: "brightness(0.45)"
        }} />
        {/* Overlay gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--dark) 0%, rgba(18,18,18,0.4) 50%, transparent 100%)" }} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" style={{
            width: 6 + i * 2, height: 6 + i * 2, left: `${10 + i * 15}%`, top: `${20 + i * 10}%`,
            animationDelay: `${i * 0.8}s`, animationDuration: `${5 + i}s`
          }} />
        ))}

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          {/* HJ Badge */}
          <div className="badge badge-primary fade-up" style={{ fontSize: 13, padding: "6px 18px", marginBottom: 20 }}>
            ✈️ Your Travel Companion
          </div>

          <h1 className="fade-up-1" style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16, letterSpacing: "-1px" }}>
            <span style={{ background: "linear-gradient(135deg, #fff 30%, var(--primary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Discover the
            </span>
            <br />
            <span style={{ color: "white" }}>Soul of India</span>
          </h1>

          <p className="fade-up-2" style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)", color: "#cbd5e1", maxWidth: 580, lineHeight: 1.7, marginBottom: 36 }}>
            Plan your journey, explore iconic destinations, book transport & stays — all in one platform.
          </p>

          <div className="fade-up-3" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="#states" className="btn-primary" style={{ fontSize: 16, padding: "14px 36px" }}>
              🗺️ Explore Destinations
            </a>
            <a href="#nearby" className="btn-secondary" style={{ fontSize: 16, padding: "14px 36px" }}>
              📍 Near Me
            </a>
          </div>

          {/* Slide indicator + caption */}
          <div className="fade-up-4" style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ color: "#f8fafc", fontSize: 15, fontWeight: 600 }}>{currentSlide.title}</div>
            <div style={{ color: "#94a3b8", fontSize: 12, letterSpacing: 2 }}>{currentSlide.sub.toUpperCase()}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} style={{
                  width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
                  background: i === slide ? "var(--primary)" : "rgba(255,255,255,0.3)",
                  border: "none", cursor: "pointer", transition: "all 0.3s ease"
                }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: "var(--dark-2)", borderTop: "1px solid rgba(212,175,55,0.06)", borderBottom: "1px solid rgba(212,175,55,0.06)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "32px 24px", textAlign: "center" }}>
          {[["10+", "States"], ["50+", "Cities"], ["100+", "Places"], ["24/7", "Support"]].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontSize: "clamp(1.5rem, 4vw, 1.8rem)", fontWeight: 800, color: "var(--primary)", marginBottom: 4 }}>{num}</div>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, letterSpacing: 1 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEARBY SECTION */}
      {(nearby.length > 0 || nearbyLoading) && (
        <section id="nearby" style={{
          padding: "80px 24px",
          background: "linear-gradient(to bottom, var(--dark), var(--dark-2))",
          position: "relative"
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ marginBottom: 40 }}>
              <span className="badge badge-classy" style={{ marginBottom: 12 }}>📍 Based on Your Location</span>
              <h2 className="section-title" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)" }}>Places Near You</h2>
              <p className="section-subtitle">Discover amazing destinations within reach</p>
            </div>
            {nearbyLoading ? (
              <div style={{ display: "flex", gap: 20 }}>
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, flex: 1, borderRadius: 16 }} />)}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                {nearby.slice(0, 8).map((place, idx) => (
                  place.slug ? (
                    <Link key={place.slug} href={`/place/${place.slug}`} style={{ textDecoration: "none" }}>
                      <div className="glass-card hover-card" style={{ overflow: "hidden" }}>
                        <div style={{ height: 160, backgroundImage: `url('${place.hero_image}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                        <div style={{ padding: 16 }}>
                          <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600, marginBottom: 4, letterSpacing: 1 }}>
                            📍 {place.distance_km.toFixed(0)} km away
                          </div>
                          <h3 style={{ fontWeight: 700, fontSize: 15, color: "white" }}>{place.name}</h3>
                          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{place.best_time}</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <a key={`geo-${idx}`} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <div className="glass-card hover-card" style={{ overflow: "hidden" }}>
                        <div style={{ height: 160, backgroundImage: `url('${place.hero_image}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                        <div style={{ padding: 16 }}>
                          <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600, marginBottom: 4, letterSpacing: 1 }}>
                            📍 {place.distance_km.toFixed(2)} km away
                          </div>
                          <h3 style={{ fontWeight: 700, fontSize: 15, color: "white" }}>{place.name}</h3>
                          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{place.best_time}</p>
                        </div>
                      </div>
                    </a>
                  )
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* STATES GRID */}
      <section id="states" style={{
        padding: "80px 24px 120px",
        background: "linear-gradient(135deg, var(--dark) 0%, var(--dark-2) 50%, var(--dark-3) 100%)",
        position: "relative",
        color: "white"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>🇮🇳 Explore India</span>
            <h2 className="section-title">Choose Your Destination</h2>
            <p className="section-subtitle">Click a state to discover its wonders</p>
          </div>

          {loading ? (
            <div className="grid-states">
              {[...Array(10)].map((_, i) => <div key={i} className="skeleton" style={{ height: 280 }} />)}
            </div>
          ) : (
            <div className="grid-states">
              {states.map((state, idx) => (
                <Link key={state.slug} href={`/state/${state.slug}`} style={{ textDecoration: "none" }}>
                  <div className="glass-card hover-card" style={{ overflow: "hidden", animationDelay: `${idx * 0.05}s`, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <div style={{
                      height: 200,
                      backgroundImage: `url('${state.hero_image}')`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      position: "relative"
                    }}>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px" }}>
                        <span className="badge badge-primary" style={{ fontSize: 10, marginBottom: 6 }}>{state.region}</span>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: "white" }}>{state.name}</h3>
                      </div>
                    </div>
                    <div style={{ padding: 16 }}>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {state.description}
                      </p>
                      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>
                        Explore →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section id="about" style={{ 
        padding: "100px 24px", 
        background: "radial-gradient(circle at top, var(--dark-2) 0%, var(--dark) 100%)", 
        borderTop: "1px solid rgba(212,175,55,0.12)", 
        position: "relative" 
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 className="section-title">Everything You Need to Travel</h2>
            <p className="section-subtitle">One platform. Complete travel solution.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { icon: "🗺️", title: "Discover Places", desc: "Explore 100+ handpicked tourist destinations across 10 Indian states with rich photos and detailed guides." },
              { icon: "🚕", title: "Book Transport", desc: "Instantly book cabs, bikes, scooters, and buses. Get price estimates and confirm your ride in seconds." },
              { icon: "🏨", title: "Find Stays", desc: "From luxury resorts to budget hostels — find and book the perfect accommodation for your trip." },
              { icon: "📍", title: "Nearby Finder", desc: "Auto-detect your location and discover amazing places, attractions, and experiences near you." },
            ].map(f => (
              <div key={f.title} className="glass-card" style={{ padding: "32px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "white" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "40px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #ef4444, #f87171)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: 15 }}>HJ</div>
            <span style={{ fontWeight: 700, color: "white" }}>Happy Journey</span>
          </div>
          <p style={{ color: "#475569", fontSize: 13 }}>© 2026 Happy Journey · Discover India, one state at a time 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}
