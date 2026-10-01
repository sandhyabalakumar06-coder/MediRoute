import { Router } from "express";

import {
  getHospitals,
  getHospital,
  addHospital,
} from "../controllers/hospital.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Get all hospitals
router.get("/", authenticate, getHospitals);

// Get hospital by ID
router.get("/:id", authenticate, getHospital);

// Create hospital
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "HOSPITAL"),
  addHospital
);

export default router;