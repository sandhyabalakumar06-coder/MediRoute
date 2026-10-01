"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Ambulance,
  MapPin,
  UserRound,
  RefreshCw,
  Search,
  Activity,
  Clock3,
  Hospital,
} from "lucide-react";

import api from "@/lib/api";

interface AmbulanceData {
  id: string;
  vehicleNumber: string;
  driverName?: string | null;
  driverPhone?: string | null;

  status: string;

  currentLatitude?: number | null;
  currentLongitude?: number | null;

  currentEta?: number | null;

  hospitalId?: string | null;

  hospital?: {
    id: string;
    name: string;
    city?: string;
  } | null;

  emergencyId?: string | null;

  emergency?: {
    id: string;
    status?: string;
    severity?: string;
  } | null;

  operator?: {
    name?: string | null;
    phone?: string | null;
    User?: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
    user?: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
  } | null;

  lastUpdated?: string;
}

export default function CoordinatorAmbulancesPage() {
  const router = useRouter();

  const [ambulances, setAmbulances] = useState<
    AmbulanceData[]
  >([]);

  const [filteredAmbulances, setFilteredAmbulances] =
    useState<AmbulanceData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // =====================================================
  // LOAD AMBULANCES
  // =====================================================

  const loadAmbulances = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/ambulances");

      console.log(
        "Ambulance API response:",
        response.data
      );

      const responseData =
        response.data?.data;

      let data: AmbulanceData[] = [];

      /*
        Supported backend response formats:

        1. data: [...]

        2. data: {
             ambulances: [...]
           }

        3. ambulances: [...]
      */

      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (
        Array.isArray(
          responseData?.ambulances
        )
      ) {
        data =
          responseData.ambulances;
      } else if (
        Array.isArray(
          response.data?.ambulances
        )
      ) {
        data =
          response.data.ambulances;
      }

      setAmbulances(data);
      setFilteredAmbulances(data);
    } catch (err: any) {
      console.error(
        "Ambulance loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load ambulances"
      );

      setAmbulances([]);
      setFilteredAmbulances([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        "mediroute_token"
      );

    if (!token) {
      router.push("/login");
      return;
    }

    loadAmbulances();
  }, [router]);

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  useEffect(() => {
    let result = [...ambulances];

    if (search.trim()) {
      const searchText =
        search.toLowerCase();

      result = result.filter(
        (ambulance) => {
          const operatorName =
            ambulance.operator?.User?.name ||
            ambulance.operator?.user?.name ||
            ambulance.operator?.name ||
            ambulance.driverName ||
            "";

          const hospitalName =
            ambulance.hospital?.name ||
            "";

          return (
            ambulance.vehicleNumber
              ?.toLowerCase()
              .includes(searchText) ||
            operatorName
              .toLowerCase()
              .includes(searchText) ||
            hospitalName
              .toLowerCase()
              .includes(searchText)
          );
        }
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(
        (ambulance) =>
          ambulance.status ===
          statusFilter
      );
    }

    setFilteredAmbulances(result);
  }, [
    search,
    statusFilter,
    ambulances,
  ]);

  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-100 text-emerald-700";

      case "ASSIGNED":
        return "bg-amber-100 text-amber-700";

      case "EN_ROUTE":
        return "bg-blue-100 text-blue-700";

      case "AT_HOSPITAL":
        return "bg-purple-100 text-purple-700";

      case "MAINTENANCE":
        return "bg-orange-100 text-orange-700";

      case "OFFLINE":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalAmbulances =
    ambulances.length;

  const availableAmbulances =
    ambulances.filter(
      (ambulance) =>
        ambulance.status ===
        "AVAILABLE"
    ).length;

  const assignedAmbulances =
    ambulances.filter(
      (ambulance) =>
        ambulance.status ===
        "ASSIGNED"
    ).length;

  const enRouteAmbulances =
    ambulances.filter(
      (ambulance) =>
        ambulance.status ===
        "EN_ROUTE"
    ).length;

  const atHospitalAmbulances =
    ambulances.filter(
      (ambulance) =>
        ambulance.status ===
        "AT_HOSPITAL"
    ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/coordinator/dashboard"
              className="rounded-lg border p-2 transition hover:bg-slate-100"
            >
              <ArrowLeft
                size={20}
              />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Ambulance
                  className="text-red-600"
                  size={26}
                />

                <h1 className="text-2xl font-bold text-slate-900">
                  Ambulance Management
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Monitor ambulance availability,
                assignments and live status
              </p>
            </div>
          </div>

          <button
            onClick={loadAmbulances}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            title="Total Ambulances"
            value={totalAmbulances}
            icon={
              <Ambulance
                size={21}
              />
            }
          />

          <SummaryCard
            title="Available"
            value={availableAmbulances}
            icon={
              <Activity
                size={21}
              />
            }
          />

          <SummaryCard
            title="Assigned"
            value={assignedAmbulances}
            icon={
              <UserRound
                size={21}
              />
            }
          />

          <SummaryCard
            title="En Route"
            value={enRouteAmbulances}
            icon={
              <MapPin
                size={21}
              />
            }
          />

          <SummaryCard
            title="At Hospital"
            value={atHospitalAmbulances}
            icon={
              <Hospital
                size={21}
              />
            }
          />
        </div>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search vehicle, driver or hospital..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* STATUS FILTER */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
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

        {/* =================================================
            AMBULANCE LIST
        ================================================= */}

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
              <RefreshCw
                size={30}
                className="mx-auto animate-spin text-blue-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading ambulances...
              </p>
            </div>
          ) : filteredAmbulances.length ===
            0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
              <Ambulance
                size={42}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-800">
                No ambulances found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search
                or status filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredAmbulances.map(
                (ambulance) => (
                  <AmbulanceCard
                    key={ambulance.id}
                    ambulance={ambulance}
                    getStatusColor={
                      getStatusColor
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
          <strong>
            Demo Notice:
          </strong>{" "}
          Ambulance locations, availability,
          assignments and ETA shown here are
          simulated demonstration data. This
          platform does not provide real-world
          emergency dispatch or medical advice.
        </div>
      </div>
    </main>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {title}
      </p>
    </div>
  );
}

/* =====================================================
   AMBULANCE CARD
===================================================== */

function AmbulanceCard({
  ambulance,
  getStatusColor,
}: {
  ambulance: AmbulanceData;

  getStatusColor: (
    status: string
  ) => string;
}) {
  const operatorName =
    ambulance.operator?.User?.name ||
    ambulance.operator?.user?.name ||
    ambulance.operator?.name ||
    ambulance.driverName ||
    "Driver not assigned";

  const operatorPhone =
    ambulance.operator?.User?.phone ||
    ambulance.operator?.user?.phone ||
    ambulance.operator?.phone ||
    ambulance.driverPhone ||
    null;

  const operatorEmail =
    ambulance.operator?.User?.email ||
    ambulance.operator?.user?.email ||
    null;

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      {/* =================================================
          CARD HEADER
      ================================================= */}

      <div className="border-b p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Ambulance
                size={27}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {ambulance.vehicleNumber}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Ambulance ID:{" "}
                {ambulance.id.slice(
                  0,
                  8
                )}
                ...
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
              ambulance.status
            )}`}
          >
            {formatStatus(
              ambulance.status
            )}
          </span>
        </div>
      </div>

      {/* =================================================
          DRIVER
      ================================================= */}

      <div className="border-b p-5">
        <div className="flex items-center gap-2">
          <UserRound
            size={18}
            className="text-slate-400"
          />

          <span className="text-sm font-semibold text-slate-700">
            Driver / Operator
          </span>
        </div>

        <div className="mt-3 rounded-xl bg-slate-50 p-4">
          <p className="font-semibold text-slate-800">
            {operatorName}
          </p>

          {operatorPhone && (
            <p className="mt-1 text-sm text-slate-500">
              Phone:{" "}
              {operatorPhone}
            </p>
          )}

          {operatorEmail && (
            <p className="mt-1 truncate text-sm text-slate-500">
              Email:{" "}
              {operatorEmail}
            </p>
          )}
        </div>
      </div>

      {/* =================================================
          LOCATION + ETA
      ================================================= */}

      <div className="grid grid-cols-2 gap-px bg-slate-100">
        <div className="bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin
              size={18}
            />

            <span className="text-xs">
              Current Location
            </span>
          </div>

          {ambulance.currentLatitude !=
            null &&
          ambulance.currentLongitude !=
            null ? (
            <p className="mt-2 font-mono text-sm font-semibold text-slate-700">
              {Number(
                ambulance.currentLatitude
              ).toFixed(4)}
              ,{" "}
              {Number(
                ambulance.currentLongitude
              ).toFixed(4)}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              Location unavailable
            </p>
          )}
        </div>

        <div className="bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock3
              size={18}
            />

            <span className="text-xs">
              Current ETA
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-700">
            {ambulance.currentEta !=
              null
              ? `${ambulance.currentEta} min`
              : "Not available"}
          </p>
        </div>
      </div>

      {/* =================================================
          ASSIGNMENT
      ================================================= */}

      <div className="border-t p-5">
        {ambulance.hospital ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <Hospital
                size={18}
              />

              <span className="text-xs font-semibold uppercase">
                Assigned Hospital
              </span>
            </div>

            <p className="mt-2 font-semibold text-emerald-900">
              {ambulance.hospital.name}
            </p>

            {ambulance.hospital.city && (
              <p className="mt-1 text-sm text-emerald-700">
                {ambulance.hospital.city}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-600">
              No hospital assigned
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Ambulance is currently
              available for assignment.
            </p>
          </div>
        )}

        {ambulance.emergency && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-blue-700">
                Active Emergency
              </span>

              {ambulance.emergency
                .severity && (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {
                    ambulance.emergency
                      .severity
                  }
                </span>
              )}
            </div>

            <p className="mt-2 font-mono text-xs text-blue-800">
              {ambulance.emergency.id}
            </p>

            {ambulance.emergency
              .status && (
              <p className="mt-1 text-sm text-blue-700">
                Status:{" "}
                {formatStatus(
                  ambulance.emergency
                    .status
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   FORMAT STATUS
===================================================== */

function formatStatus(
  status: string
) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}