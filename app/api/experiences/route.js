import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getDistanceInMeters } from '@/lib/geo-utils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = parseFloat(searchParams.get('radius')) || 20; // km

    const db = getDB();
    let experiences = db.prepare('SELECT * FROM experiences').all();

    if (!isNaN(lat) && !isNaN(lng)) {
      // Filter by radius in the application layer for SQLite 
      // (Simplified approach: calculate distance for each and filter)
      experiences = experiences
        .map(exp => ({
          ...exp,
          distance_km: getDistanceInMeters(lat, lng, exp.lat, exp.lng) / 1000
        }))
        .filter(exp => exp.distance_km <= radius)
        .sort((a, b) => a.distance_km - b.distance_km);
    }

    return NextResponse.json({ success: true, data: experiences });
  } catch (error) {
    console.error('Experiences API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDB();
    const body = await request.json();
    const { experience_id, user_id, quantity, booking_date } = body;

    // Use a transaction for safe booking (Atomic Occupancy)
    const transaction = db.transaction(() => {
      // 1. Check current bookings for this experience/date
      const result = db.prepare(`
        SELECT COALESCE(SUM(quantity), 0) as booked, e.total_slots 
        FROM experiences e
        LEFT JOIN exp_bookings b ON e.id = b.experience_id AND b.booking_date = ?
        WHERE e.id = ?
        GROUP BY e.id
      `).get(booking_date, experience_id);

      if (!result) throw new Error("Experience not found.");
      if (result.booked + quantity > result.total_slots) {
        throw new Error(`Only ${result.total_slots - result.booked} slots remaining.`);
      }

      // 2. Perform the booking
      db.prepare('INSERT INTO exp_bookings (experience_id, user_id, quantity, booking_date) VALUES (?, ?, ?, ?)')
        .run(experience_id, user_id || 1, quantity, booking_date);
    });

    transaction();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
