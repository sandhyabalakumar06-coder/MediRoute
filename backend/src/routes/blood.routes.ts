import { Router } from "express";

import {
  getBloodInventory,
  updateBlood,
  getBloodSummary,
} from "../controllers/blood.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// Get complete blood inventory
router.get(
  "/hospital/:hospitalId",
  getBloodInventory
);

// Update blood units
router.patch(
  "/hospital/:hospitalId",
  updateBlood
);

// Get availability summary
router.get(
  "/hospital/:hospitalId/summary",
  getBloodSummary
);

export default router;