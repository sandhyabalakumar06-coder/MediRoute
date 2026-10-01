"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Activity,
  Ambulance,
  Building2,
  Hospital,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Siren,
  Users,
} from "lucide-react";

import api from "@/lib/api";

interface DashboardData {
  users?: any[];
  hospitals?: any[];
  ambulances?: any[];
  emergencies?: any[];

  stats?: {
    totalUsers?: number;
    totalHospitals?: number;
    totalAmbulances?: number;
    activeEmergencies?: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================================================
  // LOAD ADMIN DASHBOARD
  // ============================================================

  const loadDashboard = async () => {
    try {
      setError("");

      const response = await api.get(
        "/dashboard/admin"
      );

      console.log(
        "Admin dashboard response:",
        response.data
      );

      const responseData =
        response.data?.data;

      const data =
        responseData?.dashboard ||
        responseData;

      setDashboard(data);
    } catch (err: any) {
      console.error(
        "Admin dashboard error:",
        err
      );

      if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
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
          "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    setRefreshing(true);

    loadDashboard();
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "mediroute_token"
    );

    localStorage.removeItem(
      "mediroute_user"
    );

    router.push("/login");
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">

          <RefreshCw
            size={32}
            className="mx-auto animate-spin text-red-400"
          />

          <p className="mt-4 text-slate-400">
            Loading admin dashboard...
          </p>

        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">

        <div className="max-w-lg rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">

          <ShieldCheck
            size={45}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-4 text-2xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            {error ||
              "Unable to load admin information."}
          </p>

          <button
            onClick={handleRefresh}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-3 font-semibold hover:bg-red-600"
          >
            <RefreshCw size={17} />
            Try Again
          </button>

        </div>

      </main>
    );
  }

  // ============================================================
  // SAFE DATA EXTRACTION
  // ============================================================

  const users = Array.isArray(
    dashboard.users
  )
    ? dashboard.users
    : [];

  const hospitals = Array.isArray(
    dashboard.hospitals
  )
    ? dashboard.hospitals
    : [];

  const ambulances = Array.isArray(
    dashboard.ambulances
  )
    ? dashboard.ambulances
    : [];

  const emergencies = Array.isArray(
    dashboard.emergencies
  )
    ? dashboard.emergencies
    : [];

  const stats =
    dashboard.stats || {};

  const totalUsers =
    stats.totalUsers ??
    users.length;

  const totalHospitals =
    stats.totalHospitals ??
    hospitals.length;

  const totalAmbulances =
    stats.totalAmbulances ??
    ambulances.length;

  const activeEmergencies =
    stats.activeEmergencies ??
    emergencies.filter(
      (item: any) =>
        ![
          "COMPLETED",
          "CANCELLED",
        ].includes(item?.status)
    ).length;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="border-b border-white/10 bg-slate-950/95">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p className="font-bold">
                MediRoute
              </p>

              <p className="text-xs text-slate-500">
                Admin Portal
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
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
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >

              <LogOut size={16} />

              Logout

            </button>

          </div>

        </div>

      </nav>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-3xl font-bold">
                Admin Dashboard
              </h1>

              <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                ADMIN
              </span>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Monitor MediRoute emergency coordination
              and system resources.
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">

            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-sm text-emerald-400">
              System Operational
            </span>

          </div>

        </div>

        {/* ====================================================
            STAT CARDS
        ==================================================== */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* USERS */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Users size={22} />
              </div>

              <span className="text-xs text-slate-600">
                USERS
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold">
              {totalUsers}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Registered Users
            </p>

          </div>

          {/* HOSPITALS */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Hospital size={22} />
              </div>

              <span className="text-xs text-slate-600">
                HOSPITALS
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold">
              {totalHospitals}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Registered Hospitals
            </p>

          </div>

          {/* AMBULANCES */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Ambulance size={22} />
              </div>

              <span className="text-xs text-slate-600">
                AMBULANCES
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold">
              {totalAmbulances}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Registered Ambulances
            </p>

          </div>

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
              {activeEmergencies}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Active Emergencies
            </p>

          </div>

        </div>

        {/* ====================================================
            MANAGEMENT LINKS
        ==================================================== */}

        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <a
            href="/admin/users"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-500/30 hover:bg-blue-500/5"
          >

            <Users
              size={25}
              className="text-blue-400"
            />

            <h2 className="mt-4 text-lg font-semibold">
              User Management
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              View and manage registered
              MediRoute users and roles.
            </p>

          </a>

          <a
            href="/admin/hospitals"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-emerald-500/30 hover:bg-emerald-500/5"
          >

            <Building2
              size={25}
              className="text-emerald-400"
            />

            <h2 className="mt-4 text-lg font-semibold">
              Hospital Management
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Monitor hospitals, departments,
              beds and availability.
            </p>

          </a>

          <a
            href="/admin/ambulances"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-amber-500/30 hover:bg-amber-500/5"
          >

            <Ambulance
              size={25}
              className="text-amber-400"
            />

            <h2 className="mt-4 text-lg font-semibold">
              Ambulance Management
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Monitor ambulance status,
              operators and assignments.
            </p>

          </a>

        </div>

        {/* ====================================================
            SYSTEM OVERVIEW
        ==================================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* HOSPITAL OVERVIEW */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03]">

            <div className="flex items-center justify-between border-b border-white/10 p-6">

              <div>

                <h2 className="text-lg font-semibold">
                  Hospital Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Registered hospital resources
                </p>

              </div>

              <Hospital
                size={21}
                className="text-emerald-400"
              />

            </div>

            <div className="p-6">

              {hospitals.length === 0 ? (

                <p className="text-center text-sm text-slate-600">
                  No hospital data available.
                </p>

              ) : (

                <div className="space-y-3">

                  {hospitals
                    .slice(0, 5)
                    .map(
                      (hospital: any) => (

                        <div
                          key={
                            hospital.id
                          }
                          className="flex items-center justify-between rounded-xl bg-slate-900 p-4"
                        >

                          <div>

                            <p className="font-medium">
                              {
                                hospital.name ||
                                "Hospital"
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {
                                hospital.city ||
                                "Location unavailable"
                              }
                            </p>

                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              hospital.status ===
                              "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {hospital.status ||
                              "UNKNOWN"}
                          </span>

                        </div>

                      )
                    )}

                </div>

              )}

            </div>

          </div>

          {/* AMBULANCE OVERVIEW */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03]">

            <div className="flex items-center justify-between border-b border-white/10 p-6">

              <div>

                <h2 className="text-lg font-semibold">
                  Ambulance Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current ambulance operations
                </p>

              </div>

              <Ambulance
                size={21}
                className="text-amber-400"
              />

            </div>

            <div className="p-6">

              {ambulances.length === 0 ? (

                <p className="text-center text-sm text-slate-600">
                  No ambulance data available.
                </p>

              ) : (

                <div className="space-y-3">

                  {ambulances
                    .slice(0, 5)
                    .map(
                      (ambulance: any) => (

                        <div
                          key={
                            ambulance.id
                          }
                          className="rounded-xl bg-slate-900 p-4"
                        >

                          <div className="flex items-center justify-between">

                            <div>

                              <p className="font-medium">
                                {
                                  ambulance.vehicleNumber ||
                                  "Ambulance"
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                {
                                  ambulance.driverName ||
                                  ambulance.driver?.name ||
                                  "Driver not assigned"
                                }
                              </p>

                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                ambulance.status ===
                                "AVAILABLE"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : ambulance.status ===
                                    "EN_ROUTE"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {ambulance.status ||
                                "UNKNOWN"}
                            </span>

                          </div>

                        </div>

                      )
                    )}

                </div>

              )}

            </div>

          </div>

        </div>

        {/* ====================================================
            EMERGENCY OVERVIEW
        ==================================================== */}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03]">

          <div className="flex items-center justify-between border-b border-white/10 p-6">

            <div>

              <h2 className="text-lg font-semibold">
                Emergency Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recent emergency coordination
              </p>

            </div>

            <Siren
              size={21}
              className="text-red-400"
            />

          </div>

          <div className="p-6">

            {emergencies.length === 0 ? (

              <div className="rounded-xl bg-slate-900 p-8 text-center">

                <Activity
                  size={32}
                  className="mx-auto text-slate-700"
                />

                <p className="mt-3 text-sm text-slate-500">
                  No emergency records available.
                </p>

              </div>

            ) : (

              <div className="grid gap-3 md:grid-cols-2">

                {emergencies
                  .slice(0, 6)
                  .map(
                    (emergency: any) => (

                      <div
                        key={
                          emergency.id
                        }
                        className="rounded-xl bg-slate-900 p-4"
                      >

                        <div className="flex items-center justify-between gap-3">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              emergency.severity ===
                              "CRITICAL"
                                ? "bg-red-500/10 text-red-400"
                                : emergency.severity ===
                                  "HIGH"
                                ? "bg-orange-500/10 text-orange-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {
                              emergency.severity ||
                              "UNKNOWN"
                            }
                          </span>

                          <span className="text-xs text-slate-500">
                            {
                              emergency.status ||
                              "UNKNOWN"
                            }
                          </span>

                        </div>

                        <p className="mt-4 break-all text-xs text-slate-600">
                          ID: {emergency.id}
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                          {
                            emergency.pickupAddress ||
                            "Pickup location unavailable"
                          }
                        </p>

                      </div>

                    )
                  )}

              </div>

            )}

          </div>

        </div>

        {/* ====================================================
            SYSTEM STATUS
        ==================================================== */}

        <div className="mt-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-6">

          <div className="flex items-center gap-3">

            <Activity
              size={22}
              className="text-emerald-400"
            />

            <div>

              <h2 className="font-semibold">
                MediRoute System Status
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Core emergency coordination services
                are connected.
              </p>

            </div>

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl bg-slate-900 p-4">

              <p className="text-xs text-slate-600">
                API
              </p>

              <p className="mt-2 text-sm font-semibold text-emerald-400">
                Operational
              </p>

            </div>

            <div className="rounded-xl bg-slate-900 p-4">

              <p className="text-xs text-slate-600">
                Database
              </p>

              <p className="mt-2 text-sm font-semibold text-emerald-400">
                Connected
              </p>

            </div>

            <div className="rounded-xl bg-slate-900 p-4">

              <p className="text-xs text-slate-600">
                Authentication
              </p>

              <p className="mt-2 text-sm font-semibold text-emerald-400">
                Active
              </p>

            </div>

            <div className="rounded-xl bg-slate-900 p-4">

              <p className="text-xs text-slate-600">
                Emergency Coordination
              </p>

              <p className="mt-2 text-sm font-semibold text-emerald-400">
                Active
              </p>

            </div>

          </div>

        </div>

        {/* ====================================================
            DISCLAIMER
        ==================================================== */}

        <p className="mt-8 text-center text-xs leading-5 text-slate-700">
          MediRoute is a demonstration platform
          for emergency coordination and healthcare
          resource availability. It does not provide
          medical diagnosis or treatment advice.
        </p>

      </div>

    </main>
  );
}