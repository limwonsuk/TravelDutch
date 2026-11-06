'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ItineraryItem } from '@/types';

interface LeafletMapProps {
  items: ItineraryItem[];
  selectedItem: ItineraryItem | null;
  onSelectItem: (item: ItineraryItem) => void;
}

// Map Controller for smooth flyTo and fitBounds
function MapController({
  items,
  selectedItem,
}: {
  items: ItineraryItem[];
  selectedItem: ItineraryItem | null;
}) {
  const map = useMap();

  // If a specific item is selected, smoothly flyTo it
  useEffect(() => {
    if (selectedItem) {
      map.flyTo([selectedItem.lat, selectedItem.lng], 15, {
        duration: 1.2,
      });
    }
  }, [selectedItem, map]);

  // When day items change, fit bounds to show all markers
  useEffect(() => {
    if (items.length > 0 && !selectedItem) {
      const bounds = L.latLngBounds(items.map((i) => [i.lat, i.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [items, map]);

  return null;
}

// Helper to create custom divIcon with badge number
function createCustomMarkerIcon(orderIndex: number, isSelected: boolean) {
  const bgColor = isSelected ? '#ef4444' : '#4f46e5';
  const scale = isSelected ? 'scale(1.2)' : 'scale(1.0)';
  const zIndex = isSelected ? 1000 : 100;

  return L.divIcon({
    className: `custom-marker-wrapper ${isSelected ? 'active' : ''}`,
    html: `
      <div style="
        position: relative;
        width: 34px;
        height: 34px;
        background: ${bgColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg) ${scale};
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s ease;
        z-index: ${zIndex};
      ">
        <span style="
          transform: rotate(45deg);
          color: #ffffff;
          font-weight: 800;
          font-size: 13px;
          line-height: 1;
        ">${orderIndex}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

export default function LeafletMap({ items, selectedItem, onSelectItem }: LeafletMapProps) {
  // Sort items by orderIndex for path rendering
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [items]);

  const polylineCoords = useMemo(() => {
    return sortedItems.map((item) => [item.lat, item.lng] as [number, number]);
  }, [sortedItems]);

  const defaultCenter: [number, number] = sortedItems.length > 0
    ? [sortedItems[0].lat, sortedItems[0].lng]
    : [35.1587, 129.1604]; // Busan Haeundae

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full rounded-2xl z-0"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController items={sortedItems} selectedItem={selectedItem} />

        {/* Travel path polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#4f46e5',
              weight: 4,
              dashArray: '6, 8',
              opacity: 0.8,
            }}
          />
        )}

        {/* Place Markers */}
        {sortedItems.map((item) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={createCustomMarkerIcon(item.orderIndex, isSelected)}
              eventHandlers={{
                click: () => onSelectItem(item),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[180px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-indigo-100 text-indigo-700">
                      {item.category} • {item.orderIndex}번
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{item.time}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  {item.memo && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.memo}</p>
                  )}
                  {item.estimatedCost > 0 && (
                    <div className="mt-2 text-xs font-semibold text-emerald-600 border-t border-slate-100 pt-1">
                      예상 비용: {item.estimatedCost.toLocaleString()}원
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
