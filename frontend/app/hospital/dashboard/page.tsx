"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Activity,
  Ambulance,
  Bell,
  BedDouble,
  Droplets,
  Hospital,
  LogOut,
  RefreshCw,
  Siren,
  Users,
} from "lucide-react";

import { io } from "socket.io-client";

import api from "@/lib/api";

interface HospitalData {
  id: string;
  name: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  status: string;
  emergencyDepartment: string;
  icuBedsTotal: number;
  icuBedsAvailable: number;
  generalBedsTotal: number;
  generalBedsAvailable: number;
}

interface BloodItem {
  bloodGroup: string;
  units: number;
  lastUpdated: string;
}

interface Emergency {
  id: string;
  severity: string;
  status: string;
  description?: string;
  requiredDepartment?: string;
  requiredBloodGroup?: string;
  pickupAddress: string;
  createdAt: string;

  Ambulance?: {
    vehicleNumber: string;
    driverName?: string;
    status: string;
    currentEta?: number;
  };

  User?: {
    name: string;
    phone?: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface DashboardData {
  hospital: HospitalData;
  bloodInventory: BloodItem[];
  activeEmergencies: Emergency[];
  notifications: Notification[];
}

const formatStatus = (status: string) => {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const bloodLabel = (group: string) => {
  const labels: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };

  return labels[group] || group;
};

const severityStyle = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-500/15 text-red-400 border-red-500/20";

    case "HIGH":
      return "bg-orange-500/15 text-orange-400 border-orange-500/20";

    case "MEDIUM":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";

    default:
      return "bg-blue-500/15 text-blue-400 border-blue-500/20";
  }
};

export default function HospitalDashboard() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const loadDashboard = async () => {
    try {
      setError("");

      const response = await api.get(
        "/dashboard/hospital"
      );

      const data =
        response.data.data?.dashboard ||
        response.data.data;

      setDashboard(data);
    } catch (err: any) {
      console.error(err);

      if (
        err?.response?.status === 401
      ) {
        localStorage.removeItem(
          "mediroute_token"
        );

        localStorage.removeItem(
          "mediroute_user"
        );

        router.push("/login");

        return;
      }

      setError(
        err?.response?.data?.message ||
          "Failed to load hospital dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
        "http://localhost:5000"
    );

    socket.on("connect", () => {
      console.log(
        "Hospital dashboard connected to Socket.IO"
      );
    });

    socket.on(
      "ambulance-location-updated",
      () => {
        loadDashboard();
      }
    );

    socket.on(
      "emergency-status-updated",
      () => {
        loadDashboard();
      }
    );

    socket.on(
      "emergency-updated",
      () => {
        loadDashboard();
      }
    );

    socket.on(
      "hospital-updated",
      () => {
        loadDashboard();
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "mediroute_token"
    );

    localStorage.removeItem(
      "mediroute_user"
    );

    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-red-400"
          />

          <p className="mt-4 text-slate-400">
            Loading hospital dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-lg rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <Hospital
            size={42}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-4 text-2xl font-bold">
            Hospital Dashboard
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            {error ||
              "Unable to load hospital information."}
          </p>

          <button
            onClick={handleRefresh}
            className="mt-6 rounded-lg bg-red-500 px-5 py-3 font-semibold hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const hospital =
    dashboard.hospital;

  const activeEmergencies =
    dashboard.activeEmergencies || [];

  const notifications =
    dashboard.notifications || [];

  const bloodInventory =
    dashboard.bloodInventory || [];

  const unreadNotifications =
    notifications.filter(
      (item) => !item.isRead
    ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
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
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
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

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} />

              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* HOSPITAL HEADER */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {hospital.name}
              </h1>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                {hospital.status}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {hospital.address},{" "}
              {hospital.city}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-sm text-emerald-400">
              Live System Connected
            </span>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* EMERGENCIES */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <Siren size={22} />
              </div>

              <span className="text-xs text-slate-600">
                ACTIVE
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold">
              {activeEmergencies.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Active Emergencies
            </p>
          </div>

          {/* ICU */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Activity size={22} />
              </div>

              <span className="text-xs text-slate-600">
                ICU
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold">
              {hospital.icuBedsAvailable}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              ICU Beds Available
            </p>

            <p className="mt-2 text-xs text-slate-600">
              of {hospital.icuBedsTotal} total
            </p>
          </div>

          {/* GENERAL BEDS */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <BedDouble size={22} />
              </div>

              <span className="text-xs text-slate-600">
                BEDS
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold">
              {hospital.generalBedsAvailable}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              General Beds Available
            </p>

            <p className="mt-2 text-xs text-slate-600">
              of {hospital.generalBedsTotal} total
            </p>
          </div>

          {/* NOTIFICATIONS */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Bell size={22} />
              </div>

              <span className="text-xs text-slate-600">
                ALERTS
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold">
              {unreadNotifications}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Unread Notifications
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* EMERGENCIES */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    Incoming Emergencies
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Emergency requests assigned
                    to this hospital
                  </p>
                </div>

                <Siren
                  size={20}
                  className="text-red-400"
                />
              </div>

              <div className="px-6 pb-0">
                <Link
                  href="/hospital/emergencies"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Siren size={16} />
                  Manage Emergencies
                </Link>
              </div>

              <div className="p-6">
                {activeEmergencies.length ===
                0 ? (
                  <div className="rounded-xl bg-slate-900 p-8 text-center">
                    <Siren
                      size={35}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-3 font-medium text-slate-500">
                      No active emergencies
                    </p>

                    <p className="mt-1 text-xs text-slate-700">
                      New emergency requests
                      will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeEmergencies.map(
                      (emergency) => (
                        <div
                          key={emergency.id}
                          className="rounded-xl border border-white/10 bg-slate-900 p-5"
                        >
                          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityStyle(
                                    emergency.severity
                                  )}`}
                                >
                                  {
                                    emergency.severity
                                  }
                                </span>

                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                                  {formatStatus(
                                    emergency.status
                                  )}
                                </span>
                              </div>

                              <h3 className="mt-3 font-semibold">
                                Emergency Request
                              </h3>

                              <p className="mt-1 break-all text-xs text-slate-600">
                                ID:{" "}
                                {emergency.id}
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

                          {emergency.description && (
                            <p className="mt-4 text-sm leading-6 text-slate-400">
                              {
                                emergency.description
                              }
                            </p>
                          )}

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg bg-slate-950 p-3">
                              <p className="text-xs text-slate-600">
                                Pickup Location
                              </p>

                              <p className="mt-1 text-sm text-slate-300">
                                {
                                  emergency.pickupAddress
                                }
                              </p>
                            </div>

                            <div className="rounded-lg bg-slate-950 p-3">
                              <p className="text-xs text-slate-600">
                                Department
                              </p>

                              <p className="mt-1 text-sm text-slate-300">
                                {emergency.requiredDepartment ||
                                  "Emergency"}
                              </p>
                            </div>
                          </div>

                          {emergency.Ambulance && (
                            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-amber-500/5 p-3">
                              <Ambulance
                                size={18}
                                className="text-amber-400"
                              />

                              <span className="text-sm text-slate-300">
                                {
                                  emergency
                                    .Ambulance
                                    .vehicleNumber
                                }
                              </span>

                              <span className="text-xs text-slate-500">
                                {
                                  emergency
                                    .Ambulance
                                    .status
                                }
                              </span>

                              {emergency
                                .Ambulance
                                .currentEta !==
                                undefined && (
                                <span className="ml-auto text-xs font-semibold text-amber-400">
                                  ETA{" "}
                                  {
                                    emergency
                                      .Ambulance
                                      .currentEta
                                  }{" "}
                                  min
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BLOOD INVENTORY */}
          <div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div>
                  <h2 className="text-lg font-semibold">
                    Blood Inventory
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current available units
                  </p>
                </div>

                <Droplets
                  size={21}
                  className="text-red-400"
                />
              </div>

              <div className="px-6 pb-0">
                <Link
                  href="/hospital/inventory"
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  <Droplets size={16} />
                  Manage Blood Inventory
                </Link>
              </div>

              <div className="p-6">
                {bloodInventory.length ===
                0 ? (
                  <p className="text-center text-sm text-slate-600">
                    No inventory data
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {bloodInventory.map(
                      (item) => (
                        <div
                          key={
                            item.bloodGroup
                          }
                          className="rounded-xl bg-slate-900 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-red-400">
                              {bloodLabel(
                                item.bloodGroup
                              )}
                            </span>

                            <Droplets
                              size={15}
                              className={
                                item.units >
                                0
                                  ? "text-red-400"
                                  : "text-slate-700"
                              }
                            />
                          </div>

                          <p className="mt-2 text-2xl font-bold">
                            {item.units}
                          </p>

                          <p className="text-xs text-slate-600">
                            units
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* HOSPITAL STATUS */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3">
                <Activity
                  size={20}
                  className="text-emerald-400"
                />

                <h2 className="font-semibold">
                  Emergency Department
                </h2>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-900 p-4">
                <span className="text-sm text-slate-400">
                  Current Status
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    hospital.emergencyDepartment ===
                    "AVAILABLE"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : hospital.emergencyDepartment ===
                        "BUSY"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {
                    hospital.emergencyDepartment
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <Bell
                size={20}
                className="text-amber-400"
              />

              <div>
                <h2 className="font-semibold">
                  Recent Notifications
                </h2>

                <p className="text-xs text-slate-500">
                  Hospital alerts and emergency
                  coordination updates
                </p>
              </div>
            </div>

            <span className="text-xs text-slate-600">
              {notifications.length} total
            </span>
          </div>

          <div className="p-6">
            {notifications.length ===
            0 ? (
              <p className="text-center text-sm text-slate-600">
                No notifications yet.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications
                  .slice(0, 5)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-xl border p-4 ${
                        notification.isRead
                          ? "border-white/5 bg-slate-900/50"
                          : "border-amber-500/20 bg-amber-500/5"
                      }`}
                    >
                      <div className="flex gap-3">
                        <Bell
                          size={18}
                          className={
                            notification.isRead
                              ? "mt-0.5 text-slate-600"
                              : "mt-0.5 text-amber-400"
                          }
                        />

                        <div className="min-w-0">
                          <p className="font-medium">
                            {
                              notification.title
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {
                              notification.message
                            }
                          </p>

                          <p className="mt-2 text-xs text-slate-600">
                            {new Date(
                              notification.createdAt
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-slate-600 md:flex-row">
          <p>
            MediRoute Hospital Coordination
            Portal
          </p>

          <div className="flex items-center gap-2">
            <Users size={14} />

            <span>
              Emergency resource coordination
            </span>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-700">
          MediRoute is a demonstration platform
          for emergency coordination and
          healthcare resource availability. It
          does not provide medical diagnosis or
          treatment advice.
        </p>
      </div>
    </main>
  );
}