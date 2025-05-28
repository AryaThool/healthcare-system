import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const searchParams = request.nextUrl.searchParams

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const field = searchParams.get("field") || "name"

    const skip = (page - 1) * limit

    // Build search query
    const query: any = {}
    if (search) {
      switch (field) {
        case "name":
          query.name = { $regex: search, $options: "i" }
          break
        case "patientId":
          query.patientId = { $regex: search, $options: "i" }
          break
        case "allergies":
          query.allergies = { $in: [new RegExp(search, "i")] }
          break
        case "medicalHistory":
          query.medicalHistory = { $in: [new RegExp(search, "i")] }
          break
        default:
          query.$or = [{ name: { $regex: search, $options: "i" } }, { patientId: { $regex: search, $options: "i" } }]
      }
    }

    // Get total count for pagination
    const total = await db.collection("patients").countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Fetch patients with pagination and sorting
    const patients = await db
      .collection("patients")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      patients,
      currentPage: page,
      totalPages,
      total,
    })
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const patientData = await request.json()

    // Validate required fields
    if (!patientData.patientId || !patientData.name) {
      return NextResponse.json({ error: "Patient ID and name are required" }, { status: 400 })
    }

    // Check if patient ID already exists
    const existingPatient = await db.collection("patients").findOne({
      patientId: patientData.patientId,
    })

    if (existingPatient) {
      return NextResponse.json({ error: "Patient ID already exists" }, { status: 400 })
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
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}
