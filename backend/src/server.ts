import dotenv from "dotenv";

dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./app";
import { initializeSocket } from "./socket";

const PORT = Number(process.env.PORT) || 5000;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:3000";

// ==========================================
// CREATE HTTP SERVER
// ==========================================

const httpServer = http.createServer(app);

// ==========================================
// CREATE SOCKET.IO SERVER
// ==========================================

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: [
      "GET",
      "POST",
      "PATCH",
      "PUT",
      "DELETE",
    ],
    credentials: true,
  },
});

// ==========================================
// INITIALIZE SOCKET SERVICE
// ==========================================

initializeSocket(io);

// ==========================================
// SOCKET CONNECTION
// ==========================================

io.on("connection", (socket) => {
  console.log(
    `Socket connected: ${socket.id}`
  );

  // ========================================
  // JOIN EMERGENCY ROOM
  // ========================================

  socket.on(
    "join-emergency",
    (emergencyId: string) => {
      if (!emergencyId) {
        return;
      }

      socket.join(
        `emergency:${emergencyId}`
      );

      console.log(
        `Socket ${socket.id} joined emergency:${emergencyId}`
      );
    }
  );

  // ========================================
  // LEAVE EMERGENCY ROOM
  // ========================================

  socket.on(
    "leave-emergency",
    (emergencyId: string) => {
      if (!emergencyId) {
        return;
      }

      socket.leave(
        `emergency:${emergencyId}`
      );

      console.log(
        `Socket ${socket.id} left emergency:${emergencyId}`
      );
    }
  );

  // ========================================
  // JOIN HOSPITAL ROOM
  // ========================================

  socket.on(
    "join-hospital",
    (hospitalId: string) => {
      if (!hospitalId) {
        return;
      }

      socket.join(
        `hospital:${hospitalId}`
      );

      console.log(
        `Socket ${socket.id} joined hospital:${hospitalId}`
      );
    }
  );

  // ========================================
  // LEAVE HOSPITAL ROOM
  // ========================================

  socket.on(
    "leave-hospital",
    (hospitalId: string) => {
      if (!hospitalId) {
        return;
      }

      socket.leave(
        `hospital:${hospitalId}`
      );

      console.log(
        `Socket ${socket.id} left hospital:${hospitalId}`
      );
    }
  );

  // ========================================
  // AMBULANCE LOCATION UPDATE
  // ========================================

  socket.on(
    "ambulance-location-update",
    (data) => {
      console.log(
        "Ambulance location update:",
        data
      );

      if (
        !data ||
        !data.emergencyId
      ) {
        return;
      }

      // Send to patient emergency room
      io.to(
        `emergency:${data.emergencyId}`
      ).emit(
        "ambulance-location-updated",
        data
      );

      // Send to hospital room
      if (data.hospitalId) {
        io.to(
          `hospital:${data.hospitalId}`
        ).emit(
          "ambulance-location-updated",
          data
        );
      }
    }
  );

  // ========================================
  // EMERGENCY STATUS UPDATE
  // ========================================

  socket.on(
    "emergency-status-update",
    (data) => {
      console.log(
        "Emergency status update:",
        data
      );

      if (
        !data ||
        !data.emergencyId
      ) {
        return;
      }

      // Patient emergency room
      io.to(
        `emergency:${data.emergencyId}`
      ).emit(
        "emergency-status-updated",
        data
      );

      // Also send generic emergency update
      io.to(
        `emergency:${data.emergencyId}`
      ).emit(
        "emergency-updated",
        data
      );

      // Hospital room
      if (data.hospitalId) {
        io.to(
          `hospital:${data.hospitalId}`
        ).emit(
          "emergency-status-updated",
          data
        );
      }
    }
  );

  // ========================================
  // EMERGENCY UPDATE
  // ========================================

  socket.on(
    "emergency-update",
    (data) => {
      console.log(
        "Emergency update:",
        data
      );

      if (
        !data ||
        !data.emergencyId
      ) {
        return;
      }

      io.to(
        `emergency:${data.emergencyId}`
      ).emit(
        "emergency-updated",
        data
      );

      if (data.hospitalId) {
        io.to(
          `hospital:${data.hospitalId}`
        ).emit(
          "emergency-updated",
          data
        );
      }
    }
  );

  // ========================================
  // HOSPITAL UPDATE
  // ========================================

  socket.on(
    "hospital-update",
    (data) => {
      console.log(
        "Hospital update:",
        data
      );

      if (
        !data ||
        !data.hospitalId
      ) {
        return;
      }

      io.to(
        `hospital:${data.hospitalId}`
      ).emit(
        "hospital-updated",
        data
      );
    }
  );

  // ========================================
  // TEST EVENT
  // ========================================

  socket.on(
    "ping-mediroute",
    () => {
      socket.emit(
        "pong-mediroute",
        {
          message:
            "MediRoute Socket.IO is working",
          timestamp:
            new Date().toISOString(),
        }
      );
    }
  );

  // ========================================
  // DISCONNECT
  // ========================================

  socket.on(
    "disconnect",
    (reason) => {
      console.log(
        `Socket disconnected: ${socket.id}`,
        reason
      );
    }
  );
});

// ==========================================
// START SERVER
// ==========================================

httpServer.listen(
  PORT,
  () => {
    console.log(`
========================================
        MEDIROUTE BACKEND
========================================

Server:
http://localhost:${PORT}

Health:
http://localhost:${PORT}/api/health

Socket.IO:
Enabled

Frontend:
${FRONTEND_URL}

========================================
`);
  }
);

// ==========================================
// SERVER ERROR
// ==========================================

httpServer.on(
  "error",
  (error) => {
    console.error(
      "HTTP Server Error:",
      error
    );
  }
);