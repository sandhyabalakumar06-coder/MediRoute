import { Request, Response } from "express";

import {
  createDemoEmergency,
} from "../services/simulation.service";

export const createDemoEmergencyController =
  async (
    _req: Request,
    res: Response
  ) => {
    try {
      const result =
        await createDemoEmergency();

      return res.status(201).json({
        success: true,

        message:
          "Demo emergency created successfully",

        data: result,
      });
    } catch (error: any) {
      console.error(
        "Demo emergency error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Failed to create demo emergency",
      });
    }
  };