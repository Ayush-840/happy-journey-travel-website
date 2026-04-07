import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const db = getDB();
    // Fetch posts with user info join using SQLite
    const posts = db.prepare(`
      SELECT p.*, u.username, u.avatar_url 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `).all();

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error('Feed API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDB();
    const body = await request.json();
    const { user_id, location_name, image_url, review } = body;

    if (!user_id || !location_name || !image_url) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const info = db.prepare('INSERT INTO posts (user_id, location_name, image_url, review) VALUES (?, ?, ?, ?)')
      .run(user_id, location_name, image_url, review);

    return NextResponse.json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    console.error('Feed Create Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
