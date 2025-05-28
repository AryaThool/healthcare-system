"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"

interface FormFieldProps {
  label: string
  id: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, id, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

interface FormInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  error?: string
}

export function FormInput({ id, value, onChange, placeholder, type = "text", error }: FormInputProps) {
  return (
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={error ? "border-red-500 focus:border-red-500" : ""}
    />
  )
}

interface FormTextareaProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  rows?: number
}

export function FormTextarea({ id, value, onChange, placeholder, error, rows = 3 }: FormTextareaProps) {
  return (
    <Textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={error ? "border-red-500 focus:border-red-500" : ""}
    />
  )
}

interface FormSelectProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  options: { value: string; label: string }[]
}

export function FormSelect({ id, value, onChange, placeholder, error, options }: FormSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={error ? "border-red-500 focus:border-red-500" : ""}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
