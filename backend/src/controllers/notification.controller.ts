import { Request, Response } from "express";

import {
  getHospitalNotifications,
  getUserNotifications,
  notifyHospitalForEmergency,
} from "../services/notification.service";

import prisma from "../config/db";

// ======================================================
// GET HOSPITAL NOTIFICATIONS
// ======================================================

export const getHospitalNotificationList = async (
  req: Request,
  res: Response
) => {
  try {
    const hospitalId =
      req.params.hospitalId;

    if (typeof hospitalId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID",
      });
    }

    const hospital =
      await prisma.hospital.findUnique({
        where: {
          id: hospitalId,
        },
      });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const notifications =
      await getHospitalNotifications(
        hospitalId
      );

    return res.status(200).json({
      success: true,
      data: {
        notifications,
      },
    });
  } catch (error) {
    console.error(
      "Get hospital notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch hospital notifications",
    });
  }
};

// ======================================================
// GET USER NOTIFICATIONS
// ======================================================

export const getUserNotificationList = async (
  req: Request,
  res: Response
) => {
  try {
    const userId =
      req.params.userId;

    if (typeof userId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const notifications =
      await getUserNotifications(
        userId
      );

    return res.status(200).json({
      success: true,
      data: {
        notifications,
      },
    });
  } catch (error) {
    console.error(
      "Get user notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch user notifications",
    });
  }
};

// ======================================================
// NOTIFY HOSPITAL FOR EMERGENCY
// ======================================================

export const notifyHospitalForEmergencyRequest =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const emergencyId =
        req.params.emergencyId;

      if (
        typeof emergencyId !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid emergency ID",
        });
      }

      const result =
        await notifyHospitalForEmergency(
          emergencyId
        );

      return res.status(200).json({
        success: true,
        message:
          "Hospital notified successfully",
        data: result,
      });
    } catch (error) {
      console.error(
        "Notify hospital error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to notify hospital";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  };