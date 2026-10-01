import { Request, Response } from "express";
import { z } from "zod";

import {
  getAllHospitals,
  getHospitalById,
  createHospital,
} from "../services/hospital.service";

// ========================================
// VALIDATION SCHEMA
// ========================================

const createHospitalSchema = z.object({
  name: z.string().min(2, "Hospital name is required"),

  registrationNumber: z
    .string()
    .optional(),

  phone: z
    .string()
    .optional(),

  email: z
    .string()
    .email("Invalid email address")
    .optional(),

  address: z.string().min(3, "Address is required"),

  city: z.string().min(2, "City is required"),

  latitude: z
    .number()
    .min(-90)
    .max(90),

  longitude: z
    .number()
    .min(-180)
    .max(180),

  emergencyDepartment: z
    .enum(["AVAILABLE", "BUSY", "CLOSED"])
    .optional(),

  icuBedsTotal: z
    .number()
    .int()
    .min(0)
    .optional(),

  icuBedsAvailable: z
    .number()
    .int()
    .min(0)
    .optional(),

  generalBedsTotal: z
    .number()
    .int()
    .min(0)
    .optional(),

  generalBedsAvailable: z
    .number()
    .int()
    .min(0)
    .optional(),
});

// ========================================
// GET ALL HOSPITALS
// ========================================

export const getHospitals = async (
  _req: Request,
  res: Response
) => {
  try {
    const hospitals = await getAllHospitals();

    return res.status(200).json({
      success: true,
      data: {
        hospitals,
      },
    });
  } catch (error) {
    console.error("Get hospitals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospitals",
    });
  }
};

// ========================================
// GET HOSPITAL BY ID
// ========================================

export const getHospital = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID",
      });
    }

    const hospital = await getHospitalById(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        hospital,
      },
    });
  } catch (error) {
    console.error("Get hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospital",
    });
  }
};

// ========================================
// CREATE HOSPITAL
// ========================================

export const addHospital = async (
  req: Request,
  res: Response
) => {
  try {
    const data = createHospitalSchema.parse(req.body);

    if (
      data.icuBedsAvailable !== undefined &&
      data.icuBedsTotal !== undefined &&
      data.icuBedsAvailable > data.icuBedsTotal
    ) {
      return res.status(400).json({
        success: false,
        message: "Available ICU beds cannot exceed total ICU beds",
      });
    }

    if (
      data.generalBedsAvailable !== undefined &&
      data.generalBedsTotal !== undefined &&
      data.generalBedsAvailable > data.generalBedsTotal
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Available general beds cannot exceed total general beds",
      });
    }

    const hospital = await createHospital(data);

    return res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      data: {
        hospital,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    console.error("Create hospital error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create hospital",
    });
  }
};