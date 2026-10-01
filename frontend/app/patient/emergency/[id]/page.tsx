"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Ambulance,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Hospital,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

import api from "@/lib/api";
import LiveMap from "@/app/components/LiveMap";

interface HospitalData {
  id?: string;
  name?: string;
  city?: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
}

interface AmbulanceData {
  id?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;

  latitude?: number | string;
  longitude?: number | string;

  currentLatitude?: number | string;
  currentLongitude?: number | string;

  currentLat?: number | string;
  currentLng?: number | string;

  lat?: number | string;
  lng?: number | string;

  currentLocation?: {
    latitude?: number | string;
    longitude?: number | string;
    lat?: number | string;
    lng?: number | string;
  };

  location?: {
    latitude?: number | string;
    longitude?: number | string;
    lat?: number | string;
    lng?: number | string;
  };

  currentPosition?: {
    latitude?: number | string;
    longitude?: number | string;
    lat?: number | string;
    lng?: number | string;
  };

  currentEta?: number | string | null;
  status?: string;
}

interface StatusHistory {
  id?: string;
  status: string;
  note?: string;
  createdAt?: string;
}

interface EmergencyData {
  id: string;

  severity?: string;
  description?: string;
  requiredDepartment?: string;
  requiredBloodGroup?: string;

  pickupAddress?: string;
  pickupLatitude?: number | string;
  pickupLongitude?: number | string;

  status?: string;
  destinationEta?: number | string | null;

  createdAt?: string;
  updatedAt?: string;

  Hospital?: HospitalData | null;
  Ambulance?: AmbulanceData | null;

  hospital?: HospitalData | null;
  ambulance?: AmbulanceData | null;

  EmergencyStatusHistory?: StatusHistory[];
  emergencyStatusHistory?: StatusHistory[];

  notifications?: unknown[];
}

interface Location {
  latitude: number;
  longitude: number;
  label: string;
}

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "http://localhost:5000";

/* =========================================================
   HELPERS
========================================================= */

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : null;
  }

  return null;
}

function extractLocation(
  ambulance: any
): {
  latitude: number;
  longitude: number;
} | null {
  if (!ambulance) {
    return null;
  }

  const possiblePairs = [
    [
      ambulance.currentLatitude,
      ambulance.currentLongitude,
    ],

    [
      ambulance.latitude,
      ambulance.longitude,
    ],

    [
      ambulance.currentLat,
      ambulance.currentLng,
    ],

    [
      ambulance.lat,
      ambulance.lng,
    ],

    [
      ambulance.currentLocation?.latitude,
      ambulance.currentLocation?.longitude,
    ],

    [
      ambulance.currentLocation?.lat,
      ambulance.currentLocation?.lng,
    ],

    [
      ambulance.location?.latitude,
      ambulance.location?.longitude,
    ],

    [
      ambulance.location?.lat,
      ambulance.location?.lng,
    ],

    [
      ambulance.currentPosition?.latitude,
      ambulance.currentPosition?.longitude,
    ],

    [
      ambulance.currentPosition?.lat,
      ambulance.currentPosition?.lng,
    ],
  ];

  for (const [latValue, lngValue] of possiblePairs) {
    const latitude = toNumber(latValue);
    const longitude = toNumber(lngValue);

    if (
      latitude !== null &&
      longitude !== null &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      return {
        latitude,
        longitude,
      };
    }
  }

  return null;
}

function getResponseData(response: any): any {
  return (
    response?.data?.data ??
    response?.data ??
    null
  );
}

function getHospital(
  emergency: EmergencyData
): HospitalData | null {
  return (
    emergency.Hospital ||
    emergency.hospital ||
    null
  );
}

function getAmbulance(
  emergency: EmergencyData
): AmbulanceData | null {
  return (
    emergency.Ambulance ||
    emergency.ambulance ||
    null
  );
}

function getHistory(
  emergency: EmergencyData
): StatusHistory[] {
  return (
    emergency.EmergencyStatusHistory ||
    emergency.emergencyStatusHistory ||
    []
  );
}

function formatStatus(status?: string) {
  if (!status) {
    return "Unknown";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function statusClass(status?: string) {
  switch (status) {
    case "COMPLETED":
    case "ARRIVED":
    case "ADMITTED":
      return "bg-green-100 text-green-700";

    case "EN_ROUTE":
    case "HOSPITAL_NOTIFIED":
      return "bg-blue-100 text-blue-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function EmergencyTrackingPage() {
  const params = useParams();
  const router = useRouter();

  const emergencyId = String(
    params?.id || ""
  );

  const [emergency, setEmergency] =
    useState<EmergencyData | null>(null);

  const [ambulanceLocation, setAmbulanceLocation] =
    useState<Location | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [socketConnected, setSocketConnected] =
    useState(false);

  /* =========================================================
     LOAD EMERGENCY
  ========================================================= */

  const loadEmergency = async () => {
    if (!emergencyId) {
      return;
    }

    try {
      setError("");

      const response = await api.get(
        `/emergencies/${emergencyId}`
      );

      const data =
        getResponseData(response);

      console.log(
        "========== MEDIROUTE EMERGENCY =========="
      );

      console.log(
        "Full emergency response:",
        response.data
      );

      console.log(
        "Emergency data:",
        data
      );

      if (!data) {
        throw new Error(
          "Emergency data was not returned."
        );
      }

      setEmergency(data);

      /* -----------------------------------------
         Get ambulance from emergency
      ----------------------------------------- */

      let ambulanceData =
        getAmbulance(data);

      console.log(
        "Ambulance from emergency:",
        ambulanceData
      );

      let location =
        extractLocation(
          ambulanceData
        );

      /* -----------------------------------------
         If location missing,
         fetch ambulance directly
      ----------------------------------------- */

      if (
        !location &&
        ambulanceData?.id
      ) {
        try {
          console.log(
            "Fetching ambulance:",
            ambulanceData.id
          );

          const ambulanceResponse =
            await api.get(
              `/ambulances/${ambulanceData.id}`
            );

          const directAmbulance =
            getResponseData(
              ambulanceResponse
            );

          console.log(
            "Direct ambulance response:",
            directAmbulance
          );

          location =
            extractLocation(
              directAmbulance
            );

          if (directAmbulance) {
            ambulanceData =
              directAmbulance;
          }
        } catch (ambulanceError) {
          console.warn(
            "Direct ambulance fetch failed:",
            ambulanceError
          );
        }
      }

      /* -----------------------------------------
         Real location found
      ----------------------------------------- */

      if (location) {
        console.log(
          "REAL ambulance location:",
          location
        );

        setAmbulanceLocation({
          latitude:
            location.latitude,

          longitude:
            location.longitude,

          label:
            ambulanceData?.vehicleNumber ||
            "Ambulance",
        });
      } else {
        /* -----------------------------------------
           Demo fallback
        ----------------------------------------- */

        console.warn(
          "No ambulance location found."
        );

        console.warn(
          "Using demo ambulance coordinates."
        );

        setAmbulanceLocation({
          latitude: 11.0200,
          longitude: 76.9690,
          label:
            ambulanceData?.vehicleNumber ||
            "TN38-MR-001",
        });
      }
    } catch (err: any) {
      console.error(
        "Emergency loading failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load emergency."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadEmergency();
  }, [emergencyId]);

  /* =========================================================
     SOCKET.IO
  ========================================================= */

  useEffect(() => {
    if (!emergencyId) {
      return;
    }

    const socket: Socket = io(
      SOCKET_URL,
      {
        transports: [
          "websocket",
          "polling",
        ],
      }
    );

    socket.on("connect", () => {
      console.log(
        "MediRoute Socket connected:",
        socket.id
      );

      setSocketConnected(true);

      socket.emit(
        "join-emergency",
        emergencyId
      );
    });

    socket.on("disconnect", () => {
      console.log(
        "MediRoute Socket disconnected"
      );

      setSocketConnected(false);
    });

    /* -----------------------------------------
       Ambulance location update
    ----------------------------------------- */

    socket.on(
      "ambulance-location-updated",
      (data: any) => {
        console.log(
          "LIVE ambulance location:",
          data
        );

        const location =
          extractLocation(data);

        if (location) {
          setAmbulanceLocation({
            latitude:
              location.latitude,

            longitude:
              location.longitude,

            label:
              data?.vehicleNumber ||
              "Ambulance",
          });
        }
      }
    );

    /* -----------------------------------------
       Emergency update
    ----------------------------------------- */

    socket.on(
      "emergency-updated",
      (data: any) => {
        console.log(
          "LIVE emergency update:",
          data
        );

        const updated =
          data?.data || data;

        if (
          updated &&
          typeof updated === "object"
        ) {
          setEmergency(
            (previous) => ({
              ...(previous || {}),
              ...updated,
            })
          );

          const ambulance =
            getAmbulance(updated);

          const location =
            extractLocation(
              ambulance
            );

          if (location) {
            setAmbulanceLocation({
              latitude:
                location.latitude,

              longitude:
                location.longitude,

              label:
                ambulance?.vehicleNumber ||
                "Ambulance",
            });
          }
        }
      }
    );

    /* -----------------------------------------
       Status update
    ----------------------------------------- */

    socket.on(
      "emergency-status-updated",
      (data: any) => {
        console.log(
          "LIVE emergency status:",
          data
        );

        const newStatus =
          data?.status ||
          data?.data?.status;

        if (newStatus) {
          setEmergency(
            (previous) =>
              previous
                ? {
                    ...previous,
                    status:
                      newStatus,
                  }
                : previous
          );
        }
      }
    );

    return () => {
      socket.emit(
        "leave-emergency",
        emergencyId
      );

      socket.disconnect();
    };
  }, [emergencyId]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadEmergency();
  };

  /* =========================================================
     HOSPITAL
  ========================================================= */

  const hospital = useMemo(
    () =>
      emergency
        ? getHospital(emergency)
        : null,
    [emergency]
  );

  /* =========================================================
     AMBULANCE
  ========================================================= */

  const ambulance = useMemo(
    () =>
      emergency
        ? getAmbulance(emergency)
        : null,
    [emergency]
  );

  /* =========================================================
     PICKUP LOCATION
  ========================================================= */

  const pickupLocation =
    useMemo<Location>(() => {
      /*
       * If emergency has valid coordinates,
       * use them.
       */

      if (emergency) {
        const latitude =
          toNumber(
            emergency.pickupLatitude
          );

        const longitude =
          toNumber(
            emergency.pickupLongitude
          );

        if (
          latitude !== null &&
          longitude !== null
        ) {
          return {
            latitude,
            longitude,
            label:
              emergency.pickupAddress ||
              "Pickup Location",
          };
        }
      }

      /*
       * Demo fallback
       */

      return {
        latitude: 11.0183,
        longitude: 76.9674,
        label:
          emergency?.pickupAddress ||
          "Gandhipuram, Coimbatore",
      };
    }, [emergency]);

  /* =========================================================
     HOSPITAL LOCATION
  ========================================================= */

  const hospitalLocation =
    useMemo<Location | undefined>(() => {
      if (!hospital) {
        return undefined;
      }

      const latitude =
        toNumber(
          hospital.latitude
        );

      const longitude =
        toNumber(
          hospital.longitude
        );

      if (
        latitude === null ||
        longitude === null
      ) {
        return undefined;
      }

      return {
        latitude,
        longitude,
        label:
          hospital.name ||
          "Hospital",
      };
    }, [hospital]);

  /* =========================================================
     MAP AMBULANCE LOCATION
  ========================================================= */

  const mapAmbulanceLocation =
    useMemo<Location>(() => {
      /*
       * First use Socket location.
       */

      if (
        ambulanceLocation &&
        Number.isFinite(
          ambulanceLocation.latitude
        ) &&
        Number.isFinite(
          ambulanceLocation.longitude
        )
      ) {
        return ambulanceLocation;
      }

      /*
       * Then try emergency ambulance.
       */

      const extracted =
        extractLocation(
          ambulance
        );

      if (extracted) {
        return {
          latitude:
            extracted.latitude,

          longitude:
            extracted.longitude,

          label:
            ambulance?.vehicleNumber ||
            "Ambulance",
        };
      }

      /*
       * Final demo fallback.
       */

      return {
        latitude: 11.0200,
        longitude: 76.9690,
        label:
          ambulance?.vehicleNumber ||
          "TN38-MR-001",
      };
    }, [
      ambulanceLocation,
      ambulance,
    ]);

  /* =========================================================
     HISTORY
  ========================================================= */

  const history = emergency
    ? getHistory(emergency)
    : [];

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />

              <h2 className="text-lg font-semibold text-slate-800">
                Loading emergency details...
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Connecting to MediRoute.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !emergency) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-5xl">
              ⚠️
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              Emergency not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "Unable to load this emergency."}
            </p>

            <button
              onClick={() => router.back()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.back()}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Emergency Tracking
              </h1>

              <p className="text-xs text-slate-500">
                ID: {emergency.id}
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            {/* SOCKET STATUS */}

            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                socketConnected
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  socketConnected
                    ? "bg-green-500"
                    : "bg-slate-400"
                }`}
              />

              {socketConnected
                ? "Live Updates"
                : "Connecting..."}
            </div>

            {/* REFRESH */}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">

        {/* STATUS */}

        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-blue-600 p-3 text-white">
                <Siren className="h-6 w-6" />
              </div>

              <div>

                <p className="text-sm text-blue-700">
                  Current Emergency Status
                </p>

                <h2 className="text-2xl font-bold text-slate-900">
                  {formatStatus(
                    emergency.status
                  )}
                </h2>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${statusClass(
                  emergency.status
                )}`}
              >
                {formatStatus(
                  emergency.status
                )}
              </span>

              {emergency.severity && (
                <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
                  {emergency.severity}
                </span>
              )}

            </div>

          </div>
        </div>

        {/* MAIN GRID */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* MAP */}

          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm lg:col-span-2">

            <div className="border-b px-5 py-4">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="font-bold text-slate-900">
                    Live Ambulance Tracking
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Ambulance location updates automatically.
                  </p>

                </div>

                <div className="flex items-center gap-2 text-xs text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Live
                </div>

              </div>

            </div>

            <div className="h-[520px]">

              <LiveMap
                pickup={pickupLocation}
                ambulance={
                  mapAmbulanceLocation
                }
                hospital={
                  hospitalLocation
                }
              />

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-6">

            {/* EMERGENCY */}

            <div className="rounded-2xl border bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-3">

                <div className="rounded-lg bg-red-100 p-2">
                  <Siren className="h-5 w-5 text-red-600" />
                </div>

                <h2 className="font-bold text-slate-900">
                  Emergency Details
                </h2>

              </div>

              <div className="space-y-4">

                <div>
                  <p className="text-xs text-slate-500">
                    Pickup Location
                  </p>

                  <div className="mt-1 flex gap-2">

                    <MapPin className="mt-0.5 h-4 w-4 text-red-500" />

                    <p className="text-sm font-medium text-slate-800">
                      {emergency.pickupAddress ||
                        "Gandhipuram, Coimbatore"}
                    </p>

                  </div>
                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Department
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {emergency.requiredDepartment ||
                      "Emergency"}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Blood Group
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {emergency.requiredBloodGroup ||
                      "Not specified"}
                  </p>

                </div>

                {emergency.description && (
                  <div>

                    <p className="text-xs text-slate-500">
                      Description
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {emergency.description}
                    </p>

                  </div>
                )}

              </div>
            </div>

            {/* HOSPITAL */}

            <div className="rounded-2xl border bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-3">

                <div className="rounded-lg bg-green-100 p-2">
                  <Hospital className="h-5 w-5 text-green-600" />
                </div>

                <h2 className="font-bold text-slate-900">
                  Selected Hospital
                </h2>

              </div>

              {hospital ? (
                <div>

                  <h3 className="font-semibold text-slate-900">
                    {hospital.name ||
                      "Hospital"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {hospital.address ||
                      hospital.city ||
                      "Hospital location"}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Hospital selected
                  </div>

                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Hospital has not been selected yet.
                </p>
              )}

            </div>

            {/* AMBULANCE */}

            <div className="rounded-2xl border bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-3">

                <div className="rounded-lg bg-blue-100 p-2">
                  <Ambulance className="h-5 w-5 text-blue-600" />
                </div>

                <h2 className="font-bold text-slate-900">
                  Ambulance
                </h2>

              </div>

              {ambulance ? (
                <div className="space-y-3">

                  <div>
                    <p className="text-xs text-slate-500">
                      Vehicle
                    </p>

                    <p className="font-semibold text-slate-900">
                      {ambulance.vehicleNumber ||
                        "TN38-MR-001"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Driver
                    </p>

                    <p className="text-sm text-slate-800">
                      {ambulance.driverName ||
                        "Demo Ambulance Driver"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">

                    <div>

                      <p className="text-xs text-blue-600">
                        Status
                      </p>

                      <p className="font-semibold text-blue-800">
                        {formatStatus(
                          ambulance.status
                        )}
                      </p>

                    </div>

                    <Ambulance className="h-6 w-6 text-blue-600" />

                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">

                    <div>

                      <p className="text-xs text-slate-500">
                        ETA
                      </p>

                      <p className="font-semibold text-slate-800">
                        {ambulance.currentEta ??
                          emergency.destinationEta ??
                          8}{" "}
                        min
                      </p>

                    </div>

                    <Clock3 className="h-5 w-5 text-slate-500" />

                  </div>

                  {/* LOCATION */}

                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">

                    <p className="text-xs font-medium text-blue-600">
                      Current Location
                    </p>

                    <p className="mt-1 font-mono text-xs text-slate-700">
                      Latitude:{" "}
                      {mapAmbulanceLocation.latitude.toFixed(
                        6
                      )}
                    </p>

                    <p className="font-mono text-xs text-slate-700">
                      Longitude:{" "}
                      {mapAmbulanceLocation.longitude.toFixed(
                        6
                      )}
                    </p>

                  </div>

                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                  Ambulance has not been assigned yet.
                </div>
              )}

            </div>

          </div>
        </div>

        {/* TIMELINE */}

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-purple-100 p-2">
              <Clock3 className="h-5 w-5 text-purple-600" />
            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                Emergency Timeline
              </h2>

              <p className="text-xs text-slate-500">
                Real-time coordination progress
              </p>

            </div>

          </div>

          {history.length > 0 ? (
            <div className="space-y-5">

              {history.map(
                (item, index) => (
                  <div
                    key={
                      item.id ||
                      `${item.status}-${index}`
                    }
                    className="flex gap-4"
                  >

                    <div className="flex flex-col items-center">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          index ===
                          history.length - 1
                            ? "bg-blue-600 text-white"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      {index <
                        history.length - 1 && (
                        <div className="mt-1 h-10 w-px bg-slate-200" />
                      )}

                    </div>

                    <div className="pt-1">

                      <p className="font-semibold text-slate-900">
                        {formatStatus(
                          item.status
                        )}
                      </p>

                      {item.note && (
                        <p className="mt-1 text-sm text-slate-500">
                          {item.note}
                        </p>
                      )}

                      {item.createdAt && (
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </p>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No timeline events available.
            </p>
          )}

        </div>

        {/* LOCATION INFO */}

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex items-start gap-3">

            <MapPin className="mt-0.5 h-5 w-5 text-blue-600" />

            <div>

              <h3 className="font-semibold text-slate-900">
                Ambulance Location
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                The ambulance position is being
                monitored by the MediRoute
                demonstration tracking system.
              </p>

              <div className="mt-3 rounded-lg bg-white p-3">

                <p className="font-mono text-xs text-blue-700">
                  Pickup:{" "}
                  {pickupLocation.latitude.toFixed(
                    6
                  )}
                  ,{" "}
                  {pickupLocation.longitude.toFixed(
                    6
                  )}
                </p>

                <p className="mt-1 font-mono text-xs text-blue-700">
                  Ambulance:{" "}
                  {mapAmbulanceLocation.latitude.toFixed(
                    6
                  )}
                  ,{" "}
                  {mapAmbulanceLocation.longitude.toFixed(
                    6
                  )}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* DISCLAIMER */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex gap-3">

            <ShieldCheck className="h-5 w-5 shrink-0 text-slate-500" />

            <p className="text-xs leading-5 text-slate-500">
              MediRoute is a demonstration platform
              for emergency coordination and
              healthcare resource availability. It
              does not provide medical diagnosis or
              treatment advice. In a real emergency,
              contact local emergency services and
              qualified healthcare professionals.
            </p>

          </div>

        </div>

      </div>
    </main>
  );
}