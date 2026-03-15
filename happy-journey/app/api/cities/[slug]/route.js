import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const db = getDB();
    const { slug } = await params;
    const city = db.prepare('SELECT c.*, s.name as state_name, s.slug as state_slug FROM cities c JOIN states s ON c.state_id = s.id WHERE c.slug = ?').get(slug);
    if (!city) return NextResponse.json({ success: false, error: 'City not found' }, { status: 404 });
    const places = db.prepare('SELECT * FROM places WHERE city_id = ?').all(city.id);
    const parsedPlaces = places.map(p => ({
      ...p,
      highlights: JSON.parse(p.highlights || '[]'),
      gallery: JSON.parse(p.gallery || '[]'),
      tags: JSON.parse(p.tags || '[]'),
    }));
    return NextResponse.json({ success: true, data: { ...city, places: parsedPlaces } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
