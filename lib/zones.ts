// Zonas de Puerto Vallarta y Bahía de Banderas
export interface Zone {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const zones: Zone[] = [
  { id: "centro", name: "Centro PV", lat: 20.6534, lon: -105.2253 },
  { id: "romantica", name: "Zona Romántica", lat: 20.6441, lon: -105.2287 },
  { id: "marina", name: "Marina Vallarta", lat: 20.6847, lon: -105.2544 },
  { id: "pitillal", name: "Pitillal", lat: 20.6667, lon: -105.2167 },
  { id: "nuevo", name: "Nuevo Vallarta", lat: 20.7167, lon: -105.3000 },
  { id: "bucerias", name: "Bucerías", lat: 20.7542, lon: -105.3356 },
  { id: "lacruz", name: "La Cruz", lat: 20.7500, lon: -105.3833 },
];

export function getZoneById(id: string): Zone | undefined {
  return zones.find(z => z.id === id);
}
