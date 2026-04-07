"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ARView from "@/components/ARView";
import { isWithinRadius } from "@/lib/geo-utils";

export default function ARDiscoverPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [monument, setMonument] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [opacity, setOpacity] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Fetch Monument
    fetch(`/api/places/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setMonument(d.data);
        else setError("Monument not found.");
      })
      .catch(() => setError("Error loading data."));

    // 2. Request Precision GPS
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoading(false);
        },
        (err) => {
          setError("GPS Permission Denied. Please enable location to use AR.");
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation not supported by your browser.");
      setLoading(false);
    }
  }, [slug]);

  if (loading) return (
    <div style={{ height: "100vh", background: "black", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
       Initializing GPS & Camera...
    </div>
  );

  if (error) return (
    <div style={{ height: "100vh", background: "black", display: "flex", alignItems: "center", justifyContent: "center", color: "white", padding: 40, textAlign: "center" }}>
       <div>
         <div style={{ fontSize: 48, marginBottom: 20 }}>🚧</div>
         <h2>{error}</h2>
         <button onClick={() => router.back()} style={{ marginTop: 20, padding: "10px 20px" }}>Go Back</button>
       </div>
    </div>
  );

  // 3. Geofencing Final Check
  const nearby = isWithinRadius(userLocation?.lat, userLocation?.lng, monument, 0.5); // 500m

  if (!nearby && process.env.NODE_ENV === "production") {
    return (
      <div style={{ height: "100vh", background: "black", display: "flex", alignItems: "center", justifyContent: "center", color: "white", padding: 40, textAlign: "center" }}>
         <div>
           <div style={{ fontSize: 48, marginBottom: 20 }}>📍</div>
           <h2>Out of Range</h2>
           <p style={{ color: "#94a3b8", marginTop: 8 }}>You must be within 500m of {monument.name} to view the Time Machine.</p>
           <button onClick={() => router.back()} style={{ marginTop: 20, padding: "10px 20px" }}>Go Back</button>
         </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", background: "black", overflow: "hidden" }}>
      {/* FULL SCREEN AR VIEW */}
      <ARView monument={monument} historicalOpacity={opacity} />

      {/* REACT OVERLAY CONTROLS */}
      <div style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", zIndex: 2000, width: "80%", maxWidth: 300 }}>
        <input 
          type="range" min="0" max="1" step="0.01" value={opacity} 
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          style={{ width: "100%", cursor: "pointer", appearance: "none", height: 10, background: "rgba(255,255,255,0.2)", borderRadius: 5 }}
        />
        <div style={{ textAlign: "center", color: "white", fontSize: 10, fontWeight: 800, marginTop: 8, letterSpacing: 1 }}>
           PAST 👁️ TIMELINE
        </div>
      </div>

      <button onClick={() => router.back()} style={{ position: "fixed", top: 30, left: 24, zIndex: 2001, background: "rgba(0,0,0,0.5)", border: "none", color: "white", padding: "10px 16px", borderRadius: 10, fontSize: 14 }}>
         ✕ CLOSE
      </button>

      {/* HUD Info */}
      <div style={{ position: "fixed", top: 30, right: 24, zIndex: 2001, textAlign: "right" }}>
         <div style={{ color: "white", fontWeight: 800, fontSize: 12 }}>{monument.name}</div>
         <div style={{ color: "var(--primary)", fontSize: 10 }}>HISTORICAL OVERLAY ACTIVE</div>
      </div>
    </div>
  );
}
