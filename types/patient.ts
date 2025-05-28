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
