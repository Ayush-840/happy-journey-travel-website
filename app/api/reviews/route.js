import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getDistanceInMeters } from '@/lib/geo-utils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const place_id = searchParams.get('place_id');
    const db = getDB();

    const reviews = db.prepare(`
      SELECT r.*, u.username, u.avatar_url 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.place_id = ? 
      ORDER BY r.is_verified DESC, r.created_at DESC
    `).all(place_id);

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDB();
    const body = await request.json();
    const { user_id, place_id, rating, comment, image_url, lat, lng } = body;

    let is_verified = false;
    let verification_type = null;

    // 1. Check for Booking Verification
    const booking = db.prepare(`
      SELECT id FROM transport_bookings WHERE user_phone = (SELECT username FROM users WHERE id = ?) -- Mocking phone/username link
      UNION
      SELECT id FROM stay_bookings WHERE user_name = (SELECT username FROM users WHERE id = ?) -- Mocking name/username link
    `).get(user_id, user_id);

    if (booking) {
      is_verified = true;
      verification_type = 'Booking';
    } else if (lat && lng) {
      // 2. Check for GPS Verification (Within 500m)
      const place = db.prepare('SELECT lat, lng FROM places WHERE slug = ?').get(place_id);
      if (place && place.lat && place.lng) {
        const distance = getDistanceInMeters(lat, lng, place.lat, place.lng);
        if (distance <= 500) {
          is_verified = true;
          verification_type = 'GPS';
        }
      }
    }

    // 3. Save Review
    const info = db.prepare(`
      INSERT INTO reviews (user_id, place_id, rating, comment, image_url, is_verified, verification_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(user_id || 1, place_id, rating, comment, image_url, is_verified ? 1 : 0, verification_type);

    // 4. Award HJ Coins if verified
    if (is_verified) {
      let coins = 10; // Base verified review
      if (image_url) coins += 15; // Bonus for photo
      
      db.prepare('UPDATE users SET hj_coins = hj_coins + ? WHERE id = ?').run(coins, user_id || 1);
    }

    return NextResponse.json({ success: true, is_verified, verification_type });
  } catch (error) {
    console.error('Review Post Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
