"use client";

export default function ItineraryTimeline({ data }) {
  if (!data || !data.itinerary) return null;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 0" }}>
      <div style={{ marginBottom: 60, textAlign: "center" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: 8 }}>{data.trip_title}</h2>
        <div style={{ padding: "8px 20px", background: "rgba(212, 175, 55, 0.15)", color: "var(--primary)", borderRadius: 30, display: "inline-block", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
          ✨ AI GENERATED PLAN
        </div>
      </div>

      <div style={{ position: "relative" }}>
        {/* The Vertical Line */}
        <div style={{ position: "absolute", left: "20px", top: 0, bottom: 0, width: "2px", background: "linear-gradient(to bottom, var(--primary), transparent)", opacity: 0.3 }} />

        {data.itinerary.map((day, idx) => (
          <div key={idx} style={{ marginBottom: 60, position: "relative", paddingLeft: 60, animation: `fadeUp 0.6s ease forwards ${idx * 0.2}s`, opacity: 0 }}>
            {/* Day Bubble */}
            <div style={{ 
              position: "absolute", left: 0, top: 0, width: 42, height: 42, borderRadius: "50%", 
              background: "var(--primary)", color: "var(--dark)", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 14, boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)", zIndex: 10
            }}>
              {day.day}
            </div>

            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 20 }}>Day {day.day}</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Morning */}
              <TimelineCard 
                icon="🌅" 
                title="Morning" 
                {...day.morning} 
              />
              {/* Afternoon */}
              <TimelineCard 
                icon="☀️" 
                title="Afternoon" 
                {...day.afternoon} 
              />
              {/* Evening */}
              <TimelineCard 
                icon="🌙" 
                title="Evening" 
                {...day.evening} 
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 40 }}>
         <button onClick={() => window.print()} className="btn-secondary" style={{ padding: "12px 30px" }}>
           🖨️ Print Itinerary
         </button>
      </div>
    </div>
  );
}

function TimelineCard({ icon, title, activity, description, cost }) {
  return (
    <div className="glass-card hover-card" style={{ padding: 20, borderLeft: "4px solid var(--primary)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>{title}</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "rgba(212, 175, 55, 0.1)", padding: "4px 10px", borderRadius: 10 }}>
          {cost}
        </div>
      </div>
      <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>{activity}</h4>
      <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}
