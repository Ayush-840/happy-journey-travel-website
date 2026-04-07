"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  const [transports, setTransports] = useState([]);
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Check if password exists in localStorage
    const savedPass = localStorage.getItem("admin_pass");
    if (savedPass) {
      fetchBookings(savedPass);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBookings = async (pass) => {
    setLoading(true);
    setLoginError("");
    try {
      const [tRes, sRes] = await Promise.all([
        fetch('/api/bookings/transport', { headers: { 'Authorization': pass } }),
        fetch('/api/bookings/stay', { headers: { 'Authorization': pass } })
      ]);

      const tData = await tRes.json();
      const sData = await sRes.json();

      if (tRes.status === 401 || sRes.status === 401 || tRes.status === 500 || sRes.status === 500) {
        setLoginError(tData.error || sData.error || "Invalid password. Please try again.");
        localStorage.removeItem("admin_pass");
        setIsAuthenticated(false);
      } else {
        if (tData.success) setTransports(tData.data);
        if (sData.success) setStays(sData.data);
        setIsAuthenticated(true);
        localStorage.setItem("admin_pass", pass);
      }
    } catch (err) {
      setError("Failed to fetch bookings. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchBookings(passwordInput);
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white", padding: 100, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
    <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", marginBottom: 20 }}></div>
    Loading Admin...
  </div>;

  if (!isAuthenticated) return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="glass-card" style={{ padding: 40, maxWidth: 400, width: "100%", textAlign: "center", animation: "fadeUp 0.6s ease" }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "var(--primary)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 10px 30px rgba(212, 175, 55, 0.3)" }}>🔒</div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 12 }}>Admin Access</h1>
        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 32 }}>Please enter your secret password to view customer bookings.</p>
        
        <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 600, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: 1 }}>Password</label>
          <input 
            type="password" 
            value={passwordInput} 
            onChange={(e) => setPasswordInput(e.target.value)} 
            className="input-field"
            placeholder="Enter your password"
            style={{ marginBottom: 16 }}
            required
          />
          {loginError && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 16, textAlign: "center" }}>{loginError}</div>}
          <button type="submit" className="btn-primary" style={{ width: "100%", padding: "14px", justifyContent: "center" }}>
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />

      <main style={{ padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 20 }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>🔒 Admin Dashboard</span>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800 }}>Customer Bookings</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>View all incoming transport and stay bookings.</p>
        </div>

        {error && <div style={{ padding: 20, background: "rgba(220, 17, 17, 0.1)", color: "#ef4444", borderRadius: 12, marginBottom: 30 }}>Error: {error}</div>}

        {/* TRANSPORT BOOKINGS */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 20, color: "var(--primary)", display: "flex", gap: 10, alignItems: "center" }}>
            🚕 Transport Bookings
            <span style={{ fontSize: 13, padding: "4px 12px", background: "rgba(255,255,255,0.1)", borderRadius: 20, color: "white" }}>{transports.length} total</span>
          </h2>

          <div className="glass-card table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "rgba(212, 175, 55, 0.15)", color: "#fff8e1", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>
                  <th style={{ padding: "16px 20px" }}>ID</th>
                  <th style={{ padding: "16px 20px" }}>Customer</th>
                  <th style={{ padding: "16px 20px" }}>Phone</th>
                  <th style={{ padding: "16px 20px" }}>Journey</th>
                  <th style={{ padding: "16px 20px" }}>Type</th>
                  <th style={{ padding: "16px 20px" }}>Date</th>
                  <th style={{ padding: "16px 20px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transports.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: 30, textAlign: "center", color: "#64748b" }}>No transport bookings yet.</td></tr>
                ) : (
                  transports.map((t, i) => (
                    <tr key={t.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                      <td style={{ padding: "16px 20px", color: "#64748b" }}>#{t.id}</td>
                      <td style={{ padding: "16px 20px", fontWeight: 600 }}>{t.user_name}</td>
                      <td style={{ padding: "16px 20px" }}>{t.user_phone}</td>
                      <td style={{ padding: "16px 20px" }}>{t.from_city} → {t.to_city}</td>
                      <td style={{ padding: "16px 20px" }}><span className="badge badge-primary">{t.transport_type}</span></td>
                      <td style={{ padding: "16px 20px" }}>{t.travel_date}</td>
                      <td style={{ padding: "16px 20px", color: "#10b981", fontWeight: 600 }}>{t.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* STAY BOOKINGS */}
        <section>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 20, color: "var(--primary)", display: "flex", gap: 10, alignItems: "center" }}>
            🏨 Stay / Hotel Bookings
            <span style={{ fontSize: 13, padding: "4px 12px", background: "rgba(255,255,255,0.1)", borderRadius: 20, color: "white" }}>{stays.length} total</span>
          </h2>

          <div className="glass-card table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "rgba(212, 175, 55, 0.15)", color: "#fff8e1", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>
                  <th style={{ padding: "16px 20px" }}>ID</th>
                  <th style={{ padding: "16px 20px" }}>Customer</th>
                  <th style={{ padding: "16px 20px" }}>Phone</th>
                  <th style={{ padding: "16px 20px" }}>Destination Hotel</th>
                  <th style={{ padding: "16px 20px" }}>Dates</th>
                  <th style={{ padding: "16px 20px" }}>Guests</th>
                  <th style={{ padding: "16px 20px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stays.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: 30, textAlign: "center", color: "#64748b" }}>No stay bookings yet.</td></tr>
                ) : (
                  stays.map((s, i) => (
                    <tr key={s.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                      <td style={{ padding: "16px 20px", color: "#64748b" }}>#{s.id}</td>
                      <td style={{ padding: "16px 20px", fontWeight: 600 }}>{s.user_name}</td>
                      <td style={{ padding: "16px 20px" }}>{s.user_phone}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: 600 }}>{s.hotel_name}</div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>📍 {s.city_name}</div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>{s.check_in} to {s.check_out}</td>
                      <td style={{ padding: "16px 20px" }}>{s.guests}</td>
                      <td style={{ padding: "16px 20px", color: "#10b981", fontWeight: 600 }}>{s.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
