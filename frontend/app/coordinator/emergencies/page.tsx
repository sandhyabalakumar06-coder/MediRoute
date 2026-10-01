"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Emergency {
  id: string;
  severity: string;
  status: string;
  description?: string | null;
  requiredDepartment?: string | null;
  requiredBloodGroup?: string | null;

  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;

  hospitalId?: string | null;
  ambulanceId?: string | null;

  Hospital?: {
    id: string;
    name: string;
    city: string;
  } | null;

  Ambulance?: {
    id: string;
    vehicleNumber: string;
    driverName?: string | null;
    status: string;
  } | null;
}

interface HospitalResult {
  hospitalId: string;
  hospitalName: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  emergencyDepartment: string;
  icuBedsAvailable: number;
  generalBedsAvailable: number;
  hospitalAvailabilityScore: number;
}

interface Ambulance {
  id: string;
  vehicleNumber: string;
  driverName?: string | null;
  phone?: string | null;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  currentEta?: number | null;

  AmbulanceOperator?: {
    id: string;
    User?: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
    } | null;
  } | null;
}

export default function CoordinatorEmergenciesPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);

  const [selectedEmergency, setSelectedEmergency] =
    useState<Emergency | null>(null);

  const [hospitals, setHospitals] = useState<HospitalResult[]>([]);

  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);

  const [loading, setLoading] = useState(true);

  const [hospitalLoading, setHospitalLoading] = useState(false);

  const [ambulanceLoading, setAmbulanceLoading] = useState(false);

  const [selectingHospital, setSelectingHospital] = useState(false);

  const [assigningAmbulance, setAssigningAmbulance] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD EMERGENCIES
  // =====================================================

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/coordinator");

      console.log(
        "Coordinator dashboard response:",
        response.data
      );

      /*
        Expected backend response:

        {
          success: true,
          data: {
            activeEmergencies: [...]
          }
        }
      */

      const data = response.data?.data ?? response.data;

      const emergencyData =
        data?.activeEmergencies ??
        data?.emergencies ??
        data?.EmergencyRequest ??
        [];

      console.log(
        "Emergency data:",
        emergencyData
      );

      if (Array.isArray(emergencyData)) {
        setEmergencies(emergencyData);
      } else {
        setEmergencies([]);
      }
    } catch (err: any) {
      console.error(
        "Emergency loading error:",
        err
      );

      setEmergencies([]);

      setError(
        err?.response?.data?.message ||
          "Unable to load emergencies"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD AVAILABLE AMBULANCES
  // =====================================================

  const findAmbulances = async () => {
    try {
      setAmbulanceLoading(true);
      setError("");

      const response = await api.get(
        "/ambulances/available"
      );

      console.log(
        "Available ambulance response:",
        response.data
      );

      /*
        Supports these possible responses:

        data: [...]

        OR

        data: {
          ambulances: [...]
        }

        OR

        ambulances: [...]
      */

      const ambulanceData =
        response.data?.data?.ambulances ??
        response.data?.data ??
        response.data?.ambulances ??
        [];

      if (Array.isArray(ambulanceData)) {
        setAmbulances(ambulanceData);
      } else {
        setAmbulances([]);
      }
    } catch (err: any) {
      console.error(
        "Ambulance loading error:",
        err
      );

      setAmbulances([]);

      setError(
        err?.response?.data?.message ||
          "Unable to find available ambulances"
      );
    } finally {
      setAmbulanceLoading(false);
    }
  };

  // =====================================================
  // FIND HOSPITALS
  // =====================================================

  const findHospitals = async (
    emergency: Emergency
  ) => {
    try {
      setSelectedEmergency(emergency);

      setHospitals([]);
      setAmbulances([]);

      setHospitalLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get(
        "/availability",
        {
          params: {
            latitude:
              emergency.pickupLatitude,

            longitude:
              emergency.pickupLongitude,

            needsICU:
              emergency.severity === "CRITICAL" ||
              emergency.severity === "HIGH",
          },
        }
      );

      console.log(
        "Hospital availability:",
        response.data
      );

      const hospitalData =
        response.data?.data?.hospitals ??
        response.data?.hospitals ??
        response.data?.data ??
        [];

      if (Array.isArray(hospitalData)) {
        setHospitals(hospitalData);
      } else {
        setHospitals([]);
      }

      await findAmbulances();
    } catch (err: any) {
      console.error(
        "Hospital search error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to find available hospitals"
      );
    } finally {
      setHospitalLoading(false);
    }
  };

  // =====================================================
  // SELECT HOSPITAL
  // =====================================================

  const selectHospital = async (
    emergencyId: string,
    hospitalId: string
  ) => {
    try {
      setSelectingHospital(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/emergencies/${emergencyId}/hospital`,
        {
          hospitalId,
        }
      );

      console.log(
        "Hospital selection response:",
        response.data
      );

      setSuccess(
        "Hospital selected successfully."
      );

      await loadEmergencies();

      /*
        Keep selected emergency open.
      */

      setSelectedEmergency((current) => {
        if (!current) return current;

        return {
          ...current,
          hospitalId,
        };
      });

      /*
        Load ambulances again after
        hospital selection.
      */

      await findAmbulances();
    } catch (err: any) {
      console.error(
        "Hospital selection error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to select hospital"
      );
    } finally {
      setSelectingHospital(false);
    }
  };

  // =====================================================
  // ASSIGN AMBULANCE
  // =====================================================

  const assignAmbulance = async (
    emergencyId: string,
    ambulanceId: string
  ) => {
    try {
      setAssigningAmbulance(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/ambulances/assign/${emergencyId}`,
        {
          ambulanceId,
        }
      );

      console.log(
        "Ambulance assignment response:",
        response.data
      );

      setSuccess(
        "Ambulance assigned successfully."
      );

      /*
        Reload emergency list so the new
        ambulance status appears.
      */

      await loadEmergencies();

      /*
        Remove assigned ambulance from
        available list.
      */

      setAmbulances((current) =>
        current.filter(
          (ambulance) =>
            ambulance.id !== ambulanceId
        )
      );
    } catch (err: any) {
      console.error(
        "Ambulance assignment error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to assign ambulance"
      );
    } finally {
      setAssigningAmbulance(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadEmergencies();
  }, []);

  // =====================================================
  // HELPERS
  // =====================================================

  const getSeverityClass = (
    severity: string
  ) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/30";

      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";

      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";

      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "CREATED":
        return "bg-blue-500/20 text-blue-400";

      case "SEARCHING_HOSPITAL":
        return "bg-purple-500/20 text-purple-400";

      case "HOSPITAL_SELECTED":
        return "bg-cyan-500/20 text-cyan-400";

      case "AMBULANCE_REQUESTED":
        return "bg-purple-500/20 text-purple-400";

      case "AMBULANCE_ASSIGNED":
        return "bg-indigo-500/20 text-indigo-400";

      case "EN_ROUTE":
        return "bg-yellow-500/20 text-yellow-400";

      case "HOSPITAL_NOTIFIED":
        return "bg-orange-500/20 text-orange-400";

      case "ARRIVED":
        return "bg-green-500/20 text-green-400";

      case "ADMITTED":
        return "bg-green-500/20 text-green-400";

      case "COMPLETED":
        return "bg-green-500/20 text-green-400";

      case "CANCELLED":
        return "bg-red-500/20 text-red-400";

      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Emergency Coordinator
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Emergency Coordination
            </h1>

            <p className="mt-2 text-slate-400">
              Coordinate hospitals, ambulances
              and emergency requests.
            </p>

          </div>

          <button
            onClick={loadEmergencies}
            className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 font-semibold transition hover:bg-slate-800"
          >
            Refresh
          </button>

        </div>


        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-400">
            {success}
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">
            {error}
          </div>
        )}


        {/* LOADING */}

        {loading ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center text-slate-400">
            Loading emergency requests...
          </div>

        ) : emergencies.length === 0 ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">

            <div className="text-5xl">
              🚑
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              No emergency requests
            </h2>

            <p className="mt-2 text-slate-400">
              There are currently no emergency
              requests available for coordination.
            </p>

            <button
              onClick={loadEmergencies}
              className="mt-5 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Load Again
            </button>

          </div>

        ) : (

          <div className="space-y-6">

            {emergencies.map(
              (emergency) => (

                <div
                  key={emergency.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl"
                >

                  {/* EMERGENCY HEADER */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${getSeverityClass(
                            emergency.severity
                          )}`}
                        >
                          {emergency.severity}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            emergency.status
                          )}`}
                        >
                          {emergency.status.replace(
                            /_/g,
                            " "
                          )}
                        </span>

                      </div>

                      <h2 className="mt-3 text-2xl font-bold">
                        Emergency Request
                      </h2>

                      <p className="mt-1 text-slate-400">
                        ID: {emergency.id}
                      </p>

                    </div>


                    {/* FIND HOSPITALS */}

                    {!emergency.hospitalId &&
                      emergency.status !==
                        "COMPLETED" &&
                      emergency.status !==
                        "CANCELLED" && (

                        <button
                          onClick={() =>
                            findHospitals(
                              emergency
                            )
                          }
                          disabled={
                            hospitalLoading &&
                            selectedEmergency?.id ===
                              emergency.id
                          }
                          className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {hospitalLoading &&
                          selectedEmergency?.id ===
                            emergency.id
                            ? "Finding..."
                            : "Find Hospitals"}
                        </button>

                      )}

                  </div>


                  {/* EMERGENCY INFORMATION */}

                  <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-xl bg-slate-950/70 p-4">

                      <p className="text-xs uppercase text-slate-500">
                        Pickup
                      </p>

                      <p className="mt-2 font-medium">
                        {emergency.pickupAddress}
                      </p>

                    </div>


                    <div className="rounded-xl bg-slate-950/70 p-4">

                      <p className="text-xs uppercase text-slate-500">
                        Department
                      </p>

                      <p className="mt-2 font-medium">
                        {emergency.requiredDepartment ||
                          "Emergency"}
                      </p>

                    </div>


                    <div className="rounded-xl bg-slate-950/70 p-4">

                      <p className="text-xs uppercase text-slate-500">
                        Blood Group
                      </p>

                      <p className="mt-2 font-medium">
                        {emergency.requiredBloodGroup ||
                          "Not specified"}
                      </p>

                    </div>


                    <div className="rounded-xl bg-slate-950/70 p-4">

                      <p className="text-xs uppercase text-slate-500">
                        Hospital
                      </p>

                      <p className="mt-2 font-medium">
                        {emergency.Hospital?.name ||
                          "Not selected"}
                      </p>

                    </div>

                  </div>


                  {/* ASSIGNED AMBULANCE */}

                  {emergency.Ambulance && (

                    <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">

                      <p className="text-xs uppercase text-blue-400">
                        Assigned Ambulance
                      </p>

                      <div className="mt-2 flex flex-wrap gap-4">

                        <span>
                          🚑{" "}
                          <strong>
                            {
                              emergency.Ambulance
                                .vehicleNumber
                            }
                          </strong>
                        </span>

                        <span className="text-slate-400">
                          {emergency.Ambulance
                            .driverName ||
                            "Driver not available"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            emergency.Ambulance
                              .status
                          )}`}
                        >
                          {
                            emergency.Ambulance
                              .status
                          }
                        </span>

                      </div>

                    </div>

                  )}


                  {/* COORDINATION PANEL */}

                  {selectedEmergency?.id ===
                    emergency.id && (

                    <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-slate-950/50 p-6">

                      {/* PANEL HEADER */}

                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>

                          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                            Emergency Coordination
                          </p>

                          <h3 className="mt-2 text-2xl font-bold">
                            {emergency.pickupAddress}
                          </h3>

                          <p className="mt-1 text-slate-400">
                            Coordinate hospital and
                            ambulance assignment.
                          </p>

                        </div>

                        <button
                          onClick={() => {
                            setSelectedEmergency(
                              null
                            );

                            setHospitals([]);

                            setAmbulances([]);

                            setError("");

                            setSuccess("");
                          }}
                          className="rounded-lg border border-slate-700 px-5 py-2.5 font-semibold hover:bg-slate-800"
                        >
                          Close
                        </button>

                      </div>


                      {/* HOSPITAL SEARCH */}

                      {!emergency.hospitalId && (

                        <div className="mt-8">

                          <div className="mb-4">

                            <h4 className="text-xl font-bold">
                              Available Hospitals
                            </h4>

                            <p className="text-sm text-slate-400">
                              Hospitals near the
                              emergency location.
                            </p>

                          </div>


                          {hospitalLoading ? (

                            <div className="rounded-xl border border-slate-800 p-8 text-center text-slate-400">
                              Searching available
                              hospitals...
                            </div>

                          ) : hospitals.length ===
                            0 ? (

                            <div className="rounded-xl border border-slate-800 p-8 text-center">

                              <p className="text-slate-400">
                                No available hospitals
                                found.
                              </p>

                              <button
                                onClick={() =>
                                  findHospitals(
                                    emergency
                                  )
                                }
                                className="mt-4 rounded-lg bg-blue-500 px-5 py-2.5 font-semibold hover:bg-blue-400"
                              >
                                Search Again
                              </button>

                            </div>

                          ) : (

                            <div className="space-y-4">

                              {hospitals.map(
                                (hospital) => (

                                  <div
                                    key={
                                      hospital.hospitalId
                                    }
                                    className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                                  >

                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                      <div>

                                        <div className="flex items-center gap-3">

                                          <div className="text-2xl">
                                            🏥
                                          </div>

                                          <div>

                                            <h5 className="text-lg font-bold">
                                              {
                                                hospital.hospitalName
                                              }
                                            </h5>

                                            <p className="text-sm text-slate-400">
                                              {
                                                hospital.city
                                              }
                                            </p>

                                          </div>

                                        </div>


                                        <p className="mt-3 text-sm text-slate-400">
                                          {
                                            hospital.address
                                          }
                                        </p>


                                        <div className="mt-4 flex flex-wrap gap-2">

                                          <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs">
                                            📍{" "}
                                            {
                                              hospital.distanceKm
                                            }{" "}
                                            km
                                          </span>

                                          <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs">
                                            🚨{" "}
                                            {
                                              hospital.emergencyDepartment
                                            }
                                          </span>

                                          <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs">
                                            ICU:{" "}
                                            {
                                              hospital.icuBedsAvailable
                                            }
                                          </span>

                                          <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs">
                                            Beds:{" "}
                                            {
                                              hospital.generalBedsAvailable
                                            }
                                          </span>

                                        </div>

                                      </div>


                                      <div className="flex flex-col items-start gap-3 lg:items-end">

                                        <div>

                                          <p className="text-xs uppercase text-slate-500">
                                            Hospital Availability
                                            Score
                                          </p>

                                          <p className="text-3xl font-bold text-cyan-400">
                                            {
                                              hospital.hospitalAvailabilityScore
                                            }
                                          </p>

                                        </div>


                                        <button
                                          onClick={() =>
                                            selectHospital(
                                              emergency.id,
                                              hospital.hospitalId
                                            )
                                          }
                                          disabled={
                                            selectingHospital
                                          }
                                          className="rounded-lg bg-green-500 px-5 py-3 font-semibold text-slate-950 hover:bg-green-400 disabled:opacity-50"
                                        >
                                          {selectingHospital
                                            ? "Selecting..."
                                            : "Select Hospital"}
                                        </button>

                                      </div>

                                    </div>

                                  </div>

                                )
                              )}

                            </div>

                          )}

                        </div>

                      )}


                      {/* SELECTED HOSPITAL */}

                      {emergency.hospitalId && (

                        <div className="mt-8">

                          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6">

                            <p className="text-sm font-semibold uppercase text-green-400">
                              Selected Hospital
                            </p>

                            <div className="mt-2 flex items-center gap-3">

                              <span className="text-3xl">
                                🏥
                              </span>

                              <div>

                                <h4 className="text-xl font-bold">
                                  {emergency.Hospital?.name ||
                                    "Hospital Selected"}
                                </h4>

                                <p className="text-slate-400">
                                  {emergency.Hospital?.city ||
                                    "Hospital"}
                                </p>

                              </div>

                            </div>

                          </div>

                        </div>

                      )}


                      {/* AMBULANCE ASSIGNMENT */}

                      {emergency.hospitalId && (

                        <div className="mt-8 border-t border-slate-800 pt-8">

                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div>

                              <h4 className="text-xl font-bold">
                                🚑 Ambulance Assignment
                              </h4>

                              <p className="mt-1 text-sm text-slate-400">
                                Select an available
                                ambulance for this
                                emergency.
                              </p>

                            </div>


                            <button
                              onClick={
                                findAmbulances
                              }
                              disabled={
                                ambulanceLoading
                              }
                              className="rounded-lg border border-slate-700 px-5 py-2.5 font-semibold hover:bg-slate-800 disabled:opacity-50"
                            >
                              {ambulanceLoading
                                ? "Checking..."
                                : "Refresh"}
                            </button>

                          </div>


                          {/* AMBULANCE LOADING */}

                          {ambulanceLoading ? (

                            <div className="mt-5 rounded-xl border border-slate-800 p-8 text-center text-slate-400">
                              Checking available
                              ambulances...
                            </div>

                          ) : ambulances.length ===
                            0 ? (

                            <div className="mt-5 rounded-xl border border-dashed border-slate-700 p-10 text-center">

                              <div className="text-4xl">
                                🚑
                              </div>

                              <p className="mt-3 text-slate-400">
                                No available
                                ambulances.
                              </p>

                              <button
                                onClick={
                                  findAmbulances
                                }
                                className="mt-5 rounded-lg bg-blue-500 px-5 py-3 font-semibold hover:bg-blue-400"
                              >
                                Check Again
                              </button>

                            </div>

                          ) : (

                            <div className="mt-5 space-y-4">

                              {ambulances.map(
                                (ambulance) => {

                                  const operatorUser =
                                    ambulance
                                      .AmbulanceOperator
                                      ?.User;

                                  const driverName =
                                    ambulance
                                      .driverName ||
                                    operatorUser
                                      ?.name ||
                                    "Driver";

                                  return (

                                    <div
                                      key={
                                        ambulance.id
                                      }
                                      className="rounded-xl border border-blue-500/20 bg-slate-900 p-5"
                                    >

                                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                        <div>

                                          <div className="flex items-center gap-3">

                                            <span className="text-3xl">
                                              🚑
                                            </span>

                                            <div>

                                              <h5 className="text-lg font-bold">
                                                {
                                                  ambulance.vehicleNumber
                                                }
                                              </h5>

                                              <p className="text-sm text-slate-400">
                                                {
                                                  driverName
                                                }
                                              </p>

                                            </div>

                                          </div>


                                          <div className="mt-4 flex flex-wrap gap-2">

                                            <span className="rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-400">
                                              {
                                                ambulance.status
                                              }
                                            </span>

                                            {ambulance.phone && (

                                              <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs">
                                                📞{" "}
                                                {
                                                  ambulance.phone
                                                }
                                              </span>

                                            )}

                                            {ambulance.currentEta !==
                                              null &&
                                              ambulance.currentEta !==
                                                undefined && (

                                                <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs">
                                                  ETA:{" "}
                                                  {
                                                    ambulance.currentEta
                                                  }{" "}
                                                  min
                                                </span>

                                              )}

                                          </div>

                                        </div>


                                        <button
                                          onClick={() =>
                                            assignAmbulance(
                                              emergency.id,
                                              ambulance.id
                                            )
                                          }
                                          disabled={
                                            assigningAmbulance
                                          }
                                          className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          {assigningAmbulance
                                            ? "Assigning..."
                                            : "Assign"}
                                        </button>

                                      </div>

                                    </div>

                                  );
                                }
                              )}

                            </div>

                          )}

                        </div>

                      )}

                    </div>

                  )}

                </div>

              )
            )}

          </div>

        )}


        {/* DISCLAIMER */}

        <div className="mt-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-sm text-slate-400">

          <strong className="text-yellow-400">
            Demo Platform:
          </strong>{" "}

          MediRoute is a demonstration platform
          for emergency coordination and healthcare
          resource availability. It does not provide
          medical diagnosis or treatment advice.

        </div>

      </div>

    </main>
  );
}