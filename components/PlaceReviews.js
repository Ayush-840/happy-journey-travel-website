"use client";
import { useState, useEffect } from "react";
import VerifiedBadge from "./VerifiedBadge";

export default function PlaceReviews({ placeId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?place_id=${placeId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [placeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Get current location for verification
    let location = { lat: null, lng: null };
    if ("geolocation" in navigator) {
      const pos = await new Promise((res) => navigator.geolocation.getCurrentPosition(res, () => res(null)));
      if (pos) {
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1, // Default user
          place_id: placeId,
          rating,
          comment,
          image_url: imgUrl,
          ...location
        })
      });
      const data = await res.json();
      if (data.success) {
        setComment("");
        setImgUrl("");
        fetchReviews();
        alert(data.is_verified ? "🎉 Verified Review Posted! You've earned HJ Coins." : "Review Posted!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" style={{ padding: "60px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800 }}>Traveler Reviews</h2>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Verified stories from real global explorers.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(212, 175, 55, 0.1)", padding: "10px 20px", borderRadius: 30, border: "1px solid rgba(212, 175, 55, 0.2)" }}>
           <span style={{ fontSize: 18 }}>🪙</span>
           <span style={{ fontWeight: 800, fontSize: 14, color: "var(--primary)" }}>EARN HJ COINS FOR VERIFIED REVIEWS</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
        {/* Review Form */}
        <div className="glass-card" style={{ padding: 30, borderTop: "2px solid var(--primary)", height: "fit-content" }}>
          <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Write a Review</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>RATING</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)} className="input-field">
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 15 }}>
               <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>COMMENT</label>
               <textarea 
                value={comment} onChange={(e) => setComment(e.target.value)} 
                placeholder="Share your experience..." className="input-field" rows="4" required 
                style={{ resize: "none" }}
               ></textarea>
            </div>
            <div style={{ marginBottom: 20 }}>
               <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>IMAGE URL (OPTIONAL)</label>
               <input 
                type="url" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} 
                placeholder="https://..." className="input-field" 
               />
               <span style={{ fontSize: 10, color: "var(--primary)", marginTop: 6, display: "block" }}>+15 COIN BONUS FOR PHOTOS</span>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
               {isSubmitting ? "Posting..." : "Post Review"}
            </button>
          </form>
        </div>

        {/* Review List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {loading ? (
             <div className="skeleton" style={{ height: 150, borderRadius: 16 }}></div>
          ) : reviews.length === 0 ? (
             <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No reviews yet. Be the first to verify!</div>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="glass-card" style={{ padding: 24, borderLeft: r.is_verified ? "4px solid var(--primary)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary)" }}>
                       <img src={r.avatar_url || "https://i.pravatar.cc/150"} style={{ width: "100%", borderRadius: "50%" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.username}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {r.is_verified ? <VerifiedBadge type={r.verification_type} /> : null}
                </div>
                
                <div style={{ color: "var(--primary)", marginBottom: 10, fontSize: 14 }}>
                   {"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}
                </div>

                <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, marginBottom: r.image_url ? 15 : 0 }}>
                  {r.comment}
                </p>

                {r.image_url && (
                  <div style={{ height: 150, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <img src={r.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
