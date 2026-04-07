import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    if (isNaN(lat) || isNaN(lng)) return NextResponse.json({ success: false, error: 'lat and lng required' }, { status: 400 });

    const API_KEY = process.env.GEOAPIFY_API_KEY;

    // Use Geoapify if API key is present
    if (API_KEY) {
      const geoUrl = `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:${lng},${lat},50000&limit=8&apiKey=${API_KEY}`;
      const geoRes = await fetch(geoUrl);
      
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const nearby = geoData.features.map(f => {
          let name = f.properties.name || f.properties.street;
          if (!name && f.properties.categories) {
            name = f.properties.categories[0].split('.').pop()
              .replace(/_/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase());
          }
          if (!name) name = 'Tourist Attraction';

          return {
            slug: null, // Indicates it's an external place
            name: name,
            distance_km: (f.properties.distance / 1000),
            lat: f.properties.lat,
            lng: f.properties.lon,
            best_time: 'Open All Year',
            // Generic placeholder image for Geoapify places
            hero_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500'
          };
        }).filter(p => p.name !== 'Tourist Attraction');

        if (nearby.length > 0) {
          return NextResponse.json({ success: true, data: nearby });
        }
      }
    }

    // Fallback to local DB if no API key or fetch failed/empty
    const places = db.prepare('SELECT * FROM places').all();
    const nearby = places
      .map(p => ({ ...p, distance_km: haversine(lat, lng, p.lat, p.lng) }))
      .filter(p => p.distance_km <= 500)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 8)
      .map(p => ({
        ...p,
        highlights: JSON.parse(p.highlights || '[]'),
        gallery: JSON.parse(p.gallery || '[]'),
        tags: JSON.parse(p.tags || '[]'),
      }));

    return NextResponse.json({ success: true, data: nearby });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
