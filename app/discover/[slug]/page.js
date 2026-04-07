"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ARMonumentView from "@/components/ARMonumentView";
import Navbar from "@/components/Navbar";
import { getDistanceInMeters } from "@/lib/geo-utils";

export default function DiscoverPage() {
  const { slug } = useParams();
  const [monument, setMonument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [isNear, setIsNear] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Fetch monument data
    const fetchMonument = async () => {
      try {
        const res = await fetch(`/api/places?slug=${slug}`);
        const data = await res.json();
        if (data.success) {
          setMonument(data.data);
        } else {
          setError("Monument not found.");
        }
      } catch (err) {
        setError("Error loading discovery data.");
      }
    };

    fetchMonument();

    // 2. Track user location for geofencing
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Please enable location access to unlock historical AR.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Your browser doesn't support geolocation.");
    }
  }, [slug]);

  useEffect(() => {
    if (userLocation && monument && monument.lat && monument.lng) {
      const distance = getDistanceInMeters(
        userLocation.lat, userLocation.lng,
        monument.lat, monument.lng
      );
      // Only unlock AR if within 100 meters
      setIsNear(distance <= 100);
    }
  }, [userLocation, monument]);

  if (loading && !monument && !error) return (
    <div style={{ height: "100vh", background: "var(--dark)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", marginBottom: 20 }}></div>
      Unlocking Discovery...
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />
      <div style={{ padding: "120px 24px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 20, color: "#ef4444" }}>Discovery Locked</h2>
        <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>{error}</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ marginTop: 30, display: "inline-flex" }}>Back Home</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      {!isNear ? (
        <>
          <Navbar />
          <div style={{ padding: "120px 24px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
             <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(212, 175, 55, 0.1)", margin: "0 auto 30px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>📍</div>
             <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 12 }}>You are nearby {monument?.name}!</h2>
             <p style={{ color: "#94a3b8", lineHeight: 1.6, marginBottom: 40 }}>
                Get within 100 meters to unlock the historical AR view. You'll need to look at the monument through your camera.
             </p>
             <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.1)" }}>
               <span style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>DISTANCE CHECKING...</span>
               <div style={{ fontSize: 24, fontWeight: 800, marginTop: 10 }}>Calculating Distance</div>
             </div>
             <button onClick={() => setIsNear(true)} className="btn-primary" style={{ marginTop: 40, width: "100%", justifyContent: "center" }}>
                Force Unlock AR (Development Mode)
             </button>
          </div>
        </>
      ) : (
        <ARMonumentView monument={monument} />
      )}
    </div>
  );
}
