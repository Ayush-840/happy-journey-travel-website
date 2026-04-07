import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trip_id = searchParams.get('trip_id');
    const db = getDB();

    const expenses = db.prepare('SELECT * FROM trip_expenses WHERE trip_id = ? ORDER BY created_at DESC')
      .all(trip_id || 'default');

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { trip_id, item_name, amount, paid_by } = body;
    const db = getDB();

    db.prepare('INSERT INTO trip_expenses (trip_id, item_name, amount, paid_by) VALUES (?, ?, ?, ?)')
      .run(trip_id || 'default', item_name, parseFloat(amount), paid_by);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
