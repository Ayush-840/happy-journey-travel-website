import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const db = getDB();
    const states = db.prepare('SELECT * FROM states ORDER BY name').all();
    return NextResponse.json({ success: true, data: states });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
