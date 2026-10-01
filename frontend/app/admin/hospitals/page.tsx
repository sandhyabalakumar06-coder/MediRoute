"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Hospital,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";

import api from "@/lib/api";

interface HospitalData {
  id: string;
  name?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  emergencyDepartment?: string;
  icuBedsTotal?: number;
  icuBedsAvailable?: number;
  generalBedsTotal?: number;
  generalBedsAvailable?: number;
  lastUpdated?: string;
}

export default function AdminHospitalsPage() {
  const router = useRouter();

  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [filteredHospitals, setFilteredHospitals] =
    useState<HospitalData[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD HOSPITALS
  // ============================================================

  const loadHospitals = async () => {
    try {
      setError("");

      const response = await api.get("/hospitals");

      console.log(
        "Admin hospitals response:",
        response.data
      );

      const responseData = response.data?.data;

      let data: HospitalData[] = [];

      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (
        Array.isArray(responseData?.hospitals)
      ) {
        data = responseData.hospitals;
      } else if (
        Array.isArray(response.data?.hospitals)
      ) {
        data = response.data.hospitals;
      }

      setHospitals(data);
      setFilteredHospitals(data);
    } catch (err: any) {
      console.error(
        "Hospital loading error:",
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
          "Unable to load hospitals."
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
    loadHospitals();
  }, []);

  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  useEffect(() => {
    let result = [...hospitals];

    if (search.trim()) {
      const term = search.toLowerCase();

      result = result.filter((hospital) =>
        [
          hospital.name,
          hospital.city,
          hospital.address,
          hospital.registrationNumber,
          hospital.email,
          hospital.phone,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(term)
          )
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(
        (hospital) =>
          hospital.status === statusFilter
      );
    }

    setFilteredHospitals(result);
  }, [search, statusFilter, hospitals]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getStatusStyle = (
    status?: string
  ) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-400";

      case "INACTIVE":
        return "bg-slate-500/10 text-slate-400";

      case "MAINTENANCE":
        return "bg-amber-500/10 text-amber-400";

      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  const getDepartmentStyle = (
    department?: string
  ) => {
    switch (department) {
      case "AVAILABLE":
        return "bg-emerald-500/10 text-emerald-400";

      case "BUSY":
        return "bg-amber-500/10 text-amber-400";

      case "CLOSED":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHospitals();
  };

  const activeHospitals = hospitals.filter(
    (hospital) =>
      hospital.status === "ACTIVE"
  ).length;

  const availableEmergencyDepartments =
    hospitals.filter(
      (hospital) =>
        hospital.emergencyDepartment ===
        "AVAILABLE"
    ).length;

  const totalIcuBeds = hospitals.reduce(
    (sum, hospital) =>
      sum + (hospital.icuBedsTotal || 0),
    0
  );

  const availableIcuBeds = hospitals.reduce(
    (sum, hospital) =>
      sum + (hospital.icuBedsAvailable || 0),
    0
  );

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
            Loading hospitals...
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
                Hospital Management
              </h1>

              <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                ADMIN
              </span>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Monitor registered hospitals and
              healthcare resource availability.
            </p>

          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">

            <Building2
              size={20}
              className="text-emerald-400"
            />

            <div>

              <p className="text-xs text-slate-500">
                Total Hospitals
              </p>

              <p className="font-bold">
                {hospitals.length}
              </p>

            </div>

          </div>

        </div>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-xs text-slate-500">
              ACTIVE HOSPITALS
            </p>

            <p className="mt-3 text-3xl font-bold">
              {activeHospitals}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Currently active
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-xs text-slate-500">
              ED AVAILABLE
            </p>

            <p className="mt-3 text-3xl font-bold">
              {availableEmergencyDepartments}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Emergency departments
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-xs text-slate-500">
              ICU CAPACITY
            </p>

            <p className="mt-3 text-3xl font-bold">
              {availableIcuBeds}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Available of {totalIcuBeds}
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <p className="text-xs text-slate-500">
              VISIBILITY
            </p>

            <p className="mt-3 text-3xl font-bold">
              {filteredHospitals.length}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Matching hospitals
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
                placeholder="Search hospital, city, registration number..."
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

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

              <option value="MAINTENANCE">
                Maintenance
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
            HOSPITAL LIST
        ==================================================== */}

        <div className="mt-6">

          {filteredHospitals.length === 0 ? (

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">

              <Hospital
                size={42}
                className="mx-auto text-slate-700"
              />

              <p className="mt-4 text-slate-500">
                No hospitals found.
              </p>

            </div>

          ) : (

            <div className="grid gap-5 lg:grid-cols-2">

              {filteredHospitals.map(
                (hospital) => (

                  <div
                    key={hospital.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20"
                  >

                    {/* TOP */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                          <Hospital size={24} />
                        </div>

                        <div>

                          <h2 className="font-semibold">
                            {hospital.name ||
                              "Unnamed Hospital"}
                          </h2>

                          <p className="mt-1 text-xs text-slate-500">
                            {hospital.city ||
                              "Location unavailable"}
                          </p>

                          {hospital.registrationNumber && (
                            <p className="mt-1 text-xs text-slate-600">
                              Reg:{" "}
                              {
                                hospital.registrationNumber
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                          hospital.status
                        )}`}
                      >
                        {hospital.status ||
                          "UNKNOWN"}
                      </span>

                    </div>

                    {/* ADDRESS */}

                    <div className="mt-5 rounded-xl bg-slate-900 p-4">

                      <p className="text-xs text-slate-600">
                        ADDRESS
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {hospital.address ||
                          "Address unavailable"}
                      </p>

                    </div>

                    {/* EMERGENCY DEPARTMENT */}

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-white/5 bg-slate-900 p-4">

                      <div>

                        <p className="text-xs text-slate-600">
                          Emergency Department
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {hospital.emergencyDepartment ||
                            "UNKNOWN"}
                        </p>

                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getDepartmentStyle(
                          hospital.emergencyDepartment
                        )}`}
                      >
                        {hospital.emergencyDepartment ||
                          "UNKNOWN"}
                      </span>

                    </div>

                    {/* BEDS */}

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-slate-900 p-4">

                        <p className="text-xs text-slate-600">
                          ICU Beds
                        </p>

                        <p className="mt-2 text-xl font-bold">
                          {hospital.icuBedsAvailable ??
                            0}
                          <span className="text-sm font-normal text-slate-600">
                            {" "}
                            /{" "}
                            {hospital.icuBedsTotal ??
                              0}
                          </span>
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Available
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-900 p-4">

                        <p className="text-xs text-slate-600">
                          General Beds
                        </p>

                        <p className="mt-2 text-xl font-bold">
                          {hospital.generalBedsAvailable ??
                            0}
                          <span className="text-sm font-normal text-slate-600">
                            {" "}
                            /{" "}
                            {hospital.generalBedsTotal ??
                              0}
                          </span>
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Available
                        </p>

                      </div>

                    </div>

                    {/* CONTACT */}

                    <div className="mt-4 grid gap-2 text-xs text-slate-500">

                      {hospital.phone && (
                        <p>
                          📞 {hospital.phone}
                        </p>
                      )}

                      {hospital.email && (
                        <p>
                          ✉️ {hospital.email}
                        </p>
                      )}

                      {hospital.latitude !==
                        undefined &&
                        hospital.longitude !==
                          undefined && (
                          <p>
                            📍{" "}
                            {hospital.latitude},{" "}
                            {hospital.longitude}
                          </p>
                        )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* DISCLAIMER */}

        <p className="mt-8 text-center text-xs leading-5 text-slate-700">
          MediRoute is a demonstration platform for
          emergency coordination and healthcare
          resource availability. Hospital availability
          information is for demonstration purposes.
        </p>

      </div>
    </main>
  );
}