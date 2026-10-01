import prisma from "../config/db";

export const getAllHospitals = async () => {
  return prisma.hospital.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const getHospitalById = async (id: string) => {
  return prisma.hospital.findUnique({
    where: {
      id,
    },
  });
};

interface CreateHospitalData {
  name: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  emergencyDepartment?:
    | "AVAILABLE"
    | "BUSY"
    | "CLOSED";
  icuBedsTotal?: number;
  icuBedsAvailable?: number;
  generalBedsTotal?: number;
  generalBedsAvailable?: number;
}

export const createHospital = async (
  data: CreateHospitalData
) => {
  return prisma.hospital.create({
    data: {
      name: data.name,
      registrationNumber: data.registrationNumber,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,

      emergencyDepartment:
        data.emergencyDepartment || "AVAILABLE",

      icuBedsTotal:
        data.icuBedsTotal || 0,

      icuBedsAvailable:
        data.icuBedsAvailable || 0,

      generalBedsTotal:
        data.generalBedsTotal || 0,

      generalBedsAvailable:
        data.generalBedsAvailable || 0,

      lastUpdated: new Date(),
    },
  });
};