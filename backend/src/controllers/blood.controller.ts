import { Request, Response } from "express";

import {
  getHospitalBloodInventory,
  updateBloodInventory,
  getBloodAvailabilitySummary,
} from "../services/blood.service";

// ======================================================
// GET HOSPITAL BLOOD INVENTORY
// ======================================================

export const getBloodInventory = async (
  req: Request,
  res: Response
) => {
  try {
    const hospitalId = req.params.hospitalId;

    if (typeof hospitalId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID",
      });
    }

    const inventory =
      await getHospitalBloodInventory(
        hospitalId
      );

    return res.status(200).json({
      success: true,
      data: {
        inventory,
      },
    });
  } catch (error) {
    console.error(
      "Get blood inventory error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch blood inventory";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

// ======================================================
// UPDATE BLOOD INVENTORY
// ======================================================

export const updateBlood = async (
  req: Request,
  res: Response
) => {
  try {
    const hospitalId =
      req.params.hospitalId;

    const {
      bloodGroup,
      units,
    } = req.body;

    if (
      typeof hospitalId !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID",
      });
    }

    const validBloodGroups = [
      "A_POSITIVE",
      "A_NEGATIVE",
      "B_POSITIVE",
      "B_NEGATIVE",
      "AB_POSITIVE",
      "AB_NEGATIVE",
      "O_POSITIVE",
      "O_NEGATIVE",
    ];

    if (
      typeof bloodGroup !== "string" ||
      !validBloodGroups.includes(
        bloodGroup
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid blood group",
      });
    }

    if (
      typeof units !== "number" ||
      !Number.isInteger(units) ||
      units < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Units must be a non-negative integer",
      });
    }

    const inventory =
      await updateBloodInventory(
        hospitalId,
        bloodGroup as
          | "A_POSITIVE"
          | "A_NEGATIVE"
          | "B_POSITIVE"
          | "B_NEGATIVE"
          | "AB_POSITIVE"
          | "AB_NEGATIVE"
          | "O_POSITIVE"
          | "O_NEGATIVE",
        units
      );

    return res.status(200).json({
      success: true,
      message:
        "Blood inventory updated successfully",
      data: {
        inventory,
      },
    });
  } catch (error) {
    console.error(
      "Update blood inventory error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update blood inventory";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

// ======================================================
// GET BLOOD AVAILABILITY SUMMARY
// ======================================================

export const getBloodSummary = async (
  req: Request,
  res: Response
) => {
  try {
    const hospitalId =
      req.params.hospitalId;

    if (
      typeof hospitalId !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid hospital ID",
      });
    }

    const summary =
      await getBloodAvailabilitySummary(
        hospitalId
      );

    return res.status(200).json({
      success: true,
      data: {
        summary,
      },
    });
  } catch (error) {
    console.error(
      "Get blood summary error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch blood availability";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};