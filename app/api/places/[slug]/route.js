import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const db = getDB();
    const { slug } = await params;
    const place = db.prepare(`
      SELECT p.*, c.name as city_name, c.slug as city_slug, s.name as state_name, s.slug as state_slug
      FROM places p 
      JOIN cities c ON p.city_id = c.id 
      JOIN states s ON c.state_id = s.id
      WHERE p.slug = ?
    `).get(slug);
    if (!place) return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 });
    const nearby = db.prepare('SELECT * FROM nearby_attractions WHERE place_id = ?').all(place.id);
    return NextResponse.json({
      success: true,
      data: {
        ...place,
        highlights: JSON.parse(place.highlights || '[]'),
        gallery: JSON.parse(place.gallery || '[]'),
        tags: JSON.parse(place.tags || '[]'),
        nearby_attractions: nearby,
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
