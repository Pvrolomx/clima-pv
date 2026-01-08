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
    return NextResponse.json({ zone, weather });
  }
  
  // Si no, todas las zonas
  const results = await Promise.all(
    zones.map(async (zone) => {
      const weather = await fetchWeather(zone.lat, zone.lon);
      return { zone, weather };
    })
  );
  
  return NextResponse.json(results);
}

async function fetchWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&minutely_15=precipitation_probability,precipitation&timezone=America/Mexico_City&forecast_minutely_15=4`;
  
  try {
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    const data = await res.json();
    
    const minutely = data.minutely_15;
    if (!minutely) return { status: "unknown", probability: 0 };
    
    // Próximos 4 intervalos de 15 min = 1 hora
    const probs = minutely.precipitation_probability?.slice(0, 4) || [];
    const maxProb = Math.max(...probs, 0);
    
    // Determinar status
    let status = "clear"; // verde
    if (maxProb >= 70) status = "rain"; // rojo
    else if (maxProb >= 40) status = "likely"; // naranja
    else if (maxProb >= 20) status = "possible"; // amarillo
    
    return {
      status,
      probability: maxProb,
      nextHour: probs,
      time: minutely.time?.slice(0, 4) || [],
    };
  } catch (e) {
    console.error("Weather fetch error:", e);
    return { status: "error", probability: 0 };
  }
}
