import { Router } from "express";

import {
  getHospitalNotificationList,
  getUserNotificationList,
  notifyHospitalForEmergencyRequest,
} from "../controllers/notification.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// ======================================================
// AUTHENTICATION
// ======================================================

router.use(authenticate);

// ======================================================
// NOTIFY HOSPITAL FOR EMERGENCY
// ======================================================

router.patch(
  "/hospital/notify/:emergencyId",
  notifyHospitalForEmergencyRequest
);

// ======================================================
// GET HOSPITAL NOTIFICATIONS
// ======================================================

router.get(
  "/hospital/:hospitalId",
  getHospitalNotificationList
);

// ======================================================
// GET USER NOTIFICATIONS
// ======================================================

router.get(
  "/user/:userId",
  getUserNotificationList
);

export default router;