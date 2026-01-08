'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { zones, Zone } from '@/lib/zones';

const Map = dynamic(() => import('./Map'), { ssr: false });

interface WeatherData {
  [zoneId: string]: {
    probability: number;
    temp: number;
    wind: number;
  };
}

function getStatusText(prob: number): string {
  if (prob <= 20) return 'Seco';
  if (prob <= 50) return 'Posible lluvia';
  if (prob <= 80) return 'Probable lluvia';
  return 'Lluvia inminente';
}

function getStatusColor(prob: number): string {
  if (prob <= 20) return 'bg-green-500';
  if (prob <= 50) return 'bg-yellow-500';
  if (prob <= 80) return 'bg-orange-500';
  return 'bg-red-500';
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData>({});
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeather = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/weather');
      const data = await res.json();
      setWeatherData(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const closeCard = () => {
    setSelectedZone(null);
  };

  const zoneData = selectedZone ? weatherData[selectedZone.id] : null;

  return (
    <main className="h-screen w-screen relative overflow-hidden bg-slate-900">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] bg-slate-900/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌧️</span>
          <h1 className="text-white font-bold text-lg">Clima PV</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-slate-400 text-xs">
              {lastUpdate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={fetchWeather}
            disabled={refreshing}
            className={`p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition ${refreshing ? 'animate-spin' : ''}`}
          >
            ⟳
          </button>
        </div>
      </header>

      {/* Map */}
      <div className="h-full w-full pt-14">
        {loading ? (
          <div className="h-full flex items-center justify-center text-white">
            Cargando mapa...
          </div>
        ) : (
          <Map weatherData={weatherData} onZoneClick={handleZoneClick} selectedZone={selectedZone} />
        )}
      </div>

      {/* Zone Card */}
      {selectedZone && zoneData && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] animate-slide-up">
          <div className="bg-slate-800 rounded-t-3xl p-6 mx-2 mb-0 shadow-2xl border-t border-slate-600">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-white text-xl font-bold">{selectedZone.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(zoneData.probability)}`}></span>
                  <span className="text-slate-300 text-sm">{getStatusText(zoneData.probability)}</span>
                </div>
              </div>
              <button onClick={closeCard} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700 rounded-xl p-3 text-center">
                <span className="text-3xl">🌧️</span>
                <p className="text-blue-400 text-2xl font-bold mt-1">{zoneData.probability}%</p>
                <p className="text-slate-400 text-xs">Probabilidad</p>
              </div>
              <div className="bg-slate-700 rounded-xl p-3 text-center">
                <span className="text-3xl">🌡️</span>
                <p className="text-orange-400 text-2xl font-bold mt-1">{zoneData.temp}°</p>
                <p className="text-slate-400 text-xs">Temperatura</p>
              </div>
              <div className="bg-slate-700 rounded-xl p-3 text-center">
                <span className="text-3xl">💨</span>
                <p className="text-cyan-400 text-2xl font-bold mt-1">{zoneData.wind}</p>
                <p className="text-slate-400 text-xs">Viento km/h</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[999] bg-slate-800/95 backdrop-blur-sm rounded-lg p-2 flex gap-2 border border-slate-700">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-slate-300 text-xs">0-20%</span></div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span><span className="text-slate-300 text-xs">21-50%</span></div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span><span className="text-slate-300 text-xs">51-80%</span></div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-slate-300 text-xs">81%+</span></div>
      </div>
    </main>
  );
}
