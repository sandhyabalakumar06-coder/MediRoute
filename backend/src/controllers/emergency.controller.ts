import { Response } from "express";
import { z } from "zod";

import { AuthRequest } from "../middleware/auth.middleware";

import {
  createEmergency,
  getEmergencyById,
  getPatientEmergencies,
  selectHospitalForEmergency,
} from "../services/emergency.service";

const createEmergencySchema =
  z.object({
    severity: z
      .enum([
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
      ])
      .optional(),

    description: z
      .string()
      .optional(),

    requiredDepartment: z
      .string()
      .optional(),

    pickupAddress: z
      .string()
      .min(
        3,
        "Pickup address is required"
      ),

    pickupLatitude: z
      .number()
      .min(-90)
      .max(90),

    pickupLongitude: z
      .number()
      .min(-180)
      .max(180),

    requiredBloodGroup: z
      .enum([
        "A_POSITIVE",
        "A_NEGATIVE",
        "B_POSITIVE",
        "B_NEGATIVE",
        "AB_POSITIVE",
        "AB_NEGATIVE",
        "O_POSITIVE",
        "O_NEGATIVE",
      ])
      .optional(),
  });

const selectHospitalSchema =
  z.object({
    hospitalId: z
      .string()
      .min(
        1,
        "Hospital ID is required"
      ),
  });

export const createEmergencyRequest =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const data =
        createEmergencySchema.parse(
          req.body
        );

      const emergency =
        await createEmergency({
          ...data,
          patientId:
            req.user.userId,
        });

      return res.status(201).json({
        success: true,
        message:
          "Emergency request created successfully",
        data: {
          emergency,
        },
      });
    } catch (error: any) {
      if (
        error instanceof z.ZodError
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Validation failed",
          errors:
            error.issues,
        });
      }

      console.error(
        "Create emergency error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create emergency",
      });
    }
  };

export const getEmergency =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const id =
        req.params.id;

      if (
        typeof id !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid emergency ID",
        });
      }

      const emergency =
        await getEmergencyById(
          id
        );

      if (!emergency) {
        return res.status(404).json({
          success: false,
          message:
            "Emergency not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          emergency,
        },
      });
    } catch (error) {
      console.error(
        "Get emergency error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch emergency",
      });
    }
  };

export const getMyEmergencies =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const emergencies =
        await getPatientEmergencies(
          req.user.userId
        );

      return res.status(200).json({
        success: true,
        data: {
          emergencies,
        },
      });
    } catch (error: any) {
      console.error(
        "Get patient emergencies error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch emergencies",
      });
    }
  };

export const selectHospital =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const emergencyId =
        req.params.id;

      if (
        typeof emergencyId !==
        "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid emergency ID",
        });
      }

      const data =
        selectHospitalSchema.parse(
          req.body
        );

      const emergency =
        await selectHospitalForEmergency(
          emergencyId,
          data.hospitalId,
          req.user.userId
        );

      return res.status(200).json({
        success: true,
        message:
          "Hospital selected successfully",
        data: {
          emergency,
        },
      });
    } catch (error: any) {
      if (
        error instanceof z.ZodError
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Validation failed",
          errors:
            error.issues,
        });
      }

      console.error(
        "Select hospital error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to select hospital",
      });
    }
  };