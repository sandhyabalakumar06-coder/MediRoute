import { Router } from "express";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorizeRoles,
} from "../middleware/role.middleware";

import {
  createDemoEmergencyController,
} from "../controllers/simulation.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/demo-emergency",
  authorizeRoles(
    "EMERGENCY_COORDINATOR",
    "ADMIN"
  ),
  createDemoEmergencyController
);

export default router;