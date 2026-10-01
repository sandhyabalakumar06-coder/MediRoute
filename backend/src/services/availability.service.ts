import prisma from "../config/db";

interface HospitalAvailabilityInput {
  latitude: number;
  longitude: number;
  requiredDepartment?: boolean;
  needsICU?: boolean;
}

// ========================================
// CALCULATE DISTANCE
// ========================================

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const earthRadius = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
};

// ========================================
// FIND AVAILABLE HOSPITALS
// ========================================

export const findAvailableHospitals = async (
  input: HospitalAvailabilityInput
) => {
  const hospitals =
    await prisma.hospital.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        bloodInventory: true,
      },
    });

  const results = hospitals.map(
    (hospital) => {
      // ------------------------------
      // DISTANCE
      // ------------------------------

      const distance =
        calculateDistance(
          input.latitude,
          input.longitude,
          hospital.latitude,
          hospital.longitude
        );

      // ------------------------------
      // DISTANCE SCORE: 30
      // ------------------------------

      let distanceScore = 0;

      if (distance <= 2) {
        distanceScore = 30;
      } else if (distance <= 5) {
        distanceScore = 25;
      } else if (distance <= 10) {
        distanceScore = 20;
      } else if (distance <= 20) {
        distanceScore = 10;
      } else {
        distanceScore = 5;
      }

      // ------------------------------
      // EMERGENCY DEPARTMENT: 25
      // ------------------------------

      let emergencyScore = 0;

      if (
        hospital.emergencyDepartment ===
        "AVAILABLE"
      ) {
        emergencyScore = 25;
      } else if (
        hospital.emergencyDepartment ===
        "BUSY"
      ) {
        emergencyScore = 10;
      } else {
        emergencyScore = 0;
      }

      // ------------------------------
      // ICU: 20
      // ------------------------------

      let icuScore = 0;

      if (hospital.icuBedsAvailable > 0) {
        if (
          hospital.icuBedsAvailable >= 10
        ) {
          icuScore = 20;
        } else {
          icuScore = 15;
        }
      }

      // ------------------------------
      // GENERAL BEDS: 15
      // ------------------------------

      let generalBedScore = 0;

      if (
        hospital.generalBedsAvailable > 0
      ) {
        if (
          hospital.generalBedsAvailable >= 30
        ) {
          generalBedScore = 15;
        } else {
          generalBedScore = 10;
        }
      }

      // ------------------------------
      // HOSPITAL STATUS: 10
      // ------------------------------

      const statusScore =
        hospital.status === "ACTIVE"
          ? 10
          : 0;

      // ------------------------------
      // FINAL SCORE
      // ------------------------------

      const hospitalAvailabilityScore =
        distanceScore +
        emergencyScore +
        icuScore +
        generalBedScore +
        statusScore;

      return {
        hospitalId: hospital.id,

        hospitalName:
          hospital.name,

        city:
          hospital.city,

        address:
          hospital.address,

        latitude:
          hospital.latitude,

        longitude:
          hospital.longitude,

        distanceKm:
          Number(distance.toFixed(2)),

        emergencyDepartment:
          hospital.emergencyDepartment,

        icuBedsAvailable:
          hospital.icuBedsAvailable,

        generalBedsAvailable:
          hospital.generalBedsAvailable,

        hospitalAvailabilityScore,
      };
    }
  );

  // Highest score first

  return results.sort(
    (a, b) =>
      b.hospitalAvailabilityScore -
      a.hospitalAvailabilityScore
  );
};