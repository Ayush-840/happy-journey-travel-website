"use client";
import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function ARMonumentView({ monument }) {
  const [arReady, setArReady] = useState(false);

  useEffect(() => {
    // We need to ensure A-Frame is loaded before we attempt to render its components
    const interval = setInterval(() => {
      if (window.AFRAME) {
        setArReady(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1000, background: "black" }}>
      <Script 
        src="https://aframe.io/releases/1.2.0/aframe.min.js" 
        strategy="beforeInteractive"
      />
      <Script 
        src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js" 
        strategy="lazyOnload"
      />

      {arReady ? (
        <a-scene 
          embedded 
          arjs="sourceType: webcam; debugUIEnabled: false;" 
          vr-mode-ui="enabled: false"
          renderer="logarithmicDepthBuffer: true;"
        >
          {/* Historical Fact Billboard */}
          <a-entity position="0 1.5 -3" scale="1.5 1.5 1">
             {/* Background Plane */}
             <a-plane 
              color="black" 
              opacity="0.8" 
              width="3" 
              height="1.5"
              material="transparent: true; metalness: 0.5; roughness: 0.2"
             ></a-plane>
             
             {/* Header */}
             <a-text 
              value={monument.name} 
              align="center" 
              position="0 0.5 0.1" 
              width="4" 
              color="#D4AF37"
              font="https://cdn.aframe.io/fonts/Exo2Bold.fnt"
             ></a-text>
             
             {/* Description */}
             <a-text 
              value={monument.description || "Discover the hidden secrets of this monument."} 
              align="center" 
              position="0 -0.1 0.1" 
              width="2.5" 
              color="white"
              wrap-count="30"
             ></a-text>

             {/* Footer Badge */}
             <a-entity position="0 -0.55 0.2">
               <a-plane color="#D4AF37" width="1.2" height="0.3"></a-plane>
               <a-text value="HISTORICAL FACT" align="center" width="2" color="black" position="0 0 0.05"></a-text>
             </a-entity>
          </a-entity>

          <a-marker-camera preset="hiro"></a-marker-camera>
          
          <a-entity camera></a-entity>
        </a-scene>
      ) : (
        <div style={{ 
          height: "100%", display: "flex", alignItems: "center", justifyContent: "center", 
          flexDirection: "column", color: "white", textAlign: "center", padding: 40 
        }}>
          <div className="skeleton" style={{ width: 50, height: 50, borderRadius: "50%", marginBottom: 20 }}></div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Initializing AR Core...</h2>
          <p style={{ color: "#94a3b8", marginTop: 10 }}>Please allow camera access to see the hidden history.</p>
        </div>
      )}

      {/* Exit Button */}
      <button 
        onClick={() => window.location.href = '/'}
        style={{ 
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "12px 32px",
          borderRadius: "30px", fontWeight: 700, cursor: "pointer", zIndex: 2000
        }}
      >
        Close AR View
      </button>
    </div>
  );
}
