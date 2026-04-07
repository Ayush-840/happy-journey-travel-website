"use client";
import { useEffect, useState } from "react";
import Script from "next/script";

export default function ARView({ monument, historicalOpacity = 0.5 }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Only running on client
    if (typeof window !== "undefined") {
      setLoaded(true);
    }
  }, []);

  if (!loaded) return <div style={{ color: "white", padding: 20 }}>Initializing AR Scene...</div>;

  return (
    <div style={{ width: "100%", height: "100%", position: "fixed", top: 0, left: 0, zIndex: 1000, background: "black" }}>
      {/* Load Scripts with Next.js Script component */}
      <Script 
        src="https://aframe.io/releases/1.3.0/aframe.min.js" 
        strategy="beforeInteractive"
      />
      <Script 
        src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-nft.js" 
        strategy="afterInteractive"
      />

      {/* A-Frame Scene */}
      <a-scene 
        vr-mode-ui="enabled: false"
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false;"
        style={{ width: "100%", height: "100%" }}
      >
        {/* The Historical Overlay (Entity) */}
        <a-entity
          gps-entity-place={`latitude: ${monument.lat}; longitude: ${monument.lng};`}
          gltf-model="url(https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb)" // Temporary model
          scale="10 10 10"
          material={`opacity: ${historicalOpacity}; transparent: true;`}
          animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
        ></a-entity>

        {/* Floating Text Marker */}
        <a-text
          value={`Historical ${monument.name}`}
          scale="15 15 15"
          look-at="[gps-camera]"
          gps-entity-place={`latitude: ${monument.lat + 0.0001}; longitude: ${monument.lng + 0.0001};`}
          align="center"
          color="#d4af37"
        ></a-text>

        <a-camera gps-camera rotation-reader></a-camera>
      </a-scene>

      {/* Overlay UI */}
      <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 1001, width: "80%", maxWidth: 400 }}>
         <div className="glass-card" style={{ padding: "16px 24px", textAlign: "center", background: "rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
               <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800 }}>PRESENT</span>
               <span style={{ fontSize: 10, color: "var(--primary)", fontWeight: 800 }}>HISTORICAL</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
               <div style={{ height: "100%", width: `${historicalOpacity * 100}%`, background: "var(--primary)", transition: "width 0.2s" }} />
            </div>
            <p style={{ marginTop: 12, fontSize: 11, color: "white" }}>Adjusting Timeline: {Math.round(historicalOpacity * 100)}% Past</p>
         </div>
      </div>
    </div>
  );
}
