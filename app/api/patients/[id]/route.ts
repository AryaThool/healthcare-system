import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 })
    }

    const patient = await db.collection("patients").findOne({
      _id: new ObjectId(id),
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params
    const updateData = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 })
    }

    // Get current patient data for comparison
    const currentPatient = await db.collection("patients").findOne({
      _id: new ObjectId(id),
    })

    if (!currentPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Prepare update operations using MongoDB operators
    const updateOperations: any = {
      $set: {
        ...updateData,
        updatedAt: new Date().toISOString(),
      },
    }

    // Handle array operations for allergies, medical history, and prescriptions
    if (updateData.allergies && Array.isArray(updateData.allergies)) {
      updateOperations.$set.allergies = updateData.allergies
    }

    if (updateData.medicalHistory && Array.isArray(updateData.medicalHistory)) {
      updateOperations.$set.medicalHistory = updateData.medicalHistory
    }

    if (updateData.currentPrescriptions && Array.isArray(updateData.currentPrescriptions)) {
      updateOperations.$set.currentPrescriptions = updateData.currentPrescriptions
    }

    const result = await db.collection("patients").updateOne({ _id: new ObjectId(id) }, updateOperations)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Log the action for auditing
    await db.collection("audit_logs").insertOne({
      action: "UPDATE_PATIENT",
      patientId: currentPatient.patientId,
      timestamp: new Date().toISOString(),
      details: {
        updatedFields: Object.keys(updateData),
        modifiedCount: result.modifiedCount,
      },
    })

    return NextResponse.json({
      message: "Patient updated successfully",
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 })
    }

    // Get patient data before deletion for logging
    const patient = await db.collection("patients").findOne({
      _id: new ObjectId(id),
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const result = await db.collection("patients").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Log the deletion for auditing and compliance
    await db.collection("audit_logs").insertOne({
      action: "DELETE_PATIENT",
      patientId: patient.patientId,
      timestamp: new Date().toISOString(),
      details: {
        deletedPatient: {
          name: patient.name,
          patientId: patient.patientId,
          deletedAt: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({
      message: "Patient deleted successfully",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}
