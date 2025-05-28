import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query") || ""

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // Example of using .explain() to analyze query performance
    const collection = db.collection("patients")

    // Build the query
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { patientId: { $regex: query, $options: "i" } },
        { allergies: { $in: [new RegExp(query, "i")] } },
        { medicalHistory: { $in: [new RegExp(query, "i")] } },
      ],
    }

    // Get query execution stats
    const explanation = await collection.find(searchQuery).explain("executionStats")

    // Get the actual results
    const results = await collection.find(searchQuery).limit(10).toArray()

    return NextResponse.json({
      results,
      performance: {
        totalDocsExamined: explanation.executionStats.totalDocsExamined,
        totalDocsReturned: explanation.executionStats.totalDocsReturned,
        executionTimeMillis: explanation.executionStats.executionTimeMillis,
        indexesUsed: explanation.executionStats.indexesUsed || "No specific indexes reported",
      },
      suggestions: generateOptimizationSuggestions(explanation),
    })
  } catch (error) {
    console.error("Error in optimization analysis:", error)
    return NextResponse.json({ error: "Failed to analyze query performance" }, { status: 500 })
  }
}

function generateOptimizationSuggestions(explanation: any): string[] {
  const suggestions: string[] = []
  const stats = explanation.executionStats

  if (stats.totalDocsExamined > stats.totalDocsReturned * 10) {
    suggestions.push("Consider adding more specific indexes to reduce document examination")
  }

  if (stats.executionTimeMillis > 100) {
    suggestions.push("Query execution time is high, consider optimizing indexes")
  }

  if (!stats.indexesUsed || stats.indexesUsed.length === 0) {
    suggestions.push("No indexes were used, consider creating appropriate indexes")
  }

  if (suggestions.length === 0) {
    suggestions.push("Query performance looks good!")
  }

  return suggestions
}
