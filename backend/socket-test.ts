import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

console.log("Connecting to MediRoute Socket.IO...");

// ======================================================
// CONNECT
// ======================================================

socket.on("connect", () => {
  console.log(
    "✅ Connected to Socket.IO"
  );

  console.log(
    "Socket ID:",
    socket.id
  );

  // Join our demo emergency room
  socket.emit(
    "join-emergency",
    "e06ca85a-0316-406f-a943-c1dd0196e224"
  );

  console.log(
    "Joined emergency room"
  );
});

// ======================================================
// AMBULANCE LOCATION UPDATE
// ======================================================

socket.on(
  "ambulance-location-updated",
  (data) => {
    console.log(
      "🚑 Ambulance location updated:"
    );

    console.log(data);
  }
);

// ======================================================
// EMERGENCY UPDATE
// ======================================================

socket.on(
  "emergency-updated",
  (data) => {
    console.log(
      "🚨 Emergency updated:"
    );

    console.log(data);
  }
);

// ======================================================
// EMERGENCY STATUS UPDATE
// ======================================================

socket.on(
  "emergency-status-updated",
  (data) => {
    console.log(
      "📢 Emergency status updated:"
    );

    console.log(data);
  }
);

// ======================================================
// CONNECTION ERROR
// ======================================================

socket.on(
  "connect_error",
  (error) => {
    console.error(
      "❌ Socket connection error:",
      error.message
    );
  }
);

// ======================================================
// DISCONNECT
// ======================================================

socket.on(
  "disconnect",
  (reason) => {
    console.log(
      "Socket disconnected:",
      reason
    );
  }
);