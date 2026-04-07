import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDB();
    const body = await request.json();
    const { user_name, user_phone, from_city, to_city, transport_type, travel_date } = body;
    if (!user_name || !user_phone || !from_city || !to_city || !transport_type || !travel_date) {
      return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 });
    }
    const result = db.prepare(
      'INSERT INTO transport_bookings (user_name, user_phone, from_city, to_city, transport_type, travel_date) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(user_name, user_phone, from_city, to_city, transport_type, travel_date);
    return NextResponse.json({ success: true, data: { id: result.lastInsertRowid, status: 'confirmed', message: 'Transport booked successfully!' } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log(`[AuthDebug] Header Length: ${authHeader?.length}, Secret Length: ${adminPassword?.length}`);

    if (!adminPassword) {
      return NextResponse.json({ success: false, error: 'Server configuration error: ADMIN_PASSWORD is not set in environment variables.' }, { status: 500 });
    }

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid password.' }, { status: 401 });
    }

    const db = getDB();
    const bookings = db.prepare('SELECT * FROM transport_bookings ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, data: bookings });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
