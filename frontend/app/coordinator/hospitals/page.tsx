"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  BedDouble,
  HeartPulse,
  RefreshCw,
  Search,
  Activity,
  Droplets,
} from "lucide-react";

import api from "@/lib/api";

interface Hospital {
  id: string;
  name: string;
  registrationNumber?: string | null;
  phone?: string | null;
  email?: string | null;
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

  bloodInventory?: BloodInventory[];

  lastUpdated?: string;
}

interface BloodInventory {
  id: string;
  bloodGroup: string;
  units: number;
  lastUpdated?: string;
}

export default function CoordinatorHospitalsPage() {
  const router = useRouter();

  const [hospitals, setHospitals] = useState<
    Hospital[]
  >([]);

  const [filteredHospitals, setFilteredHospitals] =
    useState<Hospital[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // =====================================================
  // LOAD HOSPITALS
  // =====================================================

  const loadHospitals = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/hospitals");

      console.log(
        "Hospital API response:",
        response.data
      );

      const responseData =
        response.data?.data;

      /*
        Backend response can be:

        1. data: [...]

        2. data: {
             hospitals: [...]
           }

        3. hospitals: [...]
      */

      let data: Hospital[] = [];

      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (
        Array.isArray(
          responseData?.hospitals
        )
      ) {
        data = responseData.hospitals;
      } else if (
        Array.isArray(
          response.data?.hospitals
        )
      ) {
        data =
          response.data.hospitals;
      }

      setHospitals(data);
      setFilteredHospitals(data);
    } catch (err: any) {
      console.error(
        "Hospital loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load hospitals"
      );

      setHospitals([]);
      setFilteredHospitals([]);
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

    loadHospitals();
  }, [router]);

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  useEffect(() => {
    let result = [...hospitals];

    if (search.trim()) {
      const searchText =
        search.toLowerCase();

      result = result.filter(
        (hospital) =>
          hospital.name
            ?.toLowerCase()
            .includes(searchText) ||
          hospital.city
            ?.toLowerCase()
            .includes(searchText) ||
          hospital.address
            ?.toLowerCase()
            .includes(searchText)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(
        (hospital) =>
          hospital.status ===
          statusFilter
      );
    }

    setFilteredHospitals(result);
  }, [
    search,
    statusFilter,
    hospitals,
  ]);

  // =====================================================
  // STATUS COLORS
  // =====================================================

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700";

      case "INACTIVE":
        return "bg-gray-100 text-gray-600";

      case "SUSPENDED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getEmergencyColor = (
    status: string
  ) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-100 text-emerald-700";

      case "BUSY":
        return "bg-amber-100 text-amber-700";

      case "CLOSED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // =====================================================
  // SUMMARY DATA
  // =====================================================

  const totalHospitals =
    hospitals.length;

  const activeHospitals =
    hospitals.filter(
      (hospital) =>
        hospital.status === "ACTIVE"
    ).length;

  const availableEmergency =
    hospitals.filter(
      (hospital) =>
        hospital.emergencyDepartment ===
        "AVAILABLE"
    ).length;

  const totalICUBeds =
    hospitals.reduce(
      (total, hospital) =>
        total +
        Number(
          hospital.icuBedsAvailable || 0
        ),
      0
    );

  const totalGeneralBeds =
    hospitals.reduce(
      (total, hospital) =>
        total +
        Number(
          hospital.generalBedsAvailable ||
            0
        ),
      0
    );

  // =====================================================
  // UI
  // =====================================================

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
                <Building2
                  className="text-blue-600"
                  size={25}
                />

                <h1 className="text-2xl font-bold text-slate-900">
                  Hospital Management
                </h1>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Monitor hospital availability
                and emergency resources
              </p>
            </div>
          </div>

          <button
            onClick={loadHospitals}
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
            title="Total Hospitals"
            value={totalHospitals}
            icon={
              <Building2
                size={21}
              />
            }
          />

          <SummaryCard
            title="Active Hospitals"
            value={activeHospitals}
            icon={
              <Activity
                size={21}
              />
            }
          />

          <SummaryCard
            title="ED Available"
            value={availableEmergency}
            icon={
              <HeartPulse
                size={21}
              />
            }
          />

          <SummaryCard
            title="ICU Beds"
            value={totalICUBeds}
            icon={
              <BedDouble
                size={21}
              />
            }
          />

          <SummaryCard
            title="General Beds"
            value={totalGeneralBeds}
            icon={
              <BedDouble
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
                placeholder="Search hospital, city or address..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* STATUS */}

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

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

              <option value="SUSPENDED">
                Suspended
              </option>
            </select>
          </div>
        </div>

        {/* =================================================
            HOSPITAL LIST
        ================================================= */}

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
              <RefreshCw
                size={30}
                className="mx-auto animate-spin text-blue-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading hospitals...
              </p>
            </div>
          ) : filteredHospitals.length ===
            0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
              <Building2
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-800">
                No hospitals found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search
                or filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredHospitals.map(
                (hospital) => (
                  <HospitalCard
                    key={hospital.id}
                    hospital={hospital}
                    getStatusColor={
                      getStatusColor
                    }
                    getEmergencyColor={
                      getEmergencyColor
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
          Hospital availability and resource
          information shown here is simulated
          data for the MediRoute demonstration
          platform. It must not be used for
          real-world medical decision making.
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
   HOSPITAL CARD
===================================================== */

function HospitalCard({
  hospital,
  getStatusColor,
  getEmergencyColor,
}: {
  hospital: Hospital;

  getStatusColor: (
    status: string
  ) => string;

  getEmergencyColor: (
    status: string
  ) => string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      {/* CARD HEADER */}

      <div className="border-b p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Building2
                size={25}
              />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                {hospital.name}
              </h2>

              {hospital.registrationNumber && (
                <p className="mt-1 text-xs text-slate-500">
                  Reg:{" "}
                  {
                    hospital.registrationNumber
                  }
                </p>
              )}
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
              hospital.status
            )}`}
          >
            {hospital.status}
          </span>
        </div>

        {/* LOCATION */}

        <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
          <MapPin
            size={17}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <span>
            {hospital.address},{" "}
            {hospital.city}
          </span>
        </div>
      </div>

      {/* =================================================
          RESOURCE GRID
      ================================================= */}

      <div className="grid grid-cols-2 gap-px bg-slate-100">
        <ResourceBox
          icon={
            <HeartPulse
              size={18}
            />
          }
          title="Emergency Dept."
          value={
            hospital.emergencyDepartment
          }
          valueClass={getEmergencyColor(
            hospital.emergencyDepartment
          )}
        />

        <ResourceBox
          icon={
            <BedDouble
              size={18}
            />
          }
          title="ICU Beds"
          value={`${hospital.icuBedsAvailable || 0} / ${
            hospital.icuBedsTotal || 0
          }`}
        />

        <ResourceBox
          icon={
            <BedDouble
              size={18}
            />
          }
          title="General Beds"
          value={`${
            hospital.generalBedsAvailable ||
            0
          } / ${
            hospital.generalBedsTotal ||
            0
          }`}
        />

        <ResourceBox
          icon={
            <Droplets
              size={18}
            />
          }
          title="Blood Groups"
          value={
            hospital.bloodInventory?.filter(
              (item) => item.units > 0
            ).length || 0
          }
        />
      </div>

      {/* =================================================
          CONTACT + AVAILABILITY
      ================================================= */}

      <div className="border-t p-5">
        <div className="grid gap-2 text-sm">
          {hospital.phone && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Phone
              </span>

              <span className="font-medium text-slate-700">
                {hospital.phone}
              </span>
            </div>
          )}

          {hospital.email && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Email
              </span>

              <span className="max-w-[220px] truncate font-medium text-slate-700">
                {hospital.email}
              </span>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <span className="text-slate-500">
              Coordinates
            </span>

            <span className="font-mono text-xs text-slate-600">
              {Number(
                hospital.latitude
              ).toFixed(4)}
              ,{" "}
              {Number(
                hospital.longitude
              ).toFixed(4)}
            </span>
          </div>
        </div>

        {/* AVAILABILITY */}

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs">
            <span className="font-medium text-slate-600">
              Current Resource Availability
            </span>

            <span className="text-slate-500">
              {getAvailabilityPercentage(
                hospital
              )}
              %
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${getAvailabilityPercentage(
                  hospital
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   RESOURCE BOX
===================================================== */

function ResourceBox({
  icon,
  title,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs">
          {title}
        </span>
      </div>

      <div
        className={`mt-2 inline-block rounded-md px-2 py-1 text-sm font-semibold ${
          valueClass ||
          "text-slate-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/* =====================================================
   AVAILABILITY CALCULATION
===================================================== */

function getAvailabilityPercentage(
  hospital: Hospital
) {
  const icuPercentage =
    hospital.icuBedsTotal > 0
      ? (hospital.icuBedsAvailable /
          hospital.icuBedsTotal) *
        100
      : 0;

  const generalPercentage =
    hospital.generalBedsTotal > 0
      ? (hospital.generalBedsAvailable /
          hospital.generalBedsTotal) *
        100
      : 0;

  const emergencyPercentage =
    hospital.emergencyDepartment ===
    "AVAILABLE"
      ? 100
      : hospital.emergencyDepartment ===
        "BUSY"
      ? 50
      : 0;

  const score =
    (icuPercentage +
      generalPercentage +
      emergencyPercentage) /
    3;

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}