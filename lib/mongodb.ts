import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const client = await clientPromise
  const db = client.db("healthcare_db")

  // Create indexes for optimized search performance
  await createIndexes(db)

  return { client, db }
}

async function createIndexes(db: Db) {
  const collection = db.collection("patients")

  try {
    // Create indexes for commonly searched fields
    await collection.createIndex({ name: 1 })
    await collection.createIndex({ patientId: 1 }, { unique: true })
    await collection.createIndex({ "contactInfo.email": 1 })
    await collection.createIndex({ allergies: 1 })
    await collection.createIndex({ medicalHistory: 1 })
    await collection.createIndex({ createdAt: -1 })

    // Create text index for full-text search
    await collection.createIndex({
      name: "text",
      doctorNotes: "text",
      allergies: "text",
      medicalHistory: "text",
    })

    console.log("Database indexes created successfully")
  } catch (error) {
    console.log("Indexes may already exist:", error)
  }
}

export default clientPromise
