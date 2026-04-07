"use client";
import { useState, useEffect } from "react";

export default function GroupLeaderboard({ tripId, userId }) {
  const [trip, setTrip] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlace, setNewPlace] = useState("");
  const [activeTab, setActiveTab] = useState("leaderboard");

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/group?trip_id=${tripId}`);
      const data = await res.json();
      if (data.success) {
        setTrip(data.data.trip);
        setSuggestions(data.data.suggestions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Simulate real-time by polling every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [tripId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newPlace) return;
    try {
      const res = await fetch("/api/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_SUGGESTION", trip_id: tripId, place_name: newPlace, user_id: userId })
      });
      if ((await res.json()).success) {
        setNewPlace("");
        fetchData();
      }
    } catch (err) {
      alert("Error adding suggestion.");
    }
  };

  const handleVote = async (suggestionId) => {
    if (trip.status === 'Locked') return;
    try {
      const res = await fetch("/api/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_VOTE", suggestion_id: suggestionId, user_id: userId })
      });
      if ((await res.json()).success) {
        fetchData();
      }
    } catch (err) {
      alert("Error voting.");
    }
  };

  const handleLock = async () => {
    if (!confirm("Are you sure? Once locked, voting stops for everyone.")) return;
    try {
       const res = await fetch("/api/group", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action: "LOCK_TRIP", trip_id: tripId })
       });
       if ((await res.json()).success) fetchData();
    } catch (err) {
       alert("Error locking.");
    }
  };

  if (loading) return <div>Loading Trip Planner...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header Info */}
      <div className="glass-card" style={{ padding: 40, marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 8 }}>{trip.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, background: "rgba(255,255,255,0.05)", padding: "12px 20px", borderRadius: 30, border: "1px solid rgba(255,255,255,0.1)" }}>
               Invite Code: <strong style={{ color: "var(--primary)", letterSpacing: 1 }}>{trip.invite_code}</strong>
            </span>
            <span className={`badge ${trip.status === 'Locked' ? 'badge-secondary' : 'badge-primary'}`} style={{ textTransform: "uppercase" }}>
               {trip.status === 'Locked' ? '🔒 LOCKED' : '📝 PLANNING'}
            </span>
          </div>
        </div>
        
        {userId === trip.created_by && trip.status === 'Planning' && (
          <button onClick={handleLock} className="btn-primary" style={{ padding: "12px 40px", fontWeight: 700 }}>
             Finalize Trip
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 32 }}>
        
        {/* Suggest a Place Form */}
        <aside>
          <div className="glass-card" style={{ padding: 30, position: "sticky", top: 100 }}>
            <h3 style={{ marginBottom: 20, fontWeight: 700 }}>Add a Suggestion</h3>
            <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 24, lineHeight: 1.6 }}>Seen a place you'll love? Add it to the list for everyone to vote on.</p>
            <form onSubmit={handleAdd}>
               <input 
                 type="text" placeholder="Place Name (e.g. Kyoto Temple)" 
                 value={newPlace} onChange={(e) => setNewPlace(e.target.value)}
                 className="input-field" disabled={trip.status === 'Locked'} style={{ marginBottom: 20 }} required
               />
               <button type="submit" disabled={trip.status === 'Locked'} className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  Add to Group List
               </button>
            </form>
          </div>
        </aside>

        {/* Leaderboard */}
        <main>
           <div className="glass-card" style={{ padding: 30 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                 <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>VOTING LEADERBOARD</h2>
                 <div style={{ color: "#94a3b8", fontSize: 12 }}>Sorted by Popularity</div>
              </div>

              {suggestions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
                   <div style={{ fontSize: 40, marginBottom: 20 }}>🌤️</div>
                   <p>No suggestions yet. Invite your friends to start!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                   {suggestions.map((s, index) => (
                     <div key={s.id} className="glass-card" style={{ 
                        padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: index === 0 ? "rgba(212, 175, 55, 0.05)" : "rgba(255,255,255,0.02)",
                        borderLeft: index === 0 ? "4px solid var(--primary)" : "1px solid rgba(255,255,255,0.1)",
                        animation: "fadeUp 0.3s ease"
                     }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                           <div style={{ width: 28, height: 28, background: index === 0 ? "var(--primary)" : "rgba(255,255,255,0.1)", color: index === 0 ? "var(--dark)" : "white", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontWeight: 800, fontSize: 12 }}>
                              {index + 1}
                           </div>
                           <div>
                              <div style={{ fontWeight: 800, color: "white" }}>{s.place_name}</div>
                              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", marginTop: 4 }}>
                                 SUGGESTED BY: <span style={{ color: "var(--primary)" }}>{s.suggested_by_name || 'Friend'}</span>
                              </div>
                           </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                           <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>{s.vote_count}</div>
                              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Votes</div>
                           </div>
                           <button 
                             onClick={() => handleVote(s.id)}
                             disabled={trip.status === 'Locked'}
                             style={{ 
                               background: s.voted ? "var(--primary)" : "rgba(255,255,255,0.05)",
                               color: s.voted ? "var(--dark)" : "white",
                               border: "1px solid rgba(255,255,255,0.1)",
                               borderRadius: 12, padding: "8px 16px", cursor: "pointer",
                               fontWeight: 800, fontSize: 12, transition: "all 0.2s"
                             }}
                           >
                              {s.voted ? "VOTED" : "VOTE"}
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </main>

      </div>
    </div>
  );
}
