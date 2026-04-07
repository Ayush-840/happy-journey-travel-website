import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET: Fetch trip details, members, suggestions, and votes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trip_id = searchParams.get('trip_id');
    const invite_code = searchParams.get('invite_code');
    const db = getDB();

    let trip;
    if (invite_code) {
      trip = db.prepare('SELECT * FROM collab_trips WHERE invite_code = ?').get(invite_code);
    } else {
      trip = db.prepare('SELECT * FROM collab_trips WHERE id = ?').get(trip_id);
    }

    if (!trip) throw new Error("Trip not found.");

    const suggestions = db.prepare(`
      SELECT s.*, COUNT(v.user_id) as vote_count, u.username as suggested_by_name
      FROM collab_suggestions s
      LEFT JOIN collab_votes v ON s.id = v.suggestion_id
      LEFT JOIN users u ON s.suggested_by = u.id
      WHERE s.trip_id = ?
      GROUP BY s.id
      ORDER BY vote_count DESC
    `).all(trip.id);

    return NextResponse.json({ success: true, data: { trip, suggestions } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }
}

// POST: Create or Join Trip / Add Suggestion / Toggle Vote
export async function POST(request) {
  try {
    const db = getDB();
    const body = await request.json();
    const { action, trip_name, user_id, trip_id, place_name, suggestion_id, invite_code } = body;

    const uid = user_id || 1;

    if (action === 'CREATE_TRIP') {
      const id = uuidv4();
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      db.prepare('INSERT INTO collab_trips (id, name, created_by, invite_code) VALUES (?, ?, ?, ?)')
        .run(id, trip_name, uid, code);
      db.prepare('INSERT INTO collab_members (trip_id, user_id) VALUES (?, ?)').run(id, uid);
      return NextResponse.json({ success: true, trip_id: id, invite_code: code });
    }

    if (action === 'JOIN_TRIP') {
      const trip = db.prepare('SELECT id FROM collab_trips WHERE invite_code = ?').get(invite_code);
      if (!trip) throw new Error("Invalid invite code.");
      
      // Add member if not already there
      const existing = db.prepare('SELECT 1 FROM collab_members WHERE trip_id = ? AND user_id = ?').get(trip.id, uid);
      if (!existing) {
        db.prepare('INSERT INTO collab_members (trip_id, user_id) VALUES (?, ?)').run(trip.id, uid);
      }
      return NextResponse.json({ success: true, trip_id: trip.id });
    }

    if (action === 'ADD_SUGGESTION') {
      db.prepare('INSERT INTO collab_suggestions (trip_id, place_name, suggested_by) VALUES (?, ?, ?)')
        .run(trip_id, place_name, uid);
      return NextResponse.json({ success: true });
    }

    if (action === 'TOGGLE_VOTE') {
      const existing = db.prepare('SELECT 1 FROM collab_votes WHERE suggestion_id = ? AND user_id = ?').get(suggestion_id, uid);
      if (existing) {
        db.prepare('DELETE FROM votes WHERE suggestion_id = ? AND user_id = ?').run(suggestion_id, uid);
      } else {
        db.prepare('INSERT INTO collab_votes (suggestion_id, user_id) VALUES (?, ?)').run(suggestion_id, uid);
      }
      return NextResponse.json({ success: true, voted: !existing });
    }

    if (action === 'LOCK_TRIP') {
       db.prepare("UPDATE collab_trips SET status = 'Locked' WHERE id = ?").run(trip_id);
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
