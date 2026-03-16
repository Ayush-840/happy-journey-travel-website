"use client";

export default function BookingModal({ type, data, citySlug, onClose }) {
  const isStay = type === "stay";

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const body = isStay
      ? { user_name: form.get("name"), user_phone: form.get("phone"), stay_id: data.id, check_in: form.get("check_in"), check_out: form.get("check_out"), guests: parseInt(form.get("guests")) }
      : { user_name: form.get("name"), user_phone: form.get("phone"), from_city: citySlug, to_city: form.get("to_city"), transport_type: data.type, travel_date: form.get("date") };

    const endpoint = isStay ? "/api/bookings/stay" : "/api/bookings/transport";
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.success) {
      alert(`✅ Booking Confirmed! Your booking ID is #${json.data.id}. We'll contact you shortly.`);
      onClose();
    } else {
      alert("❌ Booking failed: " + json.error);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ display: "flex", alignItems: "flex-end", padding: 0 }}>
      <div className="modal-box" style={{ 
        borderBottomLeftRadius: 0, borderBottomRightRadius: 0, 
        maxHeight: "85vh", transition: "transform 0.3s ease-out" 
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{isStay ? "🏨" : "🚕"}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          {isStay ? `Book ${data.name}` : `Book ${data.type}`}
        </h2>
        {isStay ? (
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>₹{data.price_per_night?.toLocaleString()} / night · {"⭐".repeat(data.stars)}</p>
        ) : (
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>{data.icon} {data.provider} · ₹{data.price_min}–{data.price_max}</p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "block" }}>Your Name</label>
            <input name="name" required placeholder="Fullname" className="input-field" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "block" }}>Phone Number</label>
            <input name="phone" required placeholder="+91 XXXXX XXXXX" className="input-field" />
          </div>

          {isStay ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "block" }}>Check-in</label>
                  <input name="check_in" type="date" required className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "block" }}>Check-out</label>
                  <input name="check_out" type="date" required className="input-field" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "block" }}>Guests</label>
                <input name="guests" type="number" min="1" max="10" defaultValue="2" required className="input-field" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "block" }}>Destination City</label>
                <input name="to_city" required placeholder="Where are you going?" className="input-field" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "block" }}>Travel Date</label>
                <input name="date" type="date" required className="input-field" />
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>Confirm Booking</button>
          </div>
        </form>
      </div>
    </div>
  );
}
