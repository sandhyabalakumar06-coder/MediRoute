import { Router } from "express";

import {
  createEmergencyRequest,
  getEmergency,
  getMyEmergencies,
  selectHospital,
} from "../controllers/emergency.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// Create emergency
router.post(
  "/",
  createEmergencyRequest
);

// Get patient's emergencies
router.get(
  "/my",
  getMyEmergencies
);

// Select hospital for emergency
router.patch(
  "/:id/hospital",
  selectHospital
);

// Get emergency by ID
router.get(
  "/:id",
  getEmergency
);

export default router;