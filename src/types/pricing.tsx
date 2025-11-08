export const DayOfWeek = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6
} as const

export type DayOfWeekType = (typeof DayOfWeek)[keyof typeof DayOfWeek]

export const DayOfWeekLabels: Record<DayOfWeekType, string> = {
  [DayOfWeek.Monday]: 'Thứ Hai',
  [DayOfWeek.Tuesday]: 'Thứ Ba',
  [DayOfWeek.Wednesday]: 'Thứ Tư',
  [DayOfWeek.Thursday]: 'Thứ Năm',
  [DayOfWeek.Friday]: 'Thứ Sáu',
  [DayOfWeek.Saturday]: 'Thứ Bảy',
  [DayOfWeek.Sunday]: 'Chủ Nhật'
}

export interface Pricing {
  id: string
  fieldId: string
  timeSlotId: string
  dayOfWeek: DayOfWeekType
  price: number
  // Flattened times from API (preferred)
  timeSlotStartTime?: string // HH:mm:ss or HH:mm
  timeSlotEndTime?: string   // HH:mm:ss or HH:mm
  rangeStartTime?: string    // HH:mm:ss or HH:mm
  rangeEndTime?: string      // HH:mm:ss or HH:mm
  field?: {
    id: string
    name: string
  }
  timeSlot?: {
    id: string
    startTime: string
    endTime: string
  }
}

export interface PricingsResponse {
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  data: Pricing[]
  success: boolean
  message: string
}

export interface PricingDetailResponse {
  data: Pricing
  success: boolean
  message: string
}

export interface PricingFilter {
  fieldId?: string
  timeSlotId?: string
  dayOfWeek?: DayOfWeekType | null
  isActive?: boolean
  pageNumber: number
  pageSize: number
}

export interface CreatePricingFormData {
  fieldId: string
  dayOfWeek: DayOfWeekType | null
  startTime: string // HH:mm
  endTime: string   // HH:mm
  price: number
}

export interface TimeSlot {
  id: string
  startTime: string // Format: HH:mm:ss hoặc HH:mm
  endTime: string   // Format: HH:mm:ss hoặc HH:mm
  isActive?: boolean
}

export interface TimeSlotResponse {
  data: TimeSlot[]
  success: boolean
  message: string
  pageNumber?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
}

export interface CreatePricingRangeResponse {
  data: string[] // list of created Pricing IDs
  success: boolean
  message: string
}
