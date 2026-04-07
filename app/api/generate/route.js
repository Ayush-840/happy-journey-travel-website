import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are a professional travel architect for "Happy Journey".
Your task is to generate a detailed day-by-day travel itinerary.
Return ONLY a JSON object. No preamble, no post-text.

JSON Schema:
{
  "trip_title": "string",
  "itinerary": [
    {
      "day": number,
      "morning": { "activity": "string", "description": "string", "cost": "string" },
      "afternoon": { "activity": "string", "description": "string", "cost": "string" },
      "evening": { "activity": "string", "description": "string", "cost": "string" }
    }
  ]
}
`;

export async function POST(request) {
  try {
    const { destination, days, budget, interests } = await request.json();

    // In a real app, you would use OpenAI or Gemini here
    // For this demonstration, we'll return a high-quality mock response
    // to show how the frontend handles the structured data.
    
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const mockResponse = {
      trip_title: `${days} Days in ${destination}: ${interests} Explorer`,
      itinerary: Array.from({ length: parseInt(days) }, (_, i) => ({
        day: i + 1,
        morning: { 
          activity: `Explore the Heart of ${destination}`, 
          description: `Begin your journey by visiting the most iconic landmark in ${destination}, soaking in the morning atmosphere.`, 
          cost: budget === 'Luxury' ? '$150' : '$20' 
        },
        afternoon: { 
          activity: `${interests}-themed Experience`, 
          description: `A specialized tour focusing on ${interests}, including local secrets and hidden spots away from the crowds.`, 
          cost: budget === 'Luxury' ? '$250' : '$45' 
        },
        evening: { 
          activity: "Sunset Dinner & Local Vibes", 
          description: `Enjoy a traditional dinner with views of the ${destination} skyline, followed by a walk through the vibrant night markets.`, 
          cost: budget === 'Luxury' ? '$300' : '$60' 
        }
      }))
    };

    return NextResponse.json({ success: true, data: mockResponse });
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate itinerary. Please try again.' }, { status: 500 });
  }
}
