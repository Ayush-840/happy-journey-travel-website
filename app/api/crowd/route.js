import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

// GET: Calculate occupancy based on time and check-ins
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const place_id = searchParams.get('place_id');
    const db = getDB();

    // 1. Base historical occupancy based on current hour
    const hour = new Date().getHours();
    const day = new Date().getDay(); // 0 is Sunday, 6 is Saturday
    
    // Simulate: Weekend evenings are peak (60-80%), weekdays are mid (20-40%)
    let base = (day === 0 || day === 6) ? 50 : 20;
    if (hour >= 17 && hour <= 21) base += 30; // evening rush
    if (hour >= 11 && hour <= 15) base += 15; // lunch rush

    // 2. Add real-time check-ins (last 2 hours)
    const checkins = db.prepare(`
      SELECT COUNT(*) as count FROM crowd_checkins 
      WHERE place_id = ? AND timestamp > datetime('now', '-2 hours')
    `).get(place_id);

    const liveCount = checkins?.count || 0;
    const occupancy = Math.min(100, base + (liveCount * 5));

    return NextResponse.json({ success: true, occupancy });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add a new check-in
export async function POST(request) {
  try {
    const { place_id } = await request.json();
    const db = getDB();

    db.prepare('INSERT INTO crowd_checkins (place_id) VALUES (?)').run(place_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
