import { NextRequest, NextResponse } from "next/server";
import { zones, getZoneById } from "@/lib/zones";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zoneId = searchParams.get("zone");
  
  // Si piden zona específica
  if (zoneId) {
    const zone = getZoneById(zoneId);
    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }
    const weather = await fetchWeather(zone.lat, zone.lon);
    return NextResponse.json({ [zone.id]: weather });
  }
  
  // Si no, todas las zonas - formato { zoneId: weatherData }
  const results: { [key: string]: any } = {};
  
  await Promise.all(
    zones.map(async (zone) => {
      const weather = await fetchWeather(zone.lat, zone.lon);
      results[zone.id] = weather;
    })
  );
  
  return NextResponse.json(results);
}

async function fetchWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&minutely_15=precipitation_probability&timezone=America/Mexico_City&forecast_minutely_15=4`;
  
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();
    
    const minutely = data.minutely_15;
    const current = data.current || {};
    
    const probs = minutely?.precipitation_probability?.slice(0, 4) || [];
    const maxProb = Math.max(...probs, 0);
    
    return {
      probability: maxProb,
      temp: Math.round(current.temperature_2m || 0),
      wind: Math.round(current.wind_speed_10m || 0),
    };
  } catch (e) {
    console.error("Weather fetch error:", e);
    return { probability: 0, temp: 0, wind: 0 };
  }
}
