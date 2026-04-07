"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";

export default function PlacePage() {
  const { slug } = useParams();
  const [place, setPlace] = useState(null);
  const [transport, setTransport] = useState([]);
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("transport");
  const [bookingTarget, setBookingTarget] = useState(null); // { type: 'transport'|'stay', data }

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/places/${slug}`).then(r => r.json()).then(d => {
      setPlace(d.data);
      setLoading(false);
      if (d.data?.city_slug) {
        fetch(`/api/transport?city=${d.data.city_slug}`).then(r => r.json()).then(t => setTransport(t.data || []));
        fetch(`/api/stays?city=${d.data.city_slug}`).then(r => r.json()).then(s => setStays(s.data || []));
      }
    });
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: "float 1.5s ease-in-out infinite" }}>📍</div>
        <div style={{ color: "#94a3b8" }}>Loading place details...</div>
      </div>
    </div>
  );

  if (!place) return <div style={{ minHeight: "100vh", background: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>Place not found.</div>;

  const allImages = [place.hero_image, ...(place.gallery || [])].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)" }}>
      <Navbar />

      {/* GALLERY HERO */}
      <div style={{ position: "relative", height: "75vh", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url('${allImages[galleryIndex]}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.45)",
          transition: "all 0.6s ease"
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--dark) 0%, rgba(212,175,55,0.1) 60%, transparent 100%)" }} />

        {/* Nav arrows */}
        {allImages.length > 1 && (
          <>
            <button onClick={() => setGalleryIndex(i => (i - 1 + allImages.length) % allImages.length)}
              style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", color: "white", width: 44, height: 44, borderRadius: "50%", fontSize: 18, cursor: "pointer", zIndex: 10 }}>‹</button>
            <button onClick={() => setGalleryIndex(i => (i + 1) % allImages.length)}
              style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", color: "white", width: 44, height: 44, borderRadius: "50%", fontSize: 18, cursor: "pointer", zIndex: 10 }}>›</button>
          </>
        )}

        <div style={{ position: "relative", zIndex: 5, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 24px 40px", maxWidth: 1280, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>Home</Link>
            <span style={{ color: "#475569" }}>›</span>
            <Link href={`/state/${place.state_slug}`} style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13 }}>{place.state_name}</Link>
            <span style={{ color: "#475569" }}>›</span>
            <Link href={`/city/${place.city_slug}`} style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13 }}>{place.city_name}</Link>
            <span style={{ color: "#475569" }}>›</span>
            <span style={{ color: "var(--primary)", fontSize: 13 }}>{place.name}</span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {place.tags?.map(t => <span key={t} className="badge badge-primary" style={{ fontSize: 11 }}>{t}</span>)}
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 800, color: "white", marginBottom: 12, lineHeight: 1.1 }}>{place.name}</h1>
          <p style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)", color: "#cbd5e1", maxWidth: 620, lineHeight: 1.7 }}>{place.description}</p>

          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span className="badge badge-classy">🗓️ Best: {place.best_time}</span>
            <span className="badge badge-primary">📍 {place.city_name}, {place.state_name}</span>
            <span className="badge badge-primary" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>⭐ {place.rating} / 5.0</span>
            <span className="badge badge-primary" style={{ background: "rgba(212, 175, 55, 0.15)", color: "#fff8e1", border: "1px solid rgba(212, 175, 55, 0.25)" }}>💰 Budget: {place.budget_per_day}</span>
          </div>

          {/* Image dots */}
          {allImages.length > 1 && (
            <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
              {allImages.map((_, i) => (
                <button key={i} onClick={() => setGalleryIndex(i)} style={{
                  width: i === galleryIndex ? 22 : 7, height: 7, borderRadius: 4,
                  background: i === galleryIndex ? "var(--primary)" : "rgba(255,255,255,0.35)",
                  border: "none", cursor: "pointer", transition: "all 0.3s"
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container" style={{ padding: "60px 0 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }} className="place-grid">

          {/* LEFT */}
          <div>
            {/* About */}
            <div className="glass-card" style={{ padding: 32, marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: "white" }}>✨ About This Place</h2>
              <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: 14 }}>{place.description}</p>
            </div>

            {/* Highlights */}
            {place.highlights?.length > 0 && (
              <div className="glass-card" style={{ padding: 32, marginBottom: 28 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "white" }}>🌟 Highlights</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {place.highlights.map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 16px", background: "rgba(249,115,22,0.08)", borderRadius: 10, border: "1px solid rgba(249,115,22,0.15)" }}>
                      <span style={{ color: "var(--primary)", fontSize: 16, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "white" }}>🗺️ Location</h2>
              <div className="map-container">
                <iframe
                  src={`https://maps.google.com/maps?q=${place.lat},${place.lng}&z=14&output=embed`}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  style={{ width: "100%", height: 360, border: "none", borderRadius: 12 }}
                />
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>📍 Coordinates: {place.lat}, {place.lng}</p>
            </div>

            {/* Nearby Attractions */}
            {place.nearby_attractions?.length > 0 && (
              <div className="glass-card" style={{ padding: 32, marginBottom: 28 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "white" }}>📌 Nearby Attractions</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {place.nearby_attractions.map(n => (
                    <div key={n.id} style={{ padding: "16px 20px", background: "rgba(212, 175, 55, 0.04)", borderRadius: 12, border: "1px solid rgba(212, 175, 55, 0.1)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(212, 175, 55, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {n.type === "Beach" ? "🏖️" : n.type === "Fort" ? "🏰" : n.type === "Temple" ? "🛕" : n.type === "Activity" ? "🏄" : "📍"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "white", fontSize: 14 }}>{n.name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{n.type} · {n.distance_km} km away</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{n.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Reviews Section */}
            <PlaceReviews placeId={slug} />
          </div>

          {/* RIGHT — Booking Panel */}
          <div style={{ position: "sticky", top: 100 }}>
            {/* Tabs */}
            <div className="glass-card" style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {[["transport", "🚕 Transport"], ["stay", "🏨 Stays"], ["package", "📦 Package"]].map(([key, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)} style={{
                    flex: 1, padding: "14px 8px", background: activeTab === key ? "rgba(212, 175, 55, 0.15)" : "none",
                    border: "none", color: activeTab === key ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: activeTab === key ? 700 : 400, fontSize: 12, cursor: "pointer",
                    borderBottom: activeTab === key ? "2px solid var(--primary)" : "2px solid transparent",
                    transition: "all 0.2s"
                  }}>{label}</button>
                ))}
              </div>

              <div style={{ padding: 20 }}>
                {/* Transport Tab */}
                {activeTab === "transport" && (
                  <div>
                    <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Available in {place.city_name}:</p>
                    {transport.length === 0 ? <p style={{ color: "#475569", fontSize: 13 }}>No transport data available.</p> : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {transport.map(t => (
                          <div key={t.id} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 22 }}>{t.icon}</span>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 14, color: "white" }}>{t.type}</div>
                                  <div style={{ fontSize: 11, color: "#64748b" }}>{t.provider}</div>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>₹{t.price_min}–{t.price_max}</div>
                                <div style={{ fontSize: 10, color: "#475569" }}>per trip</div>
                              </div>
                            </div>
                            <button onClick={() => setBookingTarget({ type: "transport", data: t })} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 13 }}>
                              Book Now
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Stay Tab */}
                {activeTab === "stay" && (
                  <div>
                    <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Available in {place.city_name}:</p>
                    {stays.length === 0 ? <p style={{ color: "#475569", fontSize: 13 }}>No stays available.</p> : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {stays.map(s => (
                          <div key={s.id} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <div style={{ height: 120, backgroundImage: `url('${s.photo}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                            <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.03)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: "white" }}>{s.name}</div>
                                <div style={{ fontSize: 12, color: "var(--accent)" }}>{"⭐".repeat(s.stars)}</div>
                              </div>
                               <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>₹{s.price_per_night?.toLocaleString()}<span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: 11 }}>/night</span></div>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                                {s.amenities?.slice(0, 3).map(a => (
                                  <span key={a} style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255,255,255,0.06)", borderRadius: 999, color: "#94a3b8" }}>{a}</span>
                                ))}
                              </div>
                              <button onClick={() => setBookingTarget({ type: "stay", data: s })} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 13 }}>
                                Book Stay
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Package Tab */}
                {activeTab === "package" && (
                  <div>
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: "white", marginBottom: 8 }}>Travel + Stay Package</h3>
                      <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, lineHeight: 1.6 }}>
                        Book transport and accommodation together and save up to 20% on your combined booking.
                      </p>
                      {stays.length > 0 && transport.length > 0 ? (
                        <div style={{ padding: "16px", background: "rgba(249,115,22,0.08)", borderRadius: 12, border: "1px solid rgba(249,115,22,0.2)", marginBottom: 16 }}>
                          <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 4 }}>From ₹{(transport[0]?.price_min + (stays[0]?.price_per_night || 0)).toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{transport[0]?.type} + {stays[0]?.name} (1 night)</div>
                        </div>
                      ) : null}
                      <button onClick={() => setActiveTab("transport")} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                        Start Booking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingTarget && (
        <BookingModal
          type={bookingTarget.type}
          data={bookingTarget.data}
          citySlug={place.city_slug}
          onClose={() => setBookingTarget(null)}
        />
      )}

      <footer style={{ padding: "30px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#475569", fontSize: 13 }}>
        © 2026 Happy Journey · <Link href="/" style={{ color: "var(--primary)", textDecoration: "none" }}>Back to Home</Link>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .place-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .place-grid > div:nth-child(2) { position: static !important; }
        }
      `}</style>
    </div>
  );
}
