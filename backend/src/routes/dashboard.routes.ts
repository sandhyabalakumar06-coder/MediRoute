import { Router } from "express";

import {
  patientDashboard,
  hospitalDashboard,
  ambulanceDashboard,
  coordinatorDashboard,
  adminDashboard,
} from "../controllers/dashboard.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

// ======================================================
// PATIENT
// ======================================================

router.get(
  "/patient",
  authorizeRoles("PATIENT"),
  patientDashboard
);

// ======================================================
// HOSPITAL
// ======================================================

router.get(
  "/hospital",
  authorizeRoles("HOSPITAL"),
  hospitalDashboard
);

// ======================================================
// AMBULANCE OPERATOR
// ======================================================

router.get(
  "/ambulance",
  authorizeRoles("AMBULANCE_OPERATOR"),
  ambulanceDashboard
);

// ======================================================
// EMERGENCY COORDINATOR
// ======================================================

router.get(
  "/coordinator",
  authorizeRoles(
    "EMERGENCY_COORDINATOR",
    "ADMIN"
  ),
  coordinatorDashboard
);

// ======================================================
// ADMIN
// ======================================================

router.get(
  "/admin",
  authorizeRoles("ADMIN"),
  adminDashboard
);

export default router;