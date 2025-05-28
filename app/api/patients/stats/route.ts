import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get various statistics about the patient database
    const totalPatients = await db.collection("patients").countDocuments()

    // Age distribution
    const ageStats = await db
      .collection("patients")
      .aggregate([
        {
          $group: {
            _id: null,
            avgAge: { $avg: "$age" },
            minAge: { $min: "$age" },
            maxAge: { $max: "$age" },
          },
        },
      ])
      .toArray()

    // Gender distribution
    const genderStats = await db
      .collection("patients")
      .aggregate([
        {
          $group: {
            _id: "$gender",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Most common allergies
    const allergyStats = await db
      .collection("patients")
      .aggregate([
        { $unwind: "$allergies" },
        {
          $group: {
            _id: "$allergies",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    // Recent activity from audit logs
    const recentActivity = await db
      .collection("audit_logs")
      .aggregate([{ $sort: { timestamp: -1 } }, { $limit: 10 }])
      .toArray()

    return NextResponse.json({
      totalPatients,
      ageStatistics: ageStats[0] || { avgAge: 0, minAge: 0, maxAge: 0 },
      genderDistribution: genderStats,
      commonAllergies: allergyStats,
      recentActivity,
    })
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
