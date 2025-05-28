"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Loader2, Mail, Phone, Plus, Search, Trash2, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, MapPin } from "lucide-react"

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

export default function HealthcareSystem() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<Omit<Patient, "_id" | "createdAt" | "updatedAt">>({
    patientId: "",
    name: "",
    dateOfBirth: "",
    gender: "",
    contactInfo: {
      phone: "",
      email: "",
      address: "",
    },
    allergies: [],
    medicalHistory: [],
    currentPrescriptions: [],
    doctorNotes: "",
  })

  useEffect(() => {
    fetchPatients()
  }, [currentPage, searchTerm, searchField])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "6",
        search: searchTerm,
        field: searchField,
      })

      const response = await fetch(`/api/patients?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPatients(data.patients)
        setTotalPages(data.totalPages)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch patients",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPatient = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Patient added successfully",
        })
        setIsAddDialogOpen(false)
        resetForm()
        fetchPatients()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add patient",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePatient = async () => {
    if (!selectedPatient?._id) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/patients/${selectedPatient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Patient updated successfully",
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchPatients()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update patient",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePatient = async () => {
    if (!selectedPatient?._id) return

    try {
      const response = await fetch(`/api/patients/${selectedPatient._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Patient deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        setSelectedPatient(null)
        fetchPatients()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete patient",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      })
    }
  }

  const handleArrayInput = (field: "allergies" | "medicalHistory" | "currentPrescriptions", value: string) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item)
    setFormData((prev) => ({
      ...prev,
      [field]: items,
    }))
  }

  const resetForm = () => {
    setFormData({
      patientId: "",
      name: "",
      dateOfBirth: "",
      gender: "",
      contactInfo: {
        phone: "",
        email: "",
        address: "",
      },
      allergies: [],
      medicalHistory: [],
      currentPrescriptions: [],
      doctorNotes: "",
    })
  }

  const openEditDialog = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({
      patientId: patient.patientId,
      name: patient.name,
      dateOfBirth: patient.dateOfBirth || "",
      gender: patient.gender,
      contactInfo: patient.contactInfo,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
      currentPrescriptions: patient.currentPrescriptions,
      doctorNotes: patient.doctorNotes,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDeleteDialogOpen(true)
  }

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0

    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">
            Healthcare Management System
          </h1>
          <p className="text-gray-600 text-lg">Manage patient records efficiently and securely</p>
        </div>

        {/* Search and Add Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
            <CardTitle className="text-xl">Patient Search & Management</CardTitle>
            <CardDescription className="text-blue-100">Search for patients and manage their records</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex gap-3">
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger className="w-48 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="patientId">Patient ID</SelectItem>
                    <SelectItem value="allergies">Allergies</SelectItem>
                    <SelectItem value="medicalHistory">Medical History</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder={`Search by ${searchField}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-12 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={resetForm}
                    className="h-12 px-6 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-gray-900">Add New Patient</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Enter patient information to create a new record
                    </DialogDescription>
                  </DialogHeader>
                  <PatientForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleAddPatient}
                    onArrayInput={handleArrayInput}
                    submitLabel="Add Patient"
                    isSubmitting={isSubmitting}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Patients Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center gap-3 text-gray-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Loading patients...</span>
              </div>
            </div>
          ) : patients.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-medium mb-2">No patients found</p>
                <p className="text-gray-400">Add a new patient to get started</p>
              </div>
            </div>
          ) : (
            patients.map((patient) => (
              <Card
                key={patient._id}
                className="hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                        {patient.name}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium text-blue-600">
                        ID: {patient.patientId}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(patient)}
                        className="hover:bg-blue-100 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(patient)}
                        className="hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>
                      {patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : "N/A"} years old, {patient.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span>{patient.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-purple-500" />
                    <span className="truncate">{patient.contactInfo.email}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span className="line-clamp-2">{patient.contactInfo.address}</span>
                  </div>

                  {patient.allergies && patient.allergies.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="text-sm font-medium text-gray-700">Allergies:</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {patient.currentPrescriptions && patient.currentPrescriptions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Prescriptions:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.currentPrescriptions.slice(0, 2).map((prescription, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {prescription}
                          </Badge>
                        ))}
                        {patient.currentPrescriptions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{patient.currentPrescriptions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-6"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-6"
            >
              Next
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gray-900">Edit Patient</DialogTitle>
              <DialogDescription className="text-gray-600">Update patient information</DialogDescription>
            </DialogHeader>
            <PatientForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdatePatient}
              onArrayInput={handleArrayInput}
              submitLabel="Update Patient"
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* Enhanced Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Patient
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Are you sure you want to delete <strong>{selectedPatient?.name}</strong>? This action cannot be undone
                and will permanently remove all patient data.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="px-6">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePatient} className="px-6">
                Delete Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </div>
  )
}

function PatientForm({
  formData,
  setFormData,
  onSubmit,
  onArrayInput,
  submitLabel,
  isSubmitting,
}: {
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  onSubmit: () => Promise<void>
  onArrayInput: (field: "allergies" | "medicalHistory" | "currentPrescriptions", value: string) => void
  submitLabel: string
  isSubmitting: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="patientId" className="text-sm font-medium text-gray-700">
              Patient ID <span className="text-red-500">*</span>
            </label>
            <Input
              id="patientId"
              value={formData.patientId}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, patientId: e.target.value }))}
              placeholder="P001"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, dateOfBirth: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="text-sm font-medium text-gray-700">
              Gender <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, gender: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              value={formData.contactInfo.phone}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, phone: e.target.value },
                }))
              }
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={formData.contactInfo.email}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, email: e.target.value },
                }))
              }
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label htmlFor="address" className="text-sm font-medium text-gray-700">
            Address <span className="text-red-500">*</span>
          </label>
          <Input
            id="address"
            value={formData.contactInfo.address}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, address: e.target.value },
              }))
            }
            placeholder="123 Main St, City, State 12345"
          />
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Medical Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="allergies" className="text-sm font-medium text-gray-700">
              Allergies
            </label>
            <Input
              id="allergies"
              value={formData.allergies.join(", ")}
              onChange={(e) => onArrayInput("allergies", e.target.value)}
              placeholder="Penicillin, Peanuts, Shellfish (comma-separated)"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="medicalHistory" className="text-sm font-medium text-gray-700">
              Medical History
            </label>
            <Input
              id="medicalHistory"
              value={formData.medicalHistory.join(", ")}
              onChange={(e) => onArrayInput("medicalHistory", e.target.value)}
              placeholder="Diabetes, Hypertension, Previous Surgery (comma-separated)"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prescriptions" className="text-sm font-medium text-gray-700">
              Current Prescriptions
            </label>
            <Input
              id="prescriptions"
              value={formData.currentPrescriptions.join(", ")}
              onChange={(e) => onArrayInput("currentPrescriptions", e.target.value)}
              placeholder="Metformin 500mg, Lisinopril 10mg (comma-separated)"
            />
          </div>
        </div>
      </div>

      {/* Doctor Notes */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Doctor Notes</h3>
        <div className="space-y-2">
          <label htmlFor="doctorNotes" className="text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <Input
            id="doctorNotes"
            value={formData.doctorNotes}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, doctorNotes: e.target.value }))}
            placeholder="Additional notes and observations..."
          />
        </div>
      </div>

      <Button onClick={onSubmit} className="w-full h-12 text-lg" disabled={isSubmitting}>
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
