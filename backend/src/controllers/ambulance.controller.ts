import { Request, Response } from "express";

import {
  getAllAmbulances,
  getAvailableAmbulances,
  getAmbulanceById,
  assignAmbulanceToEmergency,
  startAmbulanceJourney,
  arriveAmbulanceAtHospital,
  updateAmbulanceLocation,
} from "../services/ambulance.service";

// ============================================================
// GET ALL AMBULANCES
// ============================================================

export const getAmbulances = async (
  _req: Request,
  res: Response
) => {
  try {
    const ambulances =
      await getAllAmbulances();

    return res.status(200).json({
      success: true,
      message:
        "Ambulances fetched successfully",
      data: {
        ambulances,
      },
    });
  } catch (error: any) {
    console.error(
      "Get ambulances error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch ambulances",
    });
  }
};

// ============================================================
// GET AVAILABLE AMBULANCES
// ============================================================

export const getAvailable = async (
  _req: Request,
  res: Response
) => {
  try {
    const ambulances =
      await getAvailableAmbulances();

    return res.status(200).json({
      success: true,
      message:
        "Available ambulances fetched successfully",
      data: {
        ambulances,
      },
    });
  } catch (error: any) {
    console.error(
      "Get available ambulances error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch available ambulances",
    });
  }
};

// ============================================================
// GET AMBULANCE BY ID
// ============================================================

export const getAmbulance = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const ambulance =
      await getAmbulanceById(id);

    return res.status(200).json({
      success: true,
      message:
        "Ambulance fetched successfully",
      data: {
        ambulance,
      },
    });
  } catch (error: any) {
    console.error(
      "Get ambulance error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Ambulance not found",
    });
  }
};

// ============================================================
// ASSIGN AMBULANCE TO EMERGENCY
// ============================================================

export const assignAmbulance = async (
  req: Request,
  res: Response
) => {
  try {
    const emergencyId = String(
      req.params.emergencyId
    );

    const { ambulanceId } =
      req.body;

    if (
      !ambulanceId ||
      typeof ambulanceId !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "ambulanceId is required",
      });
    }

    const result =
      await assignAmbulanceToEmergency(
        emergencyId,
        ambulanceId
      );

    return res.status(200).json({
      success: true,
      message:
        "Ambulance assigned successfully",
      data: result,
    });
  } catch (error: any) {
    console.error(
      "Assign ambulance error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to assign ambulance",
    });
  }
};

// ============================================================
// START AMBULANCE JOURNEY
// ============================================================

export const startJourney = async (
  req: Request,
  res: Response
) => {
  try {
    const emergencyId = String(
      req.params.emergencyId
    );

    const result =
      await startAmbulanceJourney(
        emergencyId
      );

    return res.status(200).json({
      success: true,
      message:
        "Ambulance journey started successfully",
      data: result,
    });
  } catch (error: any) {
    console.error(
      "Start ambulance journey error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to start ambulance journey",
    });
  }
};

// ============================================================
// ARRIVE AT HOSPITAL
// ============================================================

export const arrivedAtHospital = async (
  req: Request,
  res: Response
) => {
  try {
    const emergencyId = String(
      req.params.emergencyId
    );

    const result =
      await arriveAmbulanceAtHospital(
        emergencyId
      );

    return res.status(200).json({
      success: true,
      message:
        "Ambulance arrived at hospital successfully",
      data: result,
    });
  } catch (error: any) {
    console.error(
      "Ambulance arrival error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to mark ambulance arrival",
    });
  }
};

// ============================================================
// UPDATE AMBULANCE LOCATION
// ============================================================

export const updateLocation = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(
      req.params.id
    );

    const {
      latitude,
      longitude,
    } = req.body;

    // --------------------------------------------------------
    // Validate latitude
    // --------------------------------------------------------

    if (
      typeof latitude !== "number" ||
      !Number.isFinite(latitude)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "latitude must be a valid number",
      });
    }

    // --------------------------------------------------------
    // Validate longitude
    // --------------------------------------------------------

    if (
      typeof longitude !== "number" ||
      !Number.isFinite(longitude)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "longitude must be a valid number",
      });
    }

    // --------------------------------------------------------
    // Validate geographic range
    // --------------------------------------------------------

    if (
      latitude < -90 ||
      latitude > 90
    ) {
      return res.status(400).json({
        success: false,
        message:
          "latitude must be between -90 and 90",
      });
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "longitude must be between -180 and 180",
      });
    }

    // --------------------------------------------------------
    // Update location
    // --------------------------------------------------------

    const ambulance =
      await updateAmbulanceLocation(
        id,
        latitude,
        longitude
      );

    return res.status(200).json({
      success: true,
      message:
        "Ambulance location updated successfully",
      data: {
        ambulance,
      },
    });
  } catch (error: any) {
    console.error(
      "Update ambulance location error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update ambulance location",
    });
  }
};