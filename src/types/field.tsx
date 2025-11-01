export interface Field {
  id: string
  name: string
  description: string
  address: string
  fieldTypeId: string
  pricePerHour: number
  imageUrl: string
  area: number
  bluePrintImageUrl: string
  latitude: number
  longitude: number
  mapUrl: string
  city: string
  district: string
  fieldType: FieldType | null
}

export interface FieldType {
  id: string
  name: string
  description: string
}

export interface FieldsResponse {
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  data: Field[]
  success: boolean
  message: string
}

export interface FieldDetailResponse {
  data: Field
  success: boolean
  message: string
}

export interface FieldFilter {
  name?: string
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
  pageNumber: number
  pageSize: number
}

export interface CreateFieldFormData {
  name: string
  description: string
  address: string
  pricePerHour: number
  imageUrl: File | null
  area: number | null
  bluePrintImageUrl: File | null
  latitude: number | null
  longitude: number | null
  mapUrl: string
  city: string
  district: string
  fieldTypeId: string
}
