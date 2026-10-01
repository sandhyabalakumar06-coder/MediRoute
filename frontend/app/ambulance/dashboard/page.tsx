"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Ambulance,
  Clock,
  MapPin,
  Navigation,
  RefreshCw,
  Hospital,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { io } from "socket.io-client";
import api from "@/lib/api";

interface AmbulanceData {
  id: string;
  vehicleNumber: string;
  driverName: string | null;
  phone: string | null;
  status: string;
  latitude: number | null;
  longitude: number | null;
  currentEta: number | null;
  lastUpdated: string;
}

interface EmergencyData {
  id: string;
  severity: string;
  status: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationEta: number | null;
  requiredDepartment: string | null;

  Hospital: {
    id: string;
    name: string;
    city: string;
    address: string;
  } | null;

  Ambulance: {
    id: string;
    vehicleNumber: string;
    driverName: string | null;
    status: string;
    currentEta: number | null;
  } | null;
}

interface OperatorUser {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
}

interface OperatorData {
  id: string;
  licenseNumber: string | null;

  // Some API responses may return User
  User?: OperatorUser;

  // Some responses may return user
  user?: OperatorUser;

  // Fallback fields
  name?: string;
  email?: string;
  phone?: string | null;
}

interface DashboardData {
  operator: OperatorData;
  ambulances: AmbulanceData[];
  activeEmergencies: EmergencyData[];
}

export default function AmbulanceDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingLocation, setUpdatingLocation] =
    useState<string | null>(null);

  const [startingJourney, setStartingJourney] =
    useState<string | null>(null);

  const [arriving, setArriving] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  // ======================================================
  // LOAD DASHBOARD
  // ======================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/dashboard/ambulance"
        );

      console.log(
        "Ambulance dashboard response:",
        response.data
      );

      setDashboard(
        response.data.data
      );
    } catch (err: any) {
      console.error(
        "Ambulance dashboard error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load ambulance dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // ======================================================
  // SOCKET.IO
  // ======================================================

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
        "http://localhost:5000"
    );

    socket.on(
      "connect",
      () => {
        console.log(
          "Connected to MediRoute Socket.IO"
        );
      }
    );

    socket.on(
      "ambulance-location-updated",
      (data) => {
        console.log(
          "Ambulance location updated:",
          data
        );

        setDashboard(
          (previous) => {
            if (!previous) {
              return previous;
            }

            const updatedAmbulances =
              previous.ambulances.map(
                (ambulance) => {
                  if (
                    ambulance.id ===
                    data.ambulanceId
                  ) {
                    return {
                      ...ambulance,
                      latitude:
                        data.latitude,
                      longitude:
                        data.longitude,
                      currentEta:
                        data.eta ??
                        ambulance.currentEta,
                      lastUpdated:
                        data.updatedAt ||
                        new Date().toISOString(),
                    };
                  }

                  return ambulance;
                }
              );

            return {
              ...previous,
              ambulances:
                updatedAmbulances,
            };
          }
        );
      }
    );

    socket.on(
      "emergency-status-updated",
      (data) => {
        console.log(
          "Emergency status updated:",
          data
        );

        loadDashboard();
      }
    );

    socket.on(
      "emergency-updated",
      (data) => {
        console.log(
          "Emergency updated:",
          data
        );

        loadDashboard();
      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "Disconnected from Socket.IO"
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  // ======================================================
  // UPDATE LOCATION
  // ======================================================

  const updateLocation = (
    ambulanceId: string
  ) => {
    if (
      !navigator.geolocation
    ) {
      setMessage(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    setUpdatingLocation(
      ambulanceId
    );

    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          await api.patch(
            `/ambulances/location/${ambulanceId}`,
            {
              latitude,
              longitude,
            }
          );

          setMessage(
            "Ambulance location updated successfully."
          );

          await loadDashboard();
        } catch (err: any) {
          console.error(
            "Location update error:",
            err
          );

          setMessage(
            err?.response?.data?.message ||
              "Failed to update ambulance location."
          );
        } finally {
          setUpdatingLocation(
            null
          );
        }
      },
      (geoError) => {
        console.error(
          "Geolocation error:",
          geoError
        );

        setMessage(
          "Unable to get your current location."
        );

        setUpdatingLocation(
          null
        );
      }
    );
  };

  // ======================================================
  // START JOURNEY
  // ======================================================

  const startJourney = async (
    emergencyId: string
  ) => {
    try {
      setStartingJourney(
        emergencyId
      );

      setMessage("");

      await api.patch(
        `/ambulances/start/${emergencyId}`,
        {}
      );

      setMessage(
        "Ambulance journey started successfully."
      );

      await loadDashboard();
    } catch (err: any) {
      console.error(
        "Start journey error:",
        err
      );

      setMessage(
        err?.response?.data?.message ||
          "Failed to start ambulance journey."
      );
    } finally {
      setStartingJourney(
        null
      );
    }
  };

  // ======================================================
  // ARRIVED AT HOSPITAL
  // ======================================================

  const markArrived = async (
    emergencyId: string
  ) => {
    try {
      setArriving(
        emergencyId
      );

      setMessage("");

      await api.patch(
        `/ambulances/arrived/${emergencyId}`,
        {}
      );

      setMessage(
        "Ambulance arrival recorded successfully."
      );

      await loadDashboard();
    } catch (err: any) {
      console.error(
        "Arrival update error:",
        err
      );

      setMessage(
        err?.response?.data?.message ||
          "Failed to update arrival status."
      );
    } finally {
      setArriving(null);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <RefreshCw
              className="mx-auto mb-4 animate-spin"
              size={36}
            />

            <p className="text-slate-300">
              Loading ambulance dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle
                className="text-red-400"
                size={28}
              />

              <div>
                <h2 className="text-xl font-bold">
                  Unable to load dashboard
                </h2>

                <p className="mt-1 text-red-300">
                  {error}
                </p>
              </div>
            </div>

            <button
              onClick={loadDashboard}
              className="mt-5 rounded-lg bg-white px-5 py-2 font-semibold text-slate-900 hover:bg-slate-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return null;
  }

  // ======================================================
  // SAFE OPERATOR DATA
  // ======================================================

  const operatorUser =
    dashboard.operator?.User ||
    dashboard.operator?.user;

  const operatorName =
    operatorUser?.name ||
    dashboard.operator?.name ||
    "Ambulance Operator";

  const operatorEmail =
    operatorUser?.email ||
    dashboard.operator?.email ||
    "No email available";

  const operatorPhone =
    operatorUser?.phone ||
    dashboard.operator?.phone ||
    null;

  // ======================================================
  // STATS
  // ======================================================

  const totalAmbulances =
    dashboard.ambulances?.length || 0;

  const activeEmergencies =
    dashboard.activeEmergencies?.length || 0;

  const availableAmbulances =
    dashboard.ambulances?.filter(
      (ambulance) =>
        ambulance.status ===
        "AVAILABLE"
    ).length || 0;

  const enRouteAmbulances =
    dashboard.ambulances?.filter(
      (ambulance) =>
        ambulance.status ===
        "EN_ROUTE"
    ).length || 0;

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-red-500/10 p-2">
                <Ambulance
                  className="text-red-400"
                  size={28}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Ambulance Dashboard
                </h1>

                <p className="text-sm text-slate-400">
                  Welcome,{" "}
                  {operatorName}
                </p>
              </div>

            </div>
          </div>

          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* MESSAGE */}

        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-blue-300">
            {message}
          </div>
        )}

        {/* OPERATOR */}

        <section className="mb-8">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

              <div>

                <p className="text-sm text-slate-400">
                  Ambulance Operator
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {operatorName}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {operatorEmail}
                </p>

                {operatorPhone && (
                  <p className="mt-1 text-sm text-slate-500">
                    Phone:{" "}
                    {operatorPhone}
                  </p>
                )}

                {dashboard.operator
                  ?.licenseNumber && (
                  <p className="mt-2 text-sm text-slate-500">
                    License:{" "}
                    {
                      dashboard.operator
                        .licenseNumber
                    }
                  </p>
                )}

              </div>

              <div className="rounded-xl bg-green-500/10 px-4 py-3">

                <p className="text-sm text-green-400">
                  Live Location Tracking
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Real-time updates enabled
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* STATS */}

        <section className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  My Ambulances
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalAmbulances}
                </p>
              </div>

              <div className="rounded-xl bg-blue-500/10 p-3">
                <Ambulance
                  className="text-blue-400"
                  size={26}
                />
              </div>

            </div>

          </div>

          {/* AVAILABLE */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Available
                </p>

                <p className="mt-2 text-3xl font-bold text-green-400">
                  {availableAmbulances}
                </p>
              </div>

              <div className="rounded-xl bg-green-500/10 p-3">
                <CheckCircle
                  className="text-green-400"
                  size={26}
                />
              </div>

            </div>

          </div>

          {/* EN ROUTE */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  En Route
                </p>

                <p className="mt-2 text-3xl font-bold text-yellow-400">
                  {enRouteAmbulances}
                </p>
              </div>

              <div className="rounded-xl bg-yellow-500/10 p-3">
                <Navigation
                  className="text-yellow-400"
                  size={26}
                />
              </div>

            </div>

          </div>

          {/* ACTIVE EMERGENCIES */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Active Emergencies
                </p>

                <p className="mt-2 text-3xl font-bold text-red-400">
                  {activeEmergencies}
                </p>
              </div>

              <div className="rounded-xl bg-red-500/10 p-3">
                <Activity
                  className="text-red-400"
                  size={26}
                />
              </div>

            </div>

          </div>

        </section>

        {/* MY AMBULANCES */}

        <section className="mb-8">

          <div className="mb-5">

            <h2 className="text-xl font-bold">
              My Ambulances
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Manage ambulance status and live location
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {dashboard.ambulances.map(
              (ambulance) => (
                <div
                  key={ambulance.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-red-500/10 p-3">
                        <Ambulance
                          className="text-red-400"
                          size={24}
                        />
                      </div>

                      <div>

                        <h3 className="font-bold">
                          {
                            ambulance.vehicleNumber
                          }
                        </h3>

                        <p className="text-sm text-slate-400">
                          {
                            ambulance.driverName ||
                            "Driver not assigned"
                          }
                        </p>

                      </div>

                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        ambulance.status ===
                        "AVAILABLE"
                          ? "bg-green-500/10 text-green-400"
                          : ambulance.status ===
                            "EN_ROUTE"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : ambulance.status ===
                            "AT_HOSPITAL"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {
                        ambulance.status
                      }
                    </span>

                  </div>

                  {/* LOCATION */}

                  <div className="mt-6 rounded-xl bg-slate-800/60 p-4">

                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <MapPin
                        size={16}
                        className="text-red-400"
                      />

                      Current Location
                    </div>

                    {ambulance.latitude !==
                      null &&
                    ambulance.longitude !==
                      null ? (
                      <p className="mt-2 text-sm text-slate-400">
                        {
                          ambulance.latitude
                        }
                        ,{" "}
                        {
                          ambulance.longitude
                        }
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        Location unavailable
                      </p>
                    )}

                  </div>

                  {/* ETA */}

                  {ambulance.currentEta !==
                    null && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">

                      <Clock
                        size={16}
                        className="text-yellow-400"
                      />

                      ETA:{" "}
                      <strong>
                        {
                          ambulance.currentEta
                        }{" "}
                        minutes
                      </strong>

                    </div>
                  )}

                  {/* LOCATION BUTTON */}

                  <button
                    onClick={() =>
                      updateLocation(
                        ambulance.id
                      )
                    }
                    disabled={
                      updatingLocation ===
                      ambulance.id
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {updatingLocation ===
                    ambulance.id ? (
                      <>
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />

                        Updating...
                      </>
                    ) : (
                      <>
                        <Navigation
                          size={16}
                        />

                        Update Current Location
                      </>
                    )}

                  </button>

                </div>
              )
            )}

          </div>

        </section>

        {/* ACTIVE EMERGENCIES */}

        <section>

          <div className="mb-5">

            <h2 className="text-xl font-bold">
              Active Emergency Assignments
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Emergency requests currently assigned to ambulances
            </p>

          </div>

          {dashboard.activeEmergencies
            .length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

              <CheckCircle
                className="mx-auto mb-4 text-green-400"
                size={42}
              />

              <h3 className="text-lg font-bold">
                No Active Emergencies
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                There are currently no active emergency assignments.
              </p>

            </div>
          ) : (
            <div className="grid gap-6">

              {dashboard.activeEmergencies.map(
                (emergency) => {

                  const isAssigned =
                    emergency.status ===
                    "AMBULANCE_ASSIGNED";

                  const isEnRoute =
                    emergency.status ===
                    "EN_ROUTE";

                  const isHospitalNotified =
                    emergency.status ===
                    "HOSPITAL_NOTIFIED";

                  return (
                    <div
                      key={emergency.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                    >

                      {/* HEADER */}

                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                        <div>

                          <div className="flex flex-wrap items-center gap-3">

                            <h3 className="text-lg font-bold">
                              Emergency #
                              {emergency.id.slice(
                                0,
                                8
                              )}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                emergency.severity ===
                                "CRITICAL"
                                  ? "bg-red-500/20 text-red-400"
                                  : emergency.severity ===
                                    "HIGH"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : emergency.severity ===
                                    "MEDIUM"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {
                                emergency.severity
                              }
                            </span>

                            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                              {
                                emergency.status
                              }
                            </span>

                          </div>

                        </div>

                        {emergency.destinationEta !==
                          null && (
                          <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 px-4 py-3">

                            <Clock
                              size={18}
                              className="text-yellow-400"
                            />

                            <div>

                              <p className="text-xs text-slate-400">
                                ETA
                              </p>

                              <p className="font-bold text-yellow-400">
                                {
                                  emergency.destinationEta
                                }{" "}
                                min
                              </p>

                            </div>

                          </div>
                        )}

                      </div>

                      {/* DETAILS */}

                      <div className="mt-6 grid gap-4 md:grid-cols-2">

                        <div className="rounded-xl bg-slate-800/60 p-4">

                          <div className="flex items-center gap-2 text-sm font-semibold">

                            <MapPin
                              size={16}
                              className="text-red-400"
                            />

                            Pickup Location

                          </div>

                          <p className="mt-2 text-sm text-slate-300">
                            {
                              emergency.pickupAddress
                            }
                          </p>

                        </div>

                        <div className="rounded-xl bg-slate-800/60 p-4">

                          <div className="flex items-center gap-2 text-sm font-semibold">

                            <Hospital
                              size={16}
                              className="text-green-400"
                            />

                            Destination Hospital

                          </div>

                          <p className="mt-2 text-sm text-slate-300">
                            {
                              emergency.Hospital
                                ?.name ||
                              "Hospital not selected"
                            }
                          </p>

                          {emergency.Hospital && (
                            <p className="mt-1 text-xs text-slate-500">
                              {
                                emergency.Hospital
                                  .city
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      {/* DEPARTMENT */}

                      {emergency.requiredDepartment && (
                        <div className="mt-4 rounded-xl bg-slate-800/60 p-4">

                          <p className="text-xs text-slate-500">
                            Required Department
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-200">
                            {
                              emergency.requiredDepartment
                            }
                          </p>

                        </div>
                      )}

                      {/* ACTIONS */}

                      <div className="mt-6 flex flex-wrap gap-3">

                        {/* START JOURNEY */}

                        {isAssigned && (
                          <button
                            onClick={() =>
                              startJourney(
                                emergency.id
                              )
                            }
                            disabled={
                              startingJourney ===
                              emergency.id
                            }
                            className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            {startingJourney ===
                            emergency.id ? (
                              <>
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />

                                Starting...
                              </>
                            ) : (
                              <>
                                <Navigation
                                  size={16}
                                />

                                Start Journey
                              </>
                            )}

                          </button>
                        )}

                        {/* ARRIVED */}

                        {(isEnRoute ||
                          isHospitalNotified) && (
                          <button
                            onClick={() =>
                              markArrived(
                                emergency.id
                              )
                            }
                            disabled={
                              arriving ===
                              emergency.id
                            }
                            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            {arriving ===
                            emergency.id ? (
                              <>
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />

                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle
                                  size={16}
                                />

                                Arrived at Hospital
                              </>
                            )}

                          </button>
                        )}

                        {/* TRACK */}

                        <Link
                          href={`/patient/emergency/${emergency.id}`}
                          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                          <Activity
                            size={16}
                          />

                          Track Emergency
                        </Link>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* DISCLAIMER */}

        <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900/50 p-5">

          <p className="text-xs leading-5 text-slate-500">
            MediRoute is a demonstration platform
            for emergency coordination and healthcare
            resource availability. It does not provide
            medical diagnosis or treatment advice. In a
            real emergency, contact local emergency
            services and qualified healthcare
            professionals.
          </p>

        </div>

      </div>
    </main>
  );
}