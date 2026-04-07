import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const place_id = searchParams.get('place_id');
    const db = getDB();

    const stats = db.prepare(`
      SELECT 
        AVG(lighting) as lighting, 
        AVG(police_presence) as police, 
        AVG(solo_friendly) as solo,
        COUNT(*) as count
      FROM safety_reviews 
      WHERE place_id = ?
    `).get(place_id);

    return NextResponse.json({ 
      success: true, 
      data: { 
        lighting: stats?.lighting || 0, 
        police: stats?.police || 0, 
        solo: stats?.solo || 0,
        count: stats?.count || 0
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { place_id, user_id, lighting, police, solo, comment } = body;
    const db = getDB();

    db.prepare(`
      INSERT OR REPLACE INTO safety_reviews (place_id, user_id, lighting, police_presence, solo_friendly, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(place_id, user_id || 1, lighting, police, solo, comment);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
