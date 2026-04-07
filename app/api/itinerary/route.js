import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);
    const stateName = searchParams.get('state');
    const cityName = searchParams.get('city');
    const days = parseInt(searchParams.get('days')) || 3;
    const budget = searchParams.get('budget') || 'Medium';

    if (!stateName || !cityName) {
      return NextResponse.json({ success: false, error: 'State and City are required' }, { status: 400 });
    }

    // Find city and its places
    const city = db.prepare('SELECT * FROM cities WHERE name LIKE ?').get(`%${cityName}%`);
    if (!city) {
      return NextResponse.json({ success: false, error: 'City not found' }, { status: 404 });
    }

    const places = db.prepare('SELECT * FROM places WHERE city_id = ?').all(city.id);
    
    // Simple logic to distribute places over days
    const itinerary = [];
    for (let i = 1; i <= days; i++) {
        // Distribute places: ~2-3 places per day
        const dayPlaces = places.slice((i-1)*2, i*2);
        itinerary.push({
            day: i,
            title: `Day ${i}: Exploring ${cityName}`,
            description: i === 1 ? `Start your journey in the heart of ${cityName}.` : `Continue discovering the hidden gems of ${cityName}.`,
            activities: dayPlaces.map(p => ({
                name: p.name,
                description: p.description,
                image: p.hero_image,
                type: p.type || 'Sightseeing',
                rating: p.rating,
                budget: p.budget_per_day
            }))
        });
    }

    return NextResponse.json({ success: true, data: {
        city: cityName,
        state: stateName,
        days,
        budget,
        itinerary
    }});
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
