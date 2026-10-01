import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

// Routes
import authRoutes from "./routes/auth.routes";
import hospitalRoutes from "./routes/hospital.routes";
import availabilityRoutes from "./routes/availability.routes";
import emergencyRoutes from "./routes/emergency.routes";
import ambulanceRoutes from "./routes/ambulance.routes";
import notificationRoutes from "./routes/notification.routes";
import bloodRoutes from "./routes/blood.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import simulationRoutes from "./routes/simulation.routes";

const app = express();

/* ---------------------------------------------------
   SECURITY
--------------------------------------------------- */

app.use(helmet());

/* ---------------------------------------------------
   CORS
--------------------------------------------------- */

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:3000",

    credentials: true,
  })
);

/* ---------------------------------------------------
   BODY PARSING
--------------------------------------------------- */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* ---------------------------------------------------
   LOGGING
--------------------------------------------------- */

app.use(morgan("dev"));

/* ---------------------------------------------------
   COMPRESSION
--------------------------------------------------- */

app.use(compression());

/* ---------------------------------------------------
   RATE LIMITING
--------------------------------------------------- */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 200,

  standardHeaders: true,

  legacyHeaders: false,
});

app.use(limiter);

/* ===================================================
   API ROUTES
=================================================== */

/* Authentication */
app.use(
  "/api/auth",
  authRoutes
);

/* Hospitals */
app.use(
  "/api/hospitals",
  hospitalRoutes
);

/* Hospital availability */
app.use(
  "/api/availability",
  availabilityRoutes
);

/* Emergency requests */
app.use(
  "/api/emergencies",
  emergencyRoutes
);

/* Ambulances */
app.use(
  "/api/ambulances",
  ambulanceRoutes
);

/* Notifications */
app.use(
  "/api/notifications",
  notificationRoutes
);

/* Blood inventory */
app.use(
  "/api/blood",
  bloodRoutes
);

/* Dashboards */
app.use(
  "/api/dashboard",
  dashboardRoutes
);

/* Demo emergency simulation */
app.use(
  "/api/simulation",
  simulationRoutes
);

/* ===================================================
   ROOT ROUTE
=================================================== */

app.get(
  "/",
  (_req, res) => {
    res.json({
      success: true,

      message:
        "MediRoute Backend is running",
    });
  }
);

/* ===================================================
   HEALTH CHECK
=================================================== */

app.get(
  "/api/health",
  (_req, res) => {
    res.json({
      success: true,

      message:
        "MediRoute API is healthy",

      timestamp:
        new Date().toISOString(),
    });
  }
);

/* ===================================================
   TEST AVAILABILITY
=================================================== */

app.get(
  "/api/test-availability",
  (_req, res) => {
    res.json({
      success: true,

      message:
        "Availability route is being loaded",
    });
  }
);

/* ===================================================
   404 HANDLER
=================================================== */

app.use(
  (_req, res) => {
    res.status(404).json({
      success: false,

      message:
        "API endpoint not found",
    });
  }
);

/* ===================================================
   EXPORT
=================================================== */

export default app;