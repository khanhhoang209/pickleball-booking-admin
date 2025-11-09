export interface User {
  id: string
  userName: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  isActive: boolean
}

export interface UsersResponse {
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  data: User[]
  success: boolean
  message: string
}
