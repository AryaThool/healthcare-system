"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, User, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Patient {
  _id?: string
  patientId: string
  name: string
  age: number
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

  const [formData, setFormData] = useState<Omit<Patient, "_id" | "createdAt" | "updatedAt">>({
    patientId: "",
    name: "",
    age: 0,
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
        limit: "10",
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
    }
  }

  const handleUpdatePatient = async () => {
    if (!selectedPatient?._id) return

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

  const resetForm = () => {
    setFormData({
      patientId: "",
      name: "",
      age: 0,
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
      age: patient.age,
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Healthcare Management System</h1>
          <p className="text-gray-600">Manage patient records efficiently and securely</p>
        </div>

        {/* Search and Add Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Patient Search & Management</CardTitle>
            <CardDescription>Search for patients and manage their records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 flex gap-2">
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger className="w-40">
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
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={`Search by ${searchField}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Patient</DialogTitle>
                    <DialogDescription>Enter patient information to create a new record</DialogDescription>
                  </DialogHeader>
                  <PatientForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleAddPatient}
                    onArrayInput={handleArrayInput}
                    submitLabel="Add Patient"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-8">Loading patients...</div>
          ) : patients.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No patients found</div>
          ) : (
            patients.map((patient) => (
              <Card key={patient._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <CardDescription>ID: {patient.patientId}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(patient)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(patient)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>
                      {patient.age} years old, {patient.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{patient.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{patient.contactInfo.email}</span>
                  </div>
                  {patient.allergies.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Allergies:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.currentPrescriptions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Current Prescriptions:</p>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>Update patient information</DialogDescription>
            </DialogHeader>
            <PatientForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdatePatient}
              onArrayInput={handleArrayInput}
              submitLabel="Update Patient"
            />
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Patient</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedPatient?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePatient}>
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
}: {
  formData: Omit<Patient, "_id" | "createdAt" | "updatedAt">
  setFormData: React.Dispatch<React.SetStateAction<Omit<Patient, "_id" | "createdAt" | "updatedAt">>>
  onSubmit: () => void
  onArrayInput: (field: "allergies" | "medicalHistory" | "currentPrescriptions", value: string) => void
  submitLabel: string
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientId">Patient ID</Label>
          <Input
            id="patientId"
            value={formData.patientId}
            onChange={(e) => setFormData((prev) => ({ ...prev, patientId: e.target.value }))}
            placeholder="P001"
          />
        </div>
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="John Doe"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData((prev) => ({ ...prev, age: Number.parseInt(e.target.value) || 0 }))}
            placeholder="30"
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.contactInfo.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, phone: e.target.value },
                }))
              }
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.contactInfo.email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, email: e.target.value },
                }))
              }
              placeholder="john@example.com"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.contactInfo.address}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, address: e.target.value },
              }))
            }
            placeholder="123 Main St, City, State 12345"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="allergies">Allergies (comma-separated)</Label>
        <Input
          id="allergies"
          value={formData.allergies.join(", ")}
          onChange={(e) => onArrayInput("allergies", e.target.value)}
          placeholder="Penicillin, Peanuts, Shellfish"
        />
      </div>

      <div>
        <Label htmlFor="medicalHistory">Medical History (comma-separated)</Label>
        <Textarea
          id="medicalHistory"
          value={formData.medicalHistory.join(", ")}
          onChange={(e) => onArrayInput("medicalHistory", e.target.value)}
          placeholder="Diabetes, Hypertension, Previous Surgery"
        />
      </div>

      <div>
        <Label htmlFor="prescriptions">Current Prescriptions (comma-separated)</Label>
        <Textarea
          id="prescriptions"
          value={formData.currentPrescriptions.join(", ")}
          onChange={(e) => onArrayInput("currentPrescriptions", e.target.value)}
          placeholder="Metformin 500mg, Lisinopril 10mg"
        />
      </div>

      <div>
        <Label htmlFor="doctorNotes">Doctor Notes</Label>
        <Textarea
          id="doctorNotes"
          value={formData.doctorNotes}
          onChange={(e) => setFormData((prev) => ({ ...prev, doctorNotes: e.target.value }))}
          placeholder="Additional notes and observations..."
        />
      </div>

      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  )
}
