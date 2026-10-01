import { Router } from "express";

import {
  getAvailableHospitals,
} from "../controllers/availability.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getAvailableHospitals
);

export default router;