"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ambulance,
  ArrowLeft,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";

import api from "@/lib/api";

interface AmbulanceData {
  id: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  status?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  currentEta?: number;
  hospitalId?: string;

  hospital?: {
    id?: string;
    name?: string;
    city?: string;
  };

  emergencyId?: string;

  emergency?: {
    id?: string;
    status?: string;
    severity?: string;
  };

  operator?: {
    name?: string;
    email?: string;
    phone?: string;

    User?: {
      name?: string;
      email?: string;
      phone?: string;
    };

    user?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };

  lastUpdated?: string;
}

export default function AdminAmbulancesPage() {
  const router = useRouter();

  const [ambulances, setAmbulances] =
    useState<AmbulanceData[]>([]);

  const [filteredAmbulances, setFilteredAmbulances] =
    useState<AmbulanceData[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD AMBULANCES
  // ============================================================

  const loadAmbulances = async () => {
    try {
      setError("");

      const response = await api.get("/ambulances");

      console.log(
        "Admin ambulance response:",
        response.data
      );

      const responseData = response.data?.data;

      let data: AmbulanceData[] = [];

      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (
        Array.isArray(responseData?.ambulances)
      ) {
        data = responseData.ambulances;
      } else if (
        Array.isArray(response.data?.ambulances)
      ) {
        data = response.data.ambulances;
      }

      setAmbulances(data);
      setFilteredAmbulances(data);
    } catch (err: any) {
      console.error(
        "Ambulance loading error:",
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
          "Unable to load ambulances."
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
    loadAmbulances();
  }, []);

  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  useEffect(() => {
    let result = [...ambulances];

    if (search.trim()) {
      const term = search.toLowerCase();

      result = result.filter((ambulance) => {
        const operatorUser =
          ambulance.operator?.User ||
          ambulance.operator?.user;

        return [
          ambulance.vehicleNumber,
          ambulance.driverName,
          ambulance.driverPhone,
          ambulance.status,
          ambulance.hospital?.name,
          ambulance.hospital?.city,
          ambulance.emergency?.id,
          operatorUser?.name,
          operatorUser?.email,
          ambulance.operator?.name,
          ambulance.operator?.email,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(term)
          );
      });
    }

    if (statusFilter !== "ALL") {
      result = result.filter(
        (ambulance) =>
          ambulance.status === statusFilter
      );
    }

    setFilteredAmbulances(result);
  }, [search, statusFilter, ambulances]);

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusStyle = (
    status?: string
  ) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-500/10 text-emerald-400";

      case "ASSIGNED":
        return "bg-purple-500/10 text-purple-400";

      case "EN_ROUTE":
        return "bg-blue-500/10 text-blue-400";

      case "AT_HOSPITAL":
        return "bg-cyan-500/10 text-cyan-400";

      case "MAINTENANCE":
        return "bg-amber-500/10 text-amber-400";

      case "OFFLINE":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadAmbulances();
  };

  // ============================================================
  // OPERATOR HELPER
  // ============================================================

  const getOperator = (
    ambulance: AmbulanceData
  ) => {
    const operatorUser =
      ambulance.operator?.User ||
      ambulance.operator?.user;

    return {
      name:
        operatorUser?.name ||
        ambulance.operator?.name ||
        ambulance.driverName ||
        "Operator not assigned",

      email:
        operatorUser?.email ||
        ambulance.operator?.email ||
        "No email available",

      phone:
        operatorUser?.phone ||
        ambulance.operator?.phone ||
        ambulance.driverPhone ||
        null,
    };
  };

  // ============================================================
  // SUMMARY
  // ============================================================

  const availableCount =
    ambulances.filter(
      (item) => item.status === "AVAILABLE"
    ).length;

  const assignedCount =
    ambulances.filter(
      (item) => item.status === "ASSIGNED"
    ).length;

  const enRouteCount =
    ambulances.filter(
      (item) => item.status === "EN_ROUTE"
    ).length;

  const atHospitalCount =
    ambulances.filter(
      (item) => item.status === "AT_HOSPITAL"
    ).length;

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
            Loading ambulances...
          </p>

        </div>

      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="border-b border-white/10">

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

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
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

      </nav>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* BACK */}

        <button
          onClick={() =>
            router.push("/admin/dashboard")
          }
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >

          <ArrowLeft size={17} />

          Back to Admin Dashboard

        </button>

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-3xl font-bold">
                Ambulance Management
              </h1>

              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                ADMIN
              </span>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Monitor ambulance operations,
              operators and emergency assignments.
            </p>

          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">

            <Ambulance
              size={20}
              className="text-amber-400"
            />

            <div>

              <p className="text-xs text-slate-500">
                Total Ambulances
              </p>

              <p className="font-bold">
                {ambulances.length}
              </p>

            </div>

          </div>

        </div>

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-xs text-slate-500">
              AVAILABLE
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-400">
              {availableCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Ready for assignment
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-xs text-slate-500">
              ASSIGNED
            </p>

            <p className="mt-3 text-3xl font-bold text-purple-400">
              {assignedCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Awaiting journey
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-xs text-slate-500">
              EN ROUTE
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-400">
              {enRouteCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Currently travelling
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-xs text-slate-500">
              AT HOSPITAL
            </p>

            <p className="mt-3 text-3xl font-bold text-cyan-400">
              {atHospitalCount}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              At destination
            </p>

          </div>

        </div>

        {/* ====================================================
            SEARCH / FILTER
        ==================================================== */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search vehicle, driver, hospital, operator..."
                className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-11 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500/50"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
            >

              <option value="ALL">
                All Status
              </option>

              <option value="AVAILABLE">
                Available
              </option>

              <option value="ASSIGNED">
                Assigned
              </option>

              <option value="EN_ROUTE">
                En Route
              </option>

              <option value="AT_HOSPITAL">
                At Hospital
              </option>

              <option value="MAINTENANCE">
                Maintenance
              </option>

              <option value="OFFLINE">
                Offline
              </option>

            </select>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ====================================================
            AMBULANCE LIST
        ==================================================== */}

        <div className="mt-6">

          {filteredAmbulances.length === 0 ? (

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">

              <Ambulance
                size={42}
                className="mx-auto text-slate-700"
              />

              <p className="mt-4 text-slate-500">
                No ambulances found.
              </p>

            </div>

          ) : (

            <div className="grid gap-5 lg:grid-cols-2">

              {filteredAmbulances.map(
                (ambulance) => {

                  const operator =
                    getOperator(ambulance);

                  return (
                    <div
                      key={ambulance.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20"
                    >

                      {/* TOP */}

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-start gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                            <Ambulance size={24} />
                          </div>

                          <div>

                            <h2 className="font-semibold">
                              {ambulance.vehicleNumber ||
                                "Unknown Vehicle"}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                              Ambulance ID:{" "}
                              {ambulance.id}
                            </p>

                          </div>

                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                            ambulance.status
                          )}`}
                        >
                          {ambulance.status ||
                            "UNKNOWN"}
                        </span>

                      </div>

                      {/* OPERATOR */}

                      <div className="mt-5 rounded-xl bg-slate-900 p-4">

                        <div className="flex items-center gap-3">

                          <User
                            size={18}
                            className="text-slate-500"
                          />

                          <div>

                            <p className="text-xs text-slate-600">
                              OPERATOR / DRIVER
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {operator.name}
                            </p>

                          </div>

                        </div>

                        <div className="mt-3 space-y-1 text-xs text-slate-500">

                          <p>
                            ✉️ {operator.email}
                          </p>

                          {operator.phone && (
                            <p>
                              <Phone
                                size={12}
                                className="mr-1 inline"
                              />
                              {operator.phone}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* HOSPITAL */}

                      {ambulance.hospital && (
                        <div className="mt-4 rounded-xl border border-white/5 bg-slate-900 p-4">

                          <p className="text-xs text-slate-600">
                            ASSIGNED HOSPITAL
                          </p>

                          <p className="mt-2 text-sm font-medium">
                            {ambulance.hospital.name ||
                              "Hospital"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {ambulance.hospital.city ||
                              "Location unavailable"}
                          </p>

                        </div>
                      )}

                      {/* EMERGENCY */}

                      {ambulance.emergency && (
                        <div className="mt-4 rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4">

                          <div className="flex items-center justify-between">

                            <p className="text-xs text-slate-600">
                              ACTIVE EMERGENCY
                            </p>

                            <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                              {ambulance.emergency.severity ||
                                "UNKNOWN"}
                            </span>

                          </div>

                          <p className="mt-2 text-xs text-slate-500">
                            Status:{" "}
                            {ambulance.emergency.status ||
                              "UNKNOWN"}
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-600">
                            ID:{" "}
                            {ambulance.emergency.id ||
                              ambulance.emergencyId}
                          </p>

                        </div>
                      )}

                      {/* LOCATION + ETA */}

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-slate-900 p-4">

                          <div className="flex items-center gap-2">

                            <MapPin
                              size={15}
                              className="text-blue-400"
                            />

                            <p className="text-xs text-slate-600">
                              LOCATION
                            </p>

                          </div>

                          <p className="mt-2 text-sm">

                            {ambulance.currentLatitude !==
                              undefined &&
                            ambulance.currentLongitude !==
                              undefined
                              ? `${ambulance.currentLatitude.toFixed(
                                  4
                                )}, ${ambulance.currentLongitude.toFixed(
                                  4
                                )}`
                              : "Unavailable"}

                          </p>

                        </div>

                        <div className="rounded-xl bg-slate-900 p-4">

                          <p className="text-xs text-slate-600">
                            CURRENT ETA
                          </p>

                          <p className="mt-2 text-xl font-bold">

                            {ambulance.currentEta !==
                            undefined
                              ? `${ambulance.currentEta} min`
                              : "—"}

                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

        {/* DISCLAIMER */}

        <p className="mt-8 text-center text-xs leading-5 text-slate-700">
          MediRoute is a demonstration platform for
          emergency coordination and healthcare
          resource availability. Ambulance location
          and operational information is simulated
          for demonstration purposes.
        </p>

      </div>
    </main>
  );
}