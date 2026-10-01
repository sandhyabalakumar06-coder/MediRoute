import {
  PrismaClient,
  Role,
  HospitalStatus,
  EmergencyDepartmentStatus,
  AmbulanceStatus,
  BloodGroup,
} from "@prisma/client";

import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("========================================");
  console.log("MediRoute Demo Seed");
  console.log("========================================");

  const passwordHash = await bcrypt.hash("Demo@123456", 10);

  // =====================================================
  // 1. DEMO USERS
  // =====================================================

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@mediroute.demo",
    },
    update: {
      name: "MediRoute Admin",
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      name: "MediRoute Admin",
      email: "admin@mediroute.demo",
      passwordHash,
      phone: "9000000001",
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const hospitalUser = await prisma.user.upsert({
    where: {
      email: "hospital@mediroute.demo",
    },
    update: {
      name: "Green Valley Hospital",
      passwordHash,
      role: Role.HOSPITAL,
      isActive: true,
    },
    create: {
      name: "Green Valley Hospital",
      email: "hospital@mediroute.demo",
      passwordHash,
      phone: "9000000002",
      role: Role.HOSPITAL,
      isActive: true,
    },
  });

  const ambulanceUser = await prisma.user.upsert({
    where: {
      email: "ambulance@mediroute.demo",
    },
    update: {
      name: "Demo Ambulance Operator",
      passwordHash,
      role: Role.AMBULANCE_OPERATOR,
      isActive: true,
    },
    create: {
      name: "Demo Ambulance Operator",
      email: "ambulance@mediroute.demo",
      passwordHash,
      phone: "9000000003",
      role: Role.AMBULANCE_OPERATOR,
      isActive: true,
    },
  });

  const coordinator = await prisma.user.upsert({
    where: {
      email: "coordinator@mediroute.demo",
    },
    update: {
      name: "Emergency Coordinator",
      passwordHash,
      role: Role.EMERGENCY_COORDINATOR,
      isActive: true,
    },
    create: {
      name: "Emergency Coordinator",
      email: "coordinator@mediroute.demo",
      passwordHash,
      phone: "9000000004",
      role: Role.EMERGENCY_COORDINATOR,
      isActive: true,
    },
  });

  const patient = await prisma.user.upsert({
    where: {
      email: "patient@mediroute.demo",
    },
    update: {
      name: "Demo Patient",
      passwordHash,
      role: Role.PATIENT,
      isActive: true,
    },
    create: {
      name: "Demo Patient",
      email: "patient@mediroute.demo",
      passwordHash,
      phone: "9000000005",
      role: Role.PATIENT,
      isActive: true,
    },
  });

  console.log("Demo users created.");

  // =====================================================
  // 2. AMBULANCE OPERATOR
  // =====================================================

  const ambulanceOperator = await prisma.ambulanceOperator.upsert({
    where: {
      userId: ambulanceUser.id,
    },
    update: {
      licenseNumber: "TN-AMBU-DEMO-001",
    },
    create: {
      id: "demo-ambulance-operator-001",
      userId: ambulanceUser.id,
      licenseNumber: "TN-AMBU-DEMO-001",
      updatedAt: new Date(),
    },
  });

  // =====================================================
  // 3. COIMBATORE HOSPITAL
  // =====================================================

  const coimbatoreHospital = await prisma.hospital.upsert({
    where: {
      userId: hospitalUser.id,
    },
    update: {
      name: "Green Valley Medical Center",
      address: "Gandhipuram, Coimbatore",
      city: "Coimbatore",
      latitude: 11.0183,
      longitude: 76.9725,
      status: HospitalStatus.ACTIVE,
      emergencyDepartment: EmergencyDepartmentStatus.AVAILABLE,
      icuBedsTotal: 15,
      icuBedsAvailable: 8,
      generalBedsTotal: 80,
      generalBedsAvailable: 42,
      lastUpdated: new Date(),
    },
    create: {
      userId: hospitalUser.id,
      name: "Green Valley Medical Center",
      phone: "9000000010",
      email: "hospital@mediroute.demo",
      address: "Gandhipuram, Coimbatore",
      city: "Coimbatore",
      latitude: 11.0183,
      longitude: 76.9725,
      status: HospitalStatus.ACTIVE,
      emergencyDepartment: EmergencyDepartmentStatus.AVAILABLE,
      icuBedsTotal: 15,
      icuBedsAvailable: 8,
      generalBedsTotal: 80,
      generalBedsAvailable: 42,
      lastUpdated: new Date(),
    },
  });

  // =====================================================
  // 4. COIMBATORE BLOOD INVENTORY
  // =====================================================

  await prisma.bloodInventory.upsert({
    where: {
      hospitalId_bloodGroup: {
        hospitalId: coimbatoreHospital.id,
        bloodGroup: BloodGroup.O_POSITIVE,
      },
    },
    update: {
      units: 12,
      lastUpdated: new Date(),
    },
    create: {
      hospitalId: coimbatoreHospital.id,
      bloodGroup: BloodGroup.O_POSITIVE,
      units: 12,
      lastUpdated: new Date(),
    },
  });

  await prisma.bloodInventory.upsert({
    where: {
      hospitalId_bloodGroup: {
        hospitalId: coimbatoreHospital.id,
        bloodGroup: BloodGroup.AB_NEGATIVE,
      },
    },
    update: {
      units: 4,
      lastUpdated: new Date(),
    },
    create: {
      hospitalId: coimbatoreHospital.id,
      bloodGroup: BloodGroup.AB_NEGATIVE,
      units: 4,
      lastUpdated: new Date(),
    },
  });

  // =====================================================
  // 5. CHENNAI DEMO HOSPITAL
  // =====================================================

  let chennaiHospital = await prisma.hospital.findFirst({
    where: {
      name: "Chennai Emergency Medical Center",
    },
  });

  if (chennaiHospital) {
    chennaiHospital = await prisma.hospital.update({
      where: {
        id: chennaiHospital.id,
      },
      data: {
        address: "Anna Nagar, Chennai",
        city: "Chennai",
        latitude: 13.0827,
        longitude: 80.2707,
        status: HospitalStatus.ACTIVE,
        emergencyDepartment: EmergencyDepartmentStatus.AVAILABLE,
        icuBedsTotal: 20,
        icuBedsAvailable: 10,
        generalBedsTotal: 100,
        generalBedsAvailable: 50,
        lastUpdated: new Date(),
      },
    });
  } else {
    chennaiHospital = await prisma.hospital.create({
      data: {
        name: "Chennai Emergency Medical Center",
        phone: "9000000021",
        email: "chennai@mediroute.demo",
        address: "Anna Nagar, Chennai",
        city: "Chennai",
        latitude: 13.0827,
        longitude: 80.2707,
        status: HospitalStatus.ACTIVE,
        emergencyDepartment: EmergencyDepartmentStatus.AVAILABLE,
        icuBedsTotal: 20,
        icuBedsAvailable: 10,
        generalBedsTotal: 100,
        generalBedsAvailable: 50,
        lastUpdated: new Date(),
      },
    });
  }

  console.log("Chennai hospital created/updated.");

  // =====================================================
  // 6. CHENNAI BLOOD INVENTORY
  // =====================================================

  await prisma.bloodInventory.upsert({
    where: {
      hospitalId_bloodGroup: {
        hospitalId: chennaiHospital.id,
        bloodGroup: BloodGroup.AB_NEGATIVE,
      },
    },
    update: {
      units: 8,
      lastUpdated: new Date(),
    },
    create: {
      hospitalId: chennaiHospital.id,
      bloodGroup: BloodGroup.AB_NEGATIVE,
      units: 8,
      lastUpdated: new Date(),
    },
  });

  await prisma.bloodInventory.upsert({
    where: {
      hospitalId_bloodGroup: {
        hospitalId: chennaiHospital.id,
        bloodGroup: BloodGroup.O_POSITIVE,
      },
    },
    update: {
      units: 15,
      lastUpdated: new Date(),
    },
    create: {
      hospitalId: chennaiHospital.id,
      bloodGroup: BloodGroup.O_POSITIVE,
      units: 15,
      lastUpdated: new Date(),
    },
  });

  // =====================================================
  // 7. HOSPITAL DEPARTMENTS
  // =====================================================

  await prisma.hospitalDepartment.upsert({
    where: {
      hospitalId_name: {
        hospitalId: coimbatoreHospital.id,
        name: "Emergency",
      },
    },
    update: {
      isAvailable: true,
      updatedAt: new Date(),
    },
    create: {
      id: "demo-coimbatore-emergency-dept",
      hospitalId: coimbatoreHospital.id,
      name: "Emergency",
      isAvailable: true,
      updatedAt: new Date(),
    },
  });

  await prisma.hospitalDepartment.upsert({
    where: {
      hospitalId_name: {
        hospitalId: chennaiHospital.id,
        name: "Emergency",
      },
    },
    update: {
      isAvailable: true,
      updatedAt: new Date(),
    },
    create: {
      id: "demo-chennai-emergency-dept",
      hospitalId: chennaiHospital.id,
      name: "Emergency",
      isAvailable: true,
      updatedAt: new Date(),
    },
  });

  // =====================================================
  // 8. AMBULANCE
  // =====================================================

  await prisma.ambulance.upsert({
    where: {
      vehicleNumber: "TN38-MR-001",
    },
    update: {
      operatorId: ambulanceOperator.id,
      driverName: "Demo Ambulance Driver",
      phone: "9000000020",
      status: AmbulanceStatus.AVAILABLE,
      latitude: 11.0200,
      longitude: 76.9690,
      currentEta: 0,
      lastUpdated: new Date(),
    },
    create: {
      operatorId: ambulanceOperator.id,
      vehicleNumber: "TN38-MR-001",
      driverName: "Demo Ambulance Driver",
      phone: "9000000020",
      status: AmbulanceStatus.AVAILABLE,
      latitude: 11.0200,
      longitude: 76.9690,
      currentEta: 0,
      lastUpdated: new Date(),
    },
  });

  console.log("Demo ambulance ready.");

  // =====================================================
  // 9. DEMO PATIENT PROFILE
  // =====================================================

  await prisma.patientProfile.upsert({
    where: {
      userId: patient.id,
    },
    update: {
      bloodGroup: BloodGroup.AB_NEGATIVE,
      updatedAt: new Date(),
    },
    create: {
      id: "demo-patient-profile-001",
      userId: patient.id,
      bloodGroup: BloodGroup.AB_NEGATIVE,
      emergencyContactName: "Demo Emergency Contact",
      emergencyContactPhone: "9000000006",
      address: "Chennai, Tamil Nadu",
      latitude: 13.0827,
      longitude: 80.2707,
      updatedAt: new Date(),
    },
  });

  // =====================================================
  // FINISHED
  // =====================================================

  console.log("");
  console.log("========================================");
  console.log("MediRoute demo data ready!");
  console.log("========================================");
  console.log("");
  console.log("Demo Password: Demo@123456");
  console.log("");
  console.log("Admin       : admin@mediroute.demo");
  console.log("Hospital    : hospital@mediroute.demo");
  console.log("Ambulance   : ambulance@mediroute.demo");
  console.log("Coordinator : coordinator@mediroute.demo");
  console.log("Patient     : patient@mediroute.demo");
  console.log("");
  console.log("Hospitals:");
  console.log("- Green Valley Medical Center - Coimbatore");
  console.log("- Chennai Emergency Medical Center - Chennai");
  console.log("");
  console.log("Ambulance:");
  console.log("- TN38-MR-001");
  console.log("");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });