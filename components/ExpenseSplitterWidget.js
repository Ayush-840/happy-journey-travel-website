"use client";
import { useState, useEffect } from "react";
import { calculateSettlement } from "@/lib/expense-algorithm";

export default function ExpenseSplitterWidget({ tripId }) {
  const [friends, setFriends] = useState(["Aman", "Neha"]); // Default friends
  const [expenses, setExpenses] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", amount: "", paid_by: "Aman" });
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/expenses?trip_id=${tripId}`);
      const data = await res.json();
      if (data.success) setExpenses(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [tripId]);

  const addExpense = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.amount) return;
    setLoading(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newItem, trip_id: tripId })
      });
      if ((await res.json()).success) {
        setNewItem({ name: "", amount: "", paid_by: friends[0] });
        fetchExpenses();
      }
    } catch (err) {
      alert("Failed to add expense.");
    } finally {
      setLoading(false);
    }
  };

  const { groupTotal, individualShare, settlements } = calculateSettlement(friends, expenses);

  return (
    <div className="glass-card" style={{ padding: 24, background: "rgba(255,255,255,0.02)" }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>💰 Group Expense Splitter</h3>

      {/* Add Expense Form */}
      <form onSubmit={addExpense} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <input 
          type="text" placeholder="Item (e.g. Hotel, Fuel)" 
          value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
          className="input-field" style={{ fontSize: 13, padding: 10 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input 
            type="number" placeholder="Amount (₹)" 
            value={newItem.amount} onChange={e => setNewItem({...newItem, amount: e.target.value})}
            className="input-field" style={{ flex: 1, fontSize: 13, padding: 10 }}
          />
          <select 
            value={newItem.paid_by} onChange={e => setNewItem({...newItem, paid_by: e.target.value})}
            className="input-field" style={{ flex: 1, fontSize: 13, padding: 10 }}
          >
            {friends.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: 10, fontSize: 12 }}>
          {loading ? "Adding..." : "+ Add Expense"}
        </button>
      </form>

      {/* Live Balance Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,165,0,0.05)", borderRadius: 12, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, color: "#94a3b8" }}>GROUP TOTAL</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>₹{groupTotal.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#94a3b8" }}>EACH PAYS</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--primary)" }}>₹{individualShare.toLocaleString()}</div>
        </div>
      </div>

      {/* Settlement Table */}
      {settlements.length > 0 && (
        <div style={{ marginTop: 20 }}>
           <h4 style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 16, textTransform: "uppercase" }}>🛡️ Settlement Logic</h4>
           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {settlements.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, fontSize: 12 }}>
                   <div style={{ color: "#cbd5e1" }}><span style={{ fontWeight: 800, color: "white" }}>{s.from}</span> owes <span style={{ fontWeight: 800, color: "white" }}>{s.to}</span></div>
                   <div style={{ fontWeight: 800, color: "#4ade80" }}>₹{s.amount.toLocaleString()}</div>
                </div>
              ))}
           </div>
        </div>
      )}

      {expenses.length === 0 && <p style={{ fontSize: 11, color: "#475569", textAlign: "center", marginTop: 20 }}>No expenses added yet.</p>}
    </div>
  );
}
