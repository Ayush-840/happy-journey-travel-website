import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDB();
    const body = await request.json();
    const { user_name, user_phone, stay_id, check_in, check_out, guests } = body;
    if (!user_name || !user_phone || !stay_id || !check_in || !check_out || !guests) {
      return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 });
    }
    const result = db.prepare(
      'INSERT INTO stay_bookings (user_name, user_phone, stay_id, check_in, check_out, guests) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(user_name, user_phone, stay_id, check_in, check_out, guests);
    return NextResponse.json({ success: true, data: { id: result.lastInsertRowid, status: 'confirmed', message: 'Stay booked successfully!' } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ success: false, error: 'Server configuration error: ADMIN_PASSWORD is not set in environment variables.' }, { status: 500 });
    }

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid password.' }, { status: 401 });
    }

    const db = getDB();
    const bookings = db.prepare(`
      SELECT sb.*, s.name as hotel_name, c.name as city_name 
      FROM stay_bookings sb 
      JOIN stays s ON sb.stay_id = s.id 
      JOIN cities c ON s.city_id = c.id
      ORDER BY sb.created_at DESC
    `).all();
    return NextResponse.json({ success: true, data: bookings });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
