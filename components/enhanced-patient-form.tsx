"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { FormField, FormInput, FormTextarea, FormSelect } from "@/components/ui/form-field"
import { validatePatientData } from "@/lib/validation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface Patient {
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

interface EnhancedPatientFormProps {
  formData: Omit<Patient, "_id" | "createdAt" | "updatedAt">
  setFormData: React.Dispatch<React.SetStateAction<Omit<Patient, "_id" | "createdAt" | "updatedAt">>>
  onSubmit: () => Promise<void>
  onArrayInput: (field: "allergies" | "medicalHistory" | "currentPrescriptions", value: string) => void
  submitLabel: string
  isSubmitting?: boolean
}

export function EnhancedPatientForm({
  formData,
  setFormData,
  onSubmit,
  onArrayInput,
  submitLabel,
  isSubmitting = false,
}: EnhancedPatientFormProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleSubmit = async () => {
    const validation = validatePatientData(formData)
    setValidationErrors(validation.errors)

    if (validation.isValid) {
      await onSubmit()
    }
  }

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
    { value: "Prefer not to say", label: "Prefer not to say" },
  ]

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Patient ID" id="patientId" error={validationErrors.patientId} required>
            <FormInput
              id="patientId"
              value={formData.patientId}
              onChange={(value) => setFormData((prev) => ({ ...prev, patientId: value }))}
              placeholder="P001"
              error={validationErrors.patientId}
            />
          </FormField>

          <FormField label="Full Name" id="name" error={validationErrors.name} required>
            <FormInput
              id="name"
              value={formData.name}
              onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
              placeholder="John Doe"
              error={validationErrors.name}
            />
          </FormField>

          <FormField label="Date of Birth" id="dateOfBirth" error={validationErrors.dateOfBirth} required>
            <FormInput
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(value) => setFormData((prev) => ({ ...prev, dateOfBirth: value }))}
              error={validationErrors.dateOfBirth}
            />
          </FormField>

          <FormField label="Gender" id="gender" error={validationErrors.gender} required>
            <FormSelect
              id="gender"
              value={formData.gender}
              onChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
              placeholder="Select gender"
              options={genderOptions}
              error={validationErrors.gender}
            />
          </FormField>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Phone Number" id="phone" error={validationErrors.phone} required>
            <FormInput
              id="phone"
              value={formData.contactInfo.phone}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, phone: value },
                }))
              }
              placeholder="+1 (555) 123-4567"
              error={validationErrors.phone}
            />
          </FormField>

          <FormField label="Email Address" id="email" error={validationErrors.email} required>
            <FormInput
              id="email"
              type="email"
              value={formData.contactInfo.email}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, email: value },
                }))
              }
              placeholder="john@example.com"
              error={validationErrors.email}
            />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField label="Address" id="address" error={validationErrors.address} required>
            <FormTextarea
              id="address"
              value={formData.contactInfo.address}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, address: value },
                }))
              }
              placeholder="123 Main St, City, State 12345"
              error={validationErrors.address}
              rows={2}
            />
          </FormField>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Medical Information</h3>
        <div className="space-y-4">
          <FormField label="Allergies" id="allergies">
            <FormInput
              id="allergies"
              value={formData.allergies.join(", ")}
              onChange={(value) => onArrayInput("allergies", value)}
              placeholder="Penicillin, Peanuts, Shellfish (comma-separated)"
            />
          </FormField>

          <FormField label="Medical History" id="medicalHistory">
            <FormTextarea
              id="medicalHistory"
              value={formData.medicalHistory.join(", ")}
              onChange={(value) => onArrayInput("medicalHistory", value)}
              placeholder="Diabetes, Hypertension, Previous Surgery (comma-separated)"
              rows={3}
            />
          </FormField>

          <FormField label="Current Prescriptions" id="prescriptions">
            <FormTextarea
              id="prescriptions"
              value={formData.currentPrescriptions.join(", ")}
              onChange={(value) => onArrayInput("currentPrescriptions", value)}
              placeholder="Metformin 500mg, Lisinopril 10mg (comma-separated)"
              rows={3}
            />
          </FormField>
        </div>
      </div>

      {/* Doctor Notes */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Doctor Notes</h3>
        <FormField label="Additional Notes" id="doctorNotes">
          <FormTextarea
            id="doctorNotes"
            value={formData.doctorNotes}
            onChange={(value) => setFormData((prev) => ({ ...prev, doctorNotes: value }))}
            placeholder="Additional notes and observations..."
            rows={4}
          />
        </FormField>
      </div>

      <Button onClick={handleSubmit} className="w-full h-12 text-lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  )
}
