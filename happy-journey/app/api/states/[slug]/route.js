import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const db = getDB();
    const { slug } = await params;
    const state = db.prepare('SELECT * FROM states WHERE slug = ?').get(slug);
    if (!state) return NextResponse.json({ success: false, error: 'State not found' }, { status: 404 });
    const cities = db.prepare('SELECT * FROM cities WHERE state_id = ?').all(state.id);
    return NextResponse.json({ success: true, data: { ...state, cities } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
