export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
}

export interface Booking {
  id: string
  fieldId: string
  fieldName: string
  paymentId: string | null
  userId: string
  email: string
  date: string
  status: string
  totalPrice: number
  timeSlots: TimeSlot[]
}

export interface BookingsResponse {
  success: boolean
  message: string
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  data: Booking[]
}

export interface BookingDetailResponse {
  success: boolean
  message: string
  data: Booking
}
