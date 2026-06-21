import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const loc = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };

      setPosition(loc);
      onSelect(loc);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

function ChangeMapView({ coords }) {
  const map = useMap();

  if (coords) {
    map.setView([coords.lat, coords.lng], 14);
  }

  return null;
}

function OSMLocationPicker({ onLocationSelect, selectedMapLocation }) {
  return (
    <MapContainer
      center={[12.8698, 74.8436]}
      zoom={10}
      style={{ height: "300px", width: "100%", marginTop: "10px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker onSelect={onLocationSelect} />

      {/* ✅ NOW THIS IS CORRECT */}
      {selectedMapLocation && (
        <ChangeMapView coords={selectedMapLocation} />
      )}
    </MapContainer>
  );
}

export default OSMLocationPicker;