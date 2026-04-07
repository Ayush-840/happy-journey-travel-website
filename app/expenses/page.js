"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { settleDebts, convertToMainCurrency, currencyRates } from "@/lib/expense-algorithm";

export default function ExpensesPage() {
  const [activeTrip, setActiveTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([
    { id: 1, username: 'Ayush' },
    { id: 2, username: 'Priya' },
    { id: 3, username: 'Rohit' }
  ]);
  const [settlements, setSettlements] = useState([]);

  // Form State
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [paidBy, setPaidBy] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState([1, 2, 3]);

  const calculateBalances = () => {
    const balances = {};
    members.forEach(m => balances[m.id] = 0);

    expenses.forEach(exp => {
      const amountInBase = convertToMainCurrency(exp.amount, exp.currency, 'INR');
      const share = amountInBase / exp.splits.length;
      
      // Person who paid gets credit
      balances[exp.paidBy] += amountInBase;
      
      // Everyone who split owes their share
      exp.splits.forEach(mId => {
        balances[mId] -= share;
      });
    });

    const result = settleDebts(balances);
    setSettlements(result);
  };

  useEffect(() => {
    calculateBalances();
  }, [expenses]);

  const addExpense = (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    const newExp = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      currency,
      paidBy: parseInt(paidBy),
      splits: selectedMembers,
      date: new Date().toLocaleDateString()
    };

    setExpenses([...expenses, newExp]);
    setDescription("");
    setAmount("");
  };

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "white" }}>
      <Navbar />

      <main style={{ padding: "100px 24px 60px", maxWidth: 1000, margin: "0 auto" }}>
        
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>💸 Split-Trip</span>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800 }}>Group Expenses</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Track spending, split costs, and settle debts easily.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 30 }} className="expense-grid">
          
          {/* Main Feed */}
          <div>
            {/* Add Expense Form */}
            <div className="glass-card" style={{ marginBottom: 30, padding: 24, borderTop: "2px solid var(--primary)" }}>
              <h3 style={{ marginBottom: 20, fontSize: "1.2rem", fontWeight: 700 }}>Add New Expense</h3>
              <form onSubmit={addExpense}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Description</label>
                    <input 
                      type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Dinner, Taxi, Tickets..." className="input-field" required
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field" style={{ padding: "13px 8px" }}>
                        {Object.keys(currencyRates).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Amount</label>
                      <input 
                        type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00" className="input-field" required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                   <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Paid By</label>
                   <div style={{ display: "flex", gap: 10 }}>
                     {members.map(m => (
                       <button 
                        key={m.id} type="button"
                        onClick={() => setPaidBy(m.id)}
                        style={{ 
                          padding: "8px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)",
                          background: paidBy === m.id ? "var(--primary)" : "rgba(255,255,255,0.05)",
                          color: paidBy === m.id ? "var(--dark)" : "white", fontWeight: 600, cursor: "pointer"
                        }}
                       >
                         {m.username}
                       </button>
                     ))}
                   </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                   <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Split Between</label>
                   <div style={{ display: "flex", gap: 10 }}>
                     {members.map(m => (
                       <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: 20, border: selectedMembers.includes(m.id) ? "1px solid var(--primary)" : "1px solid transparent" }}>
                         <input type="checkbox" checked={selectedMembers.includes(m.id)} onChange={() => toggleMember(m.id)} style={{ display: "none" }} />
                         <span style={{ fontSize: 14 }}>{selectedMembers.includes(m.id) ? "✅" : "➕"} {m.username}</span>
                       </label>
                     ))}
                   </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>Add Expense</button>
              </form>
            </div>

            {/* Expense List */}
            <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
                 <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Trip Expenses</h3>
              </div>
              <div style={{ maxHeight: 500, overflowY: "auto" }}>
                {expenses.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No expenses added yet.</div>
                ) : (
                  expenses.map(exp => (
                    <div key={exp.id} style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <div>
                         <div style={{ fontWeight: 600 }}>{exp.description}</div>
                         <div style={{ fontSize: 12, color: "#64748b" }}>
                           Paid by {members.find(m => m.id === exp.paidBy).username} • Split between {exp.splits.length} people
                         </div>
                       </div>
                       <div style={{ textAlign: "right" }}>
                         <div style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>{exp.currency} {exp.amount}</div>
                         <div style={{ fontSize: 11, color: "#64748b" }}>≈ ₹{convertToMainCurrency(exp.amount, exp.currency).toFixed(2)}</div>
                       </div>
                    </div>
                  ))
                ).reverse()}
              </div>
            </div>
          </div>

          {/* Sidebar settlements */}
          <div style={{ position: "sticky", top: 100 }}>
            <div className="glass-card" style={{ padding: 24, borderTop: "2px solid #10b981", boxShadow: "0 10px 40px rgba(16, 185, 129, 0.1)" }}>
              <h3 style={{ marginBottom: 20, fontSize: "1.2rem", fontWeight: 700, color: "#10b981" }}>Who owes Who</h3>
              
              {settlements.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#64748b", fontSize: 13 }}>All debts are settled! 🎉</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  {settlements.map((s, i) => (
                    <div key={i} style={{ padding: "15px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 600, color: "#ef4444" }}>{members.find(m => m.id == s.from).username}</span>
                          <span style={{ fontSize: 12, color: "#64748b" }}>owes</span>
                          <span style={{ fontWeight: 600, color: "#10b981" }}>{members.find(m => m.id == s.to).username}</span>
                       </div>
                       <div style={{ marginTop: 10, fontSize: "1.4rem", fontWeight: 800, textAlign: "center" }}>
                         ₹{s.amount}
                       </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 30, padding: 15, background: "rgba(212, 175, 55, 0.05)", borderRadius: 12, border: "1px dashed var(--primary)" }}>
                <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>Total Trip cost</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                  ₹{expenses.reduce((acc, exp) => acc + convertToMainCurrency(exp.amount, exp.currency), 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ marginTop: 20, padding: 20, background: "rgba(255,255,255,0.02)" }}>
               <h4 style={{ fontSize: 13, marginBottom: 12, color: "#94a3b8" }}>💡 Split Tip</h4>
               <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                 Add expenses as they happen to keep tracking easy. We handle all currency conversions automatically using the trip's base rates!
               </p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
