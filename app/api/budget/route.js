import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const db = getDB();

    const budget = db.prepare('SELECT * FROM user_budgets WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(user_id || 1);

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, total_budget, transport_type, stay_type } = body;
    const db = getDB();

    db.prepare('INSERT INTO user_budgets (user_id, total_budget, transport_type, stay_type) VALUES (?, ?, ?, ?)')
      .run(user_id || 1, total_budget, transport_type, stay_type);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
