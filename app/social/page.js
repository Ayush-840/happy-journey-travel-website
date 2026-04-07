"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";

export default function SocialFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  // Form states
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [review, setReview] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/feed");
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to load your feed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1, // Default to Ayush for demo
          location_name: location,
          image_url: imageUrl,
          review
        })
      });
      const data = await res.json();
      if (data.success) {
        // Reset form and reload
        setLocation("");
        setImageUrl("");
        setReview("");
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />

      <main style={{ padding: "100px 24px 60px", maxWidth: 700, margin: "0 auto" }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>🌏 Community Journey</span>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800 }}>Travel Wall</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Share your travel stories and discover new horizons.</p>
        </div>

        {/* Post Creator Widget */}
        <div className="glass-card" style={{ marginBottom: 50, padding: 24, borderTop: "2px solid var(--primary)" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
             <div style={{ width: 45, height: 45, borderRadius: "50%", background: "var(--primary)" }}>
               <img src="https://i.pravatar.cc/150?u=ayush" style={{ width: "100%", borderRadius: "50%" }} />
             </div>
             <div style={{ flex: 1 }}>
               <form onSubmit={handlePost}>
                 <input 
                  type="text" 
                  placeholder="Where did you go? (e.g. Goa, India)" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ background: "transparent", border: "none", color: "white", fontSize: 18, width: "100%", outline: "none", marginBottom: 15, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10 }}
                  required
                 />
                 <input 
                  type="url" 
                  placeholder="Image URL (Unsplash or Cloudinary)" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ background: "transparent", border: "none", color: "white", fontSize: 14, width: "100%", outline: "none", marginBottom: 15, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10 }}
                  required
                 />
                 <textarea 
                  placeholder="Write a short review of your experience..." 
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows="3"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: 12, width: "100%", outline: "none", padding: 15, resize: "none", marginBottom: 15, fontSize: 14 }}
                  required
                 ></textarea>
                 <div style={{ display: "flex", justifyContent: "flex-end" }}>
                   <button 
                    disabled={isPosting} 
                    type="submit" 
                    className="btn-primary" 
                    style={{ padding: "10px 24px" }}
                   >
                    {isPosting ? "Posting..." : "Share Adventure"}
                   </button>
                 </div>
               </form>
             </div>
          </div>
        </div>

        {/* Feed List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", margin: "0 auto 20px" }}></div>
            Loading Feed...
          </div>
        ) : error ? (
          <div style={{ padding: 20, background: "rgba(239, 68, 68, 0.1)", borderRadius: 12, color: "#ef4444" }}>{error}</div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
