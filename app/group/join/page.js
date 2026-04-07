"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function GroupLobby() {
  const [tripName, setTripName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_TRIP", trip_name: tripName, user_id: 1 })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/group/planner?trip_id=${data.trip_id}`);
      }
    } catch (err) {
      alert("Error creating trip.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "JOIN_TRIP", invite_code: inviteCode, user_id: 1 })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/group/planner?trip_id=${data.trip_id}`);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error joining trip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />

      <main style={{ padding: "120px 24px 60px", maxWidth: 900, margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>🤝 Collaborative Planning</span>
          <h1 style={{ fontSize: "3rem", fontWeight: 800 }}>Group Trip Hub</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Planning with friends is better. Join a room or start your own.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          
          {/* Create Trip */}
          <div className="glass-card" style={{ padding: 40, borderTop: "2px solid var(--primary)" }}>
             <div style={{ fontSize: 40, marginBottom: 20 }}>🚢</div>
             <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 12 }}>Start a New Trip</h2>
             <p style={{ color: "#94a3b8", marginBottom: 30, fontSize: 13 }}>Create a shared environment where your crew can suggest and vote on places.</p>
             
             <form onSubmit={handleCreate}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Trip Name</label>
                <input 
                  type="text" placeholder="e.g. Summer in Ladakh" 
                  value={tripName} onChange={(e) => setTripName(e.target.value)}
                  className="input-field" style={{ marginBottom: 20 }} required
                />
                <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                   {loading ? "Creating..." : "Create Trip Room"}
                </button>
             </form>
          </div>

          {/* Join Trip */}
          <div className="glass-card" style={{ padding: 40, background: "rgba(255,255,255,0.03)" }}>
             <div style={{ fontSize: 40, marginBottom: 20 }}>🔑</div>
             <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 12 }}>Join Existing Trip</h2>
             <p style={{ color: "#94a3b8", marginBottom: 30, fontSize: 13 }}>Received an invite code? Enter it below to join your friends in the planning lobby.</p>
             
             <form onSubmit={handleJoin}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Invite Code</label>
                <input 
                  type="text" placeholder="e.g. A2F9X1" 
                  value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
                  className="input-field" style={{ marginBottom: 20, textAlign: "center", letterSpacing: 4, fontWeight: 800 }} required
                />
                <button type="submit" disabled={loading} className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                   {loading ? "Joining..." : "Join Group"}
                </button>
             </form>
          </div>

        </div>

      </main>
    </div>
  );
}
