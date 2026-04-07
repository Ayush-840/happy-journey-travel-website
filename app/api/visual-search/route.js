import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json({ success: false, error: 'No image provided.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    // Convert image to Base64
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const imageBase64 = imageBuffer.toString("base64");

    const prompt = `Identify the location or landmark in this photo. 
      Return ONLY JSON in this format: 
      { 
        "location_name": "Name of the place, City", 
        "coordinates": { "lat": number, "lng": number }, 
        "confidence": number, 
        "success": boolean,
        "summary": "Short 1-sentence description of the landmark"
      }
      If you can't identify it with confidence > 0.5, set success to false.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: image.type } }
    ]);

    const textResponse = result.response.text();
    // Clean JSON from potential markdown backticks
    const jsonStr = textResponse.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(jsonStr);

    if (!aiData.success || aiData.confidence < 0.5) {
      return NextResponse.json({ success: false, error: 'Location unidentified.' });
    }

    return NextResponse.json({ success: true, data: aiData });
  } catch (error) {
    console.error('Visual Search Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
