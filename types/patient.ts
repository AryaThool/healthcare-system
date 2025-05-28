export interface Patient {
  _id?: string
  patientId: string
  name: string
  dateOfBirth: string
  gender: string
  contactInfo: {
    phone: string
    email: string
    address: string
  }
  allergies: string[]
  medicalHistory: string[]
  currentPrescriptions: string[]
  doctorNotes: string
  createdAt?: string
  updatedAt?: string
}

export interface AuditLog {
  _id?: string
  action: "CREATE_PATIENT" | "UPDATE_PATIENT" | "DELETE_PATIENT"
  patientId: string
  timestamp: string
  details: any
}

export interface SearchParams {
  page: number
  limit: number
  search: string
  field: string
}

export interface PatientStats {
  totalPatients: number
  ageStatistics: {
    avgAge: number
    minAge: number
    maxAge: number
  }
  genderDistribution: Array<{
    _id: string
    count: number
  }>
  commonAllergies: Array<{
    _id: string
    count: number
  }>
  recentActivity: AuditLog[]
}
