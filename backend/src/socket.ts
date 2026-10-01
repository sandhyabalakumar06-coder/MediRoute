import { Server } from "socket.io";

let io: Server | null = null;

/* ==================================================
   INITIALIZE SOCKET.IO
================================================== */

export const initializeSocket = (
  socketServer: Server
) => {
  io = socketServer;

  console.log(
    "Socket.IO service initialized"
  );
};

/* ==================================================
   GET SOCKET.IO INSTANCE
================================================== */

export const getIO = (): Server => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized"
    );
  }

  return io;
};

/* ==================================================
   EMERGENCY UPDATE
================================================== */

export const emitEmergencyUpdate = (
  emergencyId: string,
  data: unknown
) => {
  const socket = getIO();

  // Main emergency room
  socket
    .to(`emergency:${emergencyId}`)
    .emit(
      "emergency-updated",
      data
    );

  // Also emit status event so dashboards
  // that listen specifically for status changes
  // can refresh immediately.
  socket
    .to(`emergency:${emergencyId}`)
    .emit(
      "emergency-status-updated",
      data
    );
};

/* ==================================================
   EXPLICIT EMERGENCY STATUS UPDATE
================================================== */

export const emitEmergencyStatusUpdate = (
  emergencyId: string,
  data: unknown
) => {
  getIO()
    .to(`emergency:${emergencyId}`)
    .emit(
      "emergency-status-updated",
      data
    );
};

/* ==================================================
   AMBULANCE LOCATION UPDATE
================================================== */

export const emitAmbulanceLocationUpdate = (
  emergencyId: string,
  data: unknown
) => {
  getIO()
    .to(`emergency:${emergencyId}`)
    .emit(
      "ambulance-location-updated",
      data
    );
};

/* ==================================================
   HOSPITAL UPDATE
================================================== */

export const emitHospitalUpdate = (
  hospitalId: string,
  data: unknown
) => {
  getIO()
    .to(`hospital:${hospitalId}`)
    .emit(
      "hospital-updated",
      data
    );
};

/* ==================================================
   NOTIFICATION UPDATE
================================================== */

export const emitNotificationUpdate = (
  userId: string,
  data: unknown
) => {
  getIO()
    .to(`user:${userId}`)
    .emit(
      "notification-created",
      data
    );
};