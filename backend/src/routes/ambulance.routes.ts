import { Router } from "express";

import {
  getAmbulances,
  getAvailable,
  getAmbulance,
  assignAmbulance,
  startJourney,
  arrivedAtHospital,
  updateLocation,
} from "../controllers/ambulance.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// ======================================================
// AUTHENTICATION
// ======================================================

router.use(authenticate);

// ======================================================
// GET ALL AMBULANCES
// ======================================================

router.get(
  "/",
  getAmbulances
);

// ======================================================
// GET AVAILABLE AMBULANCES
// ======================================================

router.get(
  "/available",
  getAvailable
);

// ======================================================
// UPDATE AMBULANCE LOCATION
// ======================================================

router.patch(
  "/location/:id",
  updateLocation
);

// ======================================================
// ASSIGN AMBULANCE
// ======================================================

router.patch(
  "/assign/:emergencyId",
  assignAmbulance
);

// ======================================================
// START JOURNEY
// ======================================================

router.patch(
  "/start/:emergencyId",
  startJourney
);

// ======================================================
// ARRIVED AT HOSPITAL
// ======================================================

router.patch(
  "/arrived/:emergencyId",
  arrivedAtHospital
);

// ======================================================
// GET AMBULANCE BY ID
// ======================================================

router.get(
  "/:id",
  getAmbulance
);

export default router;