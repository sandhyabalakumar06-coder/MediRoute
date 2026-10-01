import { Request, Response } from "express";
import { z } from "zod";

import {
  findAvailableHospitals,
} from "../services/availability.service";

const availabilitySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  requiredDepartment: z.boolean().optional(),
  needsICU: z.boolean().optional(),
});

export const getAvailableHospitals = async (
  req: Request,
  res: Response
) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    const requiredDepartment =
      req.query.requiredDepartment === "true";

    const needsICU =
      req.query.needsICU === "true";

    const data = availabilitySchema.parse({
      latitude,
      longitude,
      requiredDepartment,
      needsICU,
    });

    const hospitals =
      await findAvailableHospitals(data);

    return res.status(200).json({
      success: true,
      message:
        "Hospital availability calculated successfully",
      data: {
        hospitals,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid location parameters",
        errors: error.issues,
      });
    }

    console.error(
      "Hospital availability error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to calculate hospital availability",
    });
  }
};