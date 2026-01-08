'use client';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { zones, Zone } from '@/lib/zones';
import 'leaflet/dist/leaflet.css';

interface WeatherData {
  [zoneId: string]: {
    probability: number;
    temp: number;
    wind: number;
  };
}

interface MapProps {
  weatherData: WeatherData;
  onZoneClick: (zone: Zone) => void;
  selectedZone: Zone | null;
}

function getColor(prob: number): string {
  if (prob <= 20) return '#22c55e';
  if (prob <= 50) return '#eab308';
  if (prob <= 80) return '#f97316';
  return '#ef4444';
}

function ZoneMarkers({ weatherData, onZoneClick, selectedZone }: MapProps) {
  const map = useMap();
  
  return (
    <>
      {zones.map((zone) => {
        const data = weatherData[zone.id] || { probability: 0, temp: 0, wind: 0 };
        const isSelected = selectedZone?.id === zone.id;
        
        return (
          <CircleMarker
            key={zone.id}
            center={[zone.lat, zone.lon]}
            radius={isSelected ? 20 : 16}
            pathOptions={{
              fillColor: getColor(data.probability),
              fillOpacity: 0.9,
              color: '#ffffff',
              weight: isSelected ? 4 : 2,
            }}
            eventHandlers={{
              click: () => {
                onZoneClick(zone);
                map.flyTo([zone.lat, zone.lon], 13, { duration: 0.5 });
              },
            }}
          >
            <Popup>
              <strong>{zone.name}</strong><br />
              🌧️ {data.probability}% probabilidad
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default function Map({ weatherData, onZoneClick, selectedZone }: MapProps) {
  const center: [number, number] = [20.7, -105.3];
  
  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
      />
      <ZoneMarkers
        weatherData={weatherData}
        onZoneClick={onZoneClick}
        selectedZone={selectedZone}
      />
    </MapContainer>
  );
}
