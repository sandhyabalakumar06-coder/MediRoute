import { Response } from "express";

import {
  getPatientDashboard,
  getHospitalDashboard,
  getAmbulanceDashboard,
  getCoordinatorDashboard,
  getAdminDashboard,
} from "../services/dashboard.service";

import { AuthRequest } from "../middleware/auth.middleware";

// ======================================================
// PATIENT DASHBOARD
// ======================================================

export const patientDashboard = async (
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
      await getPatientDashboard(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Patient dashboard error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load patient dashboard";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

// ======================================================
// HOSPITAL DASHBOARD
// ======================================================

export const hospitalDashboard = async (
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
      await getHospitalDashboard(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Hospital dashboard error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load hospital dashboard";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

// ======================================================
// AMBULANCE DASHBOARD
// ======================================================

export const ambulanceDashboard =
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
        await getAmbulanceDashboard(
          req.user.userId
        );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(
        "Ambulance dashboard error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to load ambulance dashboard";

      return res.status(400).json({
        success: false,
        message,
      });
    }
  };

// ======================================================
// COORDINATOR DASHBOARD
// ======================================================

export const coordinatorDashboard =
  async (
    _req: AuthRequest,
    res: Response
  ) => {
    try {
      const data =
        await getCoordinatorDashboard();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(
        "Coordinator dashboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load coordinator dashboard",
      });
    }
  };

// ======================================================
// ADMIN DASHBOARD
// ======================================================

export const adminDashboard = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const data =
      await getAdminDashboard();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load admin dashboard",
    });
  }
};