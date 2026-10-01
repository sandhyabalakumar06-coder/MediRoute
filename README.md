🚑 MediRoute
Emergency Patient Routing & Hospital Coordination Platform

MediRoute is a full-stack web application designed to demonstrate how emergency requests can be coordinated between patients, emergency coordinators, hospitals, and ambulance operators through a centralized platform.

The system provides hospital availability information, ICU/general-bed visibility, blood inventory visibility, ambulance assignment, emergency status management, and simulated real-time ambulance tracking.

Medical Disclaimer: MediRoute is a college/demo platform for emergency coordination and healthcare resource availability. It does not provide medical diagnosis or treatment advice. It is not a replacement for local emergency services or qualified healthcare professionals.

📌 Project Overview

During an emergency, coordination between patients, hospitals, ambulance operators and emergency coordinators can be difficult when information is distributed across different channels.

MediRoute provides a single web platform where:

Patient → Emergency Request → Hospital Availability → Hospital Selection → Ambulance Assignment → Live Journey → Hospital Pre-Arrival Alert → Arrival

The project uses simulated hospital, ambulance and healthcare-resource data for demonstration purposes.

🎯 Objectives
Centralize emergency coordination.
Allow patients to create emergency requests.
Display available hospitals based on location and resource availability.
Calculate a Hospital Availability Score.
Display ICU and general-bed availability.
Display blood inventory information.
Allow coordinators to select hospitals.
Allow coordinators to assign ambulances.
Provide ambulance journey management.
Provide simulated real-time ambulance tracking.
Notify hospitals about incoming emergencies.
Provide role-based dashboards.
Provide administrative management.

🔄 Emergency Workflow
Patient
   ↓
Create Emergency
   ↓
Emergency Coordinator
   ↓
Hospital Availability Calculation
   ↓
Select Hospital
   ↓
Assign Ambulance
   ↓
Ambulance Operator
   ↓
Start Journey
   ↓
Simulated Live Movement
   ↓
Hospital Pre-Arrival Notification
   ↓
Arrive at Hospital
   ↓
Emergency Status Updated
🧑‍💻 User Roles
Role	Main Responsibility
PATIENT	Create and track emergency requests
EMERGENCY_COORDINATOR	Coordinate hospitals and ambulances
HOSPITAL	Monitor incoming emergencies and resources
AMBULANCE_OPERATOR	Manage ambulance journey and location
ADMIN	Manage system-level resources

Public registration creates PATIENT accounts. Staff/admin roles are controlled separately.

🛠️ Technology Stack
Frontend
Next.js 15
React
TypeScript
Tailwind CSS
Shadcn/ui
Lucide Icons
Framer Motion
Recharts
Axios
Leaflet
React Leaflet
Socket.IO Client
Backend
Node.js
Express.js
TypeScript
Prisma ORM
PostgreSQL
JWT
bcryptjs
Zod
Helmet
CORS
Morgan
Compression
Express Rate Limit
Socket.IO
Database & Cloud
PostgreSQL
Neon
GitHub
Render
Vercel



🌐 Live Project
Frontend

https://mediroute-kappa.vercel.app

Backend

https://mediroute-backend-wmjx.onrekonnder.com

GitHub

https://github.com/sandhyabalakumar06-coder/MediRoute

🚀 Future Enhancements

Possible future improvements include:

Real hospital API integration.
Real ambulance/GPS integration.
SMS and push notifications.
Multilingual support.
Tamil language support.
Advanced audit and compliance features.
Automated hospital resource synchronization.
Real traffic-aware route optimization.
Production monitoring and observability.
Integration with verified emergency-service systems.
👩‍💻 Project

Project Name: MediRoute

Project Type: Web Programming / Full-Stack Application

Domain: Healthcare Emergency Coordination

Primary Focus: Emergency routing, hospital coordination and ambulance tracking

📚 Technology References
Next.js — React framework for full-stack web applications.
Prisma — Type-safe ORM and database migration tooling.
Socket.IO — Real-time bidirectional communication.
Vercel — Next.js deployment platform.
⭐ Acknowledgement

MediRoute was developed as an academic full-stack web programming project to demonstrate how modern web technologies can be combined to build an emergency coordination workflow.
