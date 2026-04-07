"use client";
import { useState } from 'react';

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes_count || 0);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <div className="glass-card" style={{ 
      marginBottom: 30, 
      overflow: "hidden", 
      padding: 0,
      animation: "fadeUp 0.6s ease"
    }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: "50%", 
            background: "var(--primary)", overflow: "hidden",
            boxShadow: "0 0 10px rgba(212, 175, 55, 0.2)"
          }}>
            <img 
              src={post.avatar_url || "https://i.pravatar.cc/150"} 
              alt={post.username} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>{post.username}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(post.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <div className="badge badge-primary" style={{ fontSize: 11, padding: "6px 12px" }}>
          📍 {post.location_name}
        </div>
      </div>

      {/* Image Area */}
      <div style={{ 
        position: "relative", 
        width: "100%", 
        aspectRatio: "16/9", 
        overflow: "hidden",
        backgroundColor: "rgba(0,0,0,0.3)"
      }}>
        <img 
          src={post.image_url} 
          alt={post.location_name}
          className="hover-zoom"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ 
          position: "absolute", bottom: 0, left: 0, right: 0, 
          height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          pointerEvents: "none"
        }} />
      </div>

      {/* Interactions & Review */}
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
          <button 
            onClick={toggleLike}
            style={{ 
              background: "transparent", border: "none", cursor: "pointer", 
              color: liked ? "#ef4444" : "white", display: "flex", alignItems: "center", gap: 6,
              fontSize: 18, transition: "transform 0.2s"
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(1.3)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {liked ? "❤️" : "🤍"} <span style={{ fontSize: 14, fontWeight: 600 }}>{likes}</span>
          </button>
          <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", gap: 6, fontSize: 18 }}>
            💬 <span style={{ fontSize: 14, fontWeight: 600 }}>0</span>
          </button>
          <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "white", fontSize: 18 }}>
            🔖
          </button>
        </div>

        <p style={{ 
          fontSize: 14, lineHeight: 1.6, color: "#cbd5e1",
          borderLeft: "2px solid var(--primary)", paddingLeft: 12
        }}>
          {post.review}
        </p>
      </div>
    </div>
  );
}
