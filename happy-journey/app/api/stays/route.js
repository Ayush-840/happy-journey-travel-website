import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);
    const citySlug = searchParams.get('city');
    if (!citySlug) return NextResponse.json({ success: false, error: 'city param required' }, { status: 400 });
    const city = db.prepare('SELECT id FROM cities WHERE slug = ?').get(citySlug);
    if (!city) return NextResponse.json({ success: false, error: 'City not found' }, { status: 404 });
    const stays = db.prepare('SELECT * FROM stays WHERE city_id = ?').all(city.id);
    const parsed = stays.map(s => ({ ...s, amenities: JSON.parse(s.amenities || '[]') }));
    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
