import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(req) {
  try {
    const { message } = await req.json();
    const query = message.toLowerCase().trim();
    const db = getDB();

    // 1. Check for specific site-related questions
    if (query.includes("plan") || query.includes("planner")) {
      return NextResponse.json({ reply: "You can use our Smart Trip Planner! Just go to the 'Trip Planner' section in the menu, tell us your destination and days, and we'll craft the perfect itinerary for you. ✨" });
    }
    if (query.includes("book") || query.includes("taxi") || query.includes("cab")) {
      return NextResponse.json({ reply: "To book transport, navigate to any specific city page. We provide options for cabs, bikes, and even local ferries in places like Goa and Kerala! 🚕" });
    }
    if (query.includes("admin") || query.includes("login")) {
      return NextResponse.json({ reply: "The Admin panel is for our site managers to update travel info. You can find the link in the footer or menu. 🔐" });
    }

    // 2. Search Database for States
    const state = db.prepare('SELECT name, description, region FROM states WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? LIMIT 1')
      .get(`%${query}%`, `%${query}%`);
    if (state) {
      return NextResponse.json({ reply: `${state.name} is a beautiful region in ${state.region} India. ${state.description} Would you like to explore specific cities there?` });
    }

    // 3. Search Database for Cities
    const city = db.prepare('SELECT name, description FROM cities WHERE LOWER(name) LIKE ? LIMIT 1')
      .get(`%${query}%`);
    if (city) {
      return NextResponse.json({ reply: `${city.name} is amazing! ${city.description} You can find great stays and transport options for ${city.name} on our platform.` });
    }

    // 4. Search Database for Places
    const place = db.prepare('SELECT name, description, best_time, rating FROM places WHERE LOWER(name) LIKE ? LIMIT 1')
      .get(`%${query}%`);
    if (place) {
      return NextResponse.json({ reply: `${place.name} (Rated ${place.rating}⭐) is a must-visit! ${place.description} The best time to visit is ${place.best_time}.` });
    }

    // Default Fallback
    return NextResponse.json({ reply: "I'm not sure about that specific detail, but you can explore our 'Destinations' section for all 10+ states and 50+ cities across India! 🇮🇳" });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
