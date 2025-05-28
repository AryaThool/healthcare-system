import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/utils/db"

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const patientData = await request.json()

    // Validate required fields
    if (!patientData.patientId || !patientData.name || !patientData.dateOfBirth) {
      return NextResponse.json(
        {
          error: "Patient ID, name, and date of birth are required",
        },
        { status: 400 },
      )
    }

    // Validate patient ID format
    if (!/^P\d{3,6}$/.test(patientData.patientId)) {
      return NextResponse.json(
        {
          error: "Patient ID must be in format P001-P999999",
        },
        { status: 400 },
      )
    }

    // Validate email format
    if (patientData.contactInfo?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.contactInfo.email)) {
      return NextResponse.json(
        {
          error: "Please provide a valid email address",
        },
        { status: 400 },
      )
    }

    // Check if patient ID already exists
    const existingPatient = await db.collection("patients").findOne({
      patientId: patientData.patientId,
    })

    if (existingPatient) {
      return NextResponse.json(
        {
          error: "Patient ID already exists. Please use a different ID.",
        },
        { status: 400 },
      )
    }

    // Check if email already exists
    if (patientData.contactInfo?.email) {
      const existingEmail = await db.collection("patients").findOne({
        "contactInfo.email": patientData.contactInfo.email,
      })

      if (existingEmail) {
        return NextResponse.json(
          {
            error: "Email address already exists in the system.",
          },
          { status: 400 },
        )
      }
    }

    // Add timestamps
    const newPatient = {
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection("patients").insertOne(newPatient)

    // Log the action for auditing
    await db.collection("audit_logs").insertOne({
      action: "CREATE_PATIENT",
      patientId: patientData.patientId,
      timestamp: new Date().toISOString(),
      details: { insertedId: result.insertedId },
    })

    return NextResponse.json({
      message: "Patient created successfully",
      patientId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating patient:", error)
    return NextResponse.json(
      {
        error: "Failed to create patient. Please try again.",
      },
      { status: 500 },
    )
  }
}
