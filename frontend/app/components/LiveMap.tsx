"use client";

import {
  MapContainer,
  CircleMarker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

interface Location {
  latitude: number;
  longitude: number;
  label: string;
}

interface LiveMapProps {
  pickup: Location;
  ambulance: Location;
  hospital?: Location;
}

function MapUpdater({
  ambulance,
}: {
  ambulance: Location;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      typeof ambulance.latitude === "number" &&
      typeof ambulance.longitude === "number"
    ) {
      map.setView(
        [ambulance.latitude, ambulance.longitude],
        map.getZoom(),
        {
          animate: true,
        }
      );
    }
  }, [ambulance.latitude, ambulance.longitude, map]);

  return null;
}

export default function LiveMap({
  pickup,
  ambulance,
  hospital,
}: LiveMapProps) {
  // Validate ambulance location
  const ambulanceValid =
    typeof ambulance?.latitude === "number" &&
    typeof ambulance?.longitude === "number" &&
    Number.isFinite(ambulance.latitude) &&
    Number.isFinite(ambulance.longitude);

  // Validate pickup location
  const pickupValid =
    typeof pickup?.latitude === "number" &&
    typeof pickup?.longitude === "number" &&
    Number.isFinite(pickup.latitude) &&
    Number.isFinite(pickup.longitude);

  // Validate hospital location
  const hospitalValid =
    hospital &&
    typeof hospital.latitude === "number" &&
    typeof hospital.longitude === "number" &&
    Number.isFinite(hospital.latitude) &&
    Number.isFinite(hospital.longitude);

  // If ambulance location is unavailable,
  // do not allow Leaflet to crash.
  if (!ambulanceValid) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl bg-slate-100">
        <div className="text-center">
          <div className="mb-3 text-4xl">🚑</div>

          <h3 className="font-semibold text-slate-800">
            Ambulance location unavailable
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Waiting for the latest ambulance location...
          </p>
        </div>
      </div>
    );
  }

  const routePoints: [number, number][] = [];

  if (pickupValid) {
    routePoints.push([
      pickup.latitude,
      pickup.longitude,
    ]);
  }

  routePoints.push([
    ambulance.latitude,
    ambulance.longitude,
  ]);

  if (hospitalValid) {
    routePoints.push([
      hospital.latitude,
      hospital.longitude,
    ]);
  }

  return (
    <MapContainer
      center={[
        ambulance.latitude,
        ambulance.longitude,
      ]}
      zoom={14}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater ambulance={ambulance} />

      {/* Pickup */}
      {pickupValid && (
        <CircleMarker
          center={[
            pickup.latitude,
            pickup.longitude,
          ]}
          radius={10}
          pathOptions={{
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.8,
          }}
        >
          <Popup>
            <strong>Pickup Location</strong>
            <br />
            {pickup.label}
          </Popup>
        </CircleMarker>
      )}

      {/* Ambulance */}
      <CircleMarker
        center={[
          ambulance.latitude,
          ambulance.longitude,
        ]}
        radius={12}
        pathOptions={{
          color: "#2563eb",
          fillColor: "#2563eb",
          fillOpacity: 0.95,
        }}
      >
        <Popup>
          <strong>🚑 Ambulance</strong>
          <br />
          {ambulance.label}
        </Popup>
      </CircleMarker>

      {/* Hospital */}
      {hospitalValid && (
        <CircleMarker
          center={[
            hospital.latitude,
            hospital.longitude,
          ]}
          radius={11}
          pathOptions={{
            color: "#16a34a",
            fillColor: "#16a34a",
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <strong>🏥 Hospital</strong>
            <br />
            {hospital.label}
          </Popup>
        </CircleMarker>
      )}

      {/* Route */}
      {routePoints.length >= 2 && (
        <Polyline
          positions={routePoints}
          pathOptions={{
            color: "#38bdf8",
            weight: 4,
            opacity: 0.7,
            dashArray: "8 8",
          }}
        />
      )}
    </MapContainer>
  );
}