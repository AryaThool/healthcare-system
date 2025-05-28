export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validatePatientData(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Patient ID validation
  if (!data.patientId?.trim()) {
    errors.patientId = "Patient ID is required"
  } else if (!/^P\d{3,6}$/.test(data.patientId)) {
    errors.patientId = "Patient ID must be in format P001-P999999"
  }

  // Name validation
  if (!data.name?.trim()) {
    errors.name = "Full name is required"
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long"
  } else if (!/^[a-zA-Z\s'-]+$/.test(data.name)) {
    errors.name = "Name can only contain letters, spaces, hyphens, and apostrophes"
  }

  // Date of birth validation
  if (!data.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required"
  } else {
    const birthDate = new Date(data.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()

    if (isNaN(birthDate.getTime())) {
      errors.dateOfBirth = "Please enter a valid date"
    } else if (birthDate > today) {
      errors.dateOfBirth = "Date of birth cannot be in the future"
    } else if (age > 150) {
      errors.dateOfBirth = "Please enter a realistic date of birth"
    } else if (age < 0) {
      errors.dateOfBirth = "Date of birth cannot be in the future"
    }
  }

  // Gender validation
  if (!data.gender) {
    errors.gender = "Gender is required"
  }

  // Phone validation
  if (!data.contactInfo?.phone?.trim()) {
    errors.phone = "Phone number is required"
  } else if (!/^[+]?[1-9][\d]{0,15}$/.test(data.contactInfo.phone.replace(/[\s\-$$$$]/g, ""))) {
    errors.phone = "Please enter a valid phone number (e.g., +1 555-123-4567)"
  }

  // Email validation
  if (!data.contactInfo?.email?.trim()) {
    errors.email = "Email address is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactInfo.email)) {
    errors.email = "Please enter a valid email address"
  }

  // Address validation
  if (!data.contactInfo?.address?.trim()) {
    errors.address = "Address is required"
  } else if (data.contactInfo.address.trim().length < 10) {
    errors.address = "Please enter a complete address"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`
  }
  return phone
}
