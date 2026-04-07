"use client";
import { useState, useRef } from "react";

export default function VisualSearchZone({ onMatch, onLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file) => {
    setPreview(URL.createObjectURL(file));
    startScan(file);
  };

  const startScan = async (file) => {
    setScanning(true);
    onLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/visual-search", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        onMatch(data.data);
      } else {
        alert("Location unidentified. Try a different angle or landmark.");
        setPreview(null);
      }
    } catch (err) {
      alert("Error identifying location.");
      setPreview(null);
    } finally {
      setScanning(false);
      onLoading(false);
    }
  };

  return (
    <div 
      onDragEnter={handleDrag} 
      className={`glass-card ${dragActive ? 'drag-active' : ''}`}
      style={{
        width: "100%", height: 350, border: "2px dashed rgba(255,255,255,0.1)",
        borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s", position: "relative", overflow: "hidden",
        backgroundColor: dragActive ? "rgba(212, 175, 55, 0.05)" : "rgba(255,255,255,0.02)"
      }}
    >
      <input type="file" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0])} style={{ display: "none" }} />

      {!preview ? (
        <div onClick={() => fileInputRef.current.click()} style={{ textAlign: "center", padding: 40, cursor: "pointer" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🖼️</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8, color: "white" }}>Drop Travel Reel Screenshot</h3>
          <p style={{ color: "#64748b", fontSize: 13 }}>We will identify the location and create a plan.</p>
        </div>
      ) : (
        <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={preview} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, opacity: scanning ? 0.7 : 1, transition: "opacity 0.3s" }} />
          
          {scanning && (
            <div className="laser-line" style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: "linear-gradient(90deg, transparent, var(--primary), transparent)",
              boxShadow: "0 0 20px var(--primary)", zIndex: 10,
              animation: "scanLine 2s infinite linear"
            }} />
          )}

          <style jsx>{`
            @keyframes scanLine {
              0% { top: 0; }
              100% { top: 100%; }
            }
          `}</style>
        </div>
      )}
      
      {dragActive && <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(212, 175, 55, 0.1)", zIndex: 5, pointerEvents: "none", borderRadius: 24 }} />}
    </div>
  );
}
