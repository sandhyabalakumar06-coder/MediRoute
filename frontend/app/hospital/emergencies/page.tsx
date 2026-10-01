"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowLeft,
  Bed,
  Bell,
  CheckCircle2,
  Clock,
  Hospital,
  Loader2,
  MapPin,
  RefreshCw,
  Siren,
} from "lucide-react";

import { io } from "socket.io-client";
import api from "@/lib/api";

interface Emergency {
  id: string;
  severity: string;
  status: string;
  description?: string;
  requiredDepartment?: string;
  requiredBloodGroup?: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationEta?: number;
  createdAt: string;

  Hospital?: {
    id: string;
    name: string;
    city: string;
  };

  Ambulance?: {
    vehicleNumber: string;
    driverName?: string;
    phone?: string;
    status: string;
    currentEta?: number;
  };
}

interface DashboardData {
  hospital: {
    id: string;
    name: string;
    city: string;
  };

  activeEmergencies: Emergency[];
  notifications: any[];
}

const formatStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    case "HIGH":
      return "border-orange-500/30 bg-orange-500/10 text-orange-400";

    case "MEDIUM":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

    default:
      return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  }
};

export default function HospitalEmergenciesPage() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadData = async () => {
    try {
      setError("");

      const response =
        await api.get(
          "/dashboard/hospital"
        );

      setData(
        response.data.data ||
          response.data
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load hospital emergencies."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
        "http://localhost:5000"
    );

    socket.on("connect", () => {
      console.log(
        "Hospital emergency socket connected"
      );
    });

    socket.on(
      "ambulance-location-updated",
      () => {
        loadData();
      }
    );

    socket.on(
      "emergency-status-updated",
      () => {
        loadData();
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  const refresh = () => {
    setRefreshing(true);
    loadData();
  };

  const logout = () => {
    localStorage.removeItem(
      "mediroute_token"
    );

    localStorage.removeItem(
      "mediroute_user"
    );

    window.location.href = "/login";
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-red-400"
          />

          <p className="mt-4 text-slate-400">
            Loading hospital emergencies...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <AlertTriangle
            size={40}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-4 text-xl font-bold">
            Unable to Load
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {error}
          </p>

          <button
            onClick={loadData}
            className="mt-5 rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const emergencies =
    data?.activeEmergencies || [];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}

      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/hospital/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
              <Hospital size={21} />
            </div>

            <div>
              <p className="font-bold">
                MediRoute
              </p>

              <p className="text-xs text-slate-500">
                Hospital Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/hospital/dashboard"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>

            <button
              onClick={logout}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                Emergency Management
              </h1>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                LIVE
              </span>
            </div>

            <p className="mt-2 text-slate-500">
              {data?.hospital?.name}
            </p>
          </div>

          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* STATS */}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <Siren
                size={21}
                className="text-red-400"
              />

              <span className="text-xs text-slate-600">
                ACTIVE
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold">
              {emergencies.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Active Emergencies
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <Ambulance
                size={21}
                className="text-blue-400"
              />

              <span className="text-xs text-slate-600">
                INCOMING
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold">
              {
                emergencies.filter(
                  (item) =>
                    item.status ===
                      "EN_ROUTE" ||
                    item.status ===
                      "HOSPITAL_NOTIFIED"
                ).length
              }
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Ambulances Incoming
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <Clock
                size={21}
                className="text-yellow-400"
              />

              <span className="text-xs text-slate-600">
                URGENT
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold">
              {
                emergencies.filter(
                  (item) =>
                    item.severity ===
                      "HIGH" ||
                    item.severity ===
                      "CRITICAL"
                ).length
              }
            </p>

            <p className="mt-1 text-sm text-slate-500">
              High Priority
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <Bell
                size={21}
                className="text-purple-400"
              />

              <span className="text-xs text-slate-600">
                ALERTS
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold">
              {
                data?.notifications?.filter(
                  (item) =>
                    !item.isRead
                ).length || 0
              }
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Unread Notifications
            </p>
          </div>
        </div>

        {/* EMERGENCIES */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <Activity
                size={22}
                className="text-red-400"
              />

              <div>
                <h2 className="text-xl font-bold">
                  Incoming Emergencies
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Emergency requests assigned to this hospital
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {emergencies.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle2
                  size={45}
                  className="mx-auto text-emerald-400"
                />

                <h3 className="mt-4 text-lg font-semibold">
                  No Active Emergencies
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  There are currently no emergency
                  requests assigned to this hospital.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {emergencies.map(
                  (emergency) => (
                    <div
                      key={emergency.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/70 p-6"
                    >
                      {/* TOP */}

                      <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSeverityStyle(
                                emergency.severity
                              )}`}
                            >
                              {
                                emergency.severity
                              }
                            </span>

                            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                              {formatStatus(
                                emergency.status
                              )}
                            </span>
                          </div>

                          <h3 className="mt-4 text-lg font-bold">
                            Emergency Request
                          </h3>

                          <p className="mt-1 text-xs text-slate-600">
                            ID: {emergency.id}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-xs text-slate-600">
                            Created
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {new Date(
                              emergency.createdAt
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* DESCRIPTION */}

                      {emergency.description && (
                        <p className="mt-5 text-sm leading-6 text-slate-400">
                          {emergency.description}
                        </p>
                      )}

                      {/* DETAILS */}

                      <div className="mt-5 grid gap-3 md:grid-cols-4">
                        <div className="rounded-xl bg-slate-950 p-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin size={15} />
                            <span className="text-xs">
                              Pickup
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-300">
                            {
                              emergency.pickupAddress
                            }
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Activity size={15} />
                            <span className="text-xs">
                              Department
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-300">
                            {emergency.requiredDepartment ||
                              "Not specified"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Bed size={15} />
                            <span className="text-xs">
                              Blood Group
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-300">
                            {emergency.requiredBloodGroup
                              ? emergency.requiredBloodGroup
                                  .replace(
                                    "_POSITIVE",
                                    "+"
                                  )
                                  .replace(
                                    "_NEGATIVE",
                                    "-"
                                  )
                              : "Not specified"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-950 p-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock size={15} />
                            <span className="text-xs">
                              ETA
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-300">
                            {emergency.Ambulance
                              ?.currentEta !==
                            undefined
                              ? `${emergency.Ambulance.currentEta} min`
                              : "Updating..."}
                          </p>
                        </div>
                      </div>

                      {/* AMBULANCE */}

                      {emergency.Ambulance && (
                        <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 md:flex-row md:items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                              <Ambulance
                                size={20}
                              />
                            </div>

                            <div>
                              <p className="text-sm font-semibold">
                                {
                                  emergency
                                    .Ambulance
                                    .vehicleNumber
                                }
                              </p>

                              <p className="text-xs text-slate-500">
                                {emergency
                                  .Ambulance
                                  .driverName ||
                                  "Driver assigned"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                              {formatStatus(
                                emergency
                                  .Ambulance
                                  .status
                              )}
                            </span>

                            {emergency
                              .Ambulance
                              .currentEta !==
                              undefined && (
                              <span className="font-semibold text-emerald-400">
                                {
                                  emergency
                                    .Ambulance
                                    .currentEta
                                } min ETA
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ACTION */}

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/patient/emergency/${emergency.id}`}
                          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                        >
                          View Tracking
                        </Link>

                        <Link
                          href={`/hospital/emergencies/${emergency.id}`}
                          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold hover:bg-red-600"
                        >
                          Manage Emergency
                        </Link>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <p className="mt-8 text-center text-xs leading-5 text-slate-700">
          MediRoute is a demonstration platform for
          emergency coordination and healthcare resource
          availability. It does not provide medical diagnosis
          or treatment advice.
        </p>
      </div>
    </main>
  );
}