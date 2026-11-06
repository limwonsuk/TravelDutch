'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

// Map Click Listener Component
function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const newLat = parseFloat(e.latlng.lat.toFixed(5));
      const newLng = parseFloat(e.latlng.lng.toFixed(5));
      onChange(newLat, newLng);
    },
  });
  return null;
}

// Center updater when lat/lng change from external source (like presets or inputs)
function MapCenterUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 14, { duration: 0.8 });
    }
  }, [lat, lng, map]);
  return null;
}

// Custom Picker Pin Icon
const pickerIcon = L.divIcon({
  className: 'custom-picker-pin-wrapper',
  html: `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      background: #ef4444;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: bounce 0.5s ease;
    ">
      <span style="
        transform: rotate(45deg);
        color: #ffffff;
        font-size: 14px;
        line-height: 1;
      ">📍</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function LocationPickerMap({ lat, lng, onChange }: LocationPickerMapProps) {
  const safeLat = !isNaN(lat) && lat !== 0 ? lat : 35.1587;
  const safeLng = !isNaN(lng) && lng !== 0 ? lng : 129.1604;

  return (
    <div className="relative w-full h-[220px] rounded-xl overflow-hidden border border-slate-200 shadow-inner group">
      <MapContainer
        center={[safeLat, safeLng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0 cursor-crosshair"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        <MapCenterUpdater lat={safeLat} lng={safeLng} />
        <Marker position={[safeLat, safeLng]} icon={pickerIcon} />
      </MapContainer>

      {/* Guide Banner Overlay */}
      <div className="absolute top-2 left-2 right-2 z-[400] pointer-events-none flex justify-center">
        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          지도를 클릭하면 해당 위치의 위도/경도가 자동 입력됩니다
        </span>
      </div>

      {/* Crosshair target mark in bottom corner */}
      <div className="absolute bottom-2 right-2 z-[400] pointer-events-none bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-600 border border-slate-200 shadow-xs">
        {safeLat.toFixed(4)}, {safeLng.toFixed(4)}
      </div>
    </div>
  );
}
