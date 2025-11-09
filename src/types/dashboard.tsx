// Dashboard Summary Types
export interface DashboardSummary {
  totalBookings: number
  totalCustomers: number
  totalFields: number
  totalRevenue: number
  completedBookings: number
  pendingBookings: number
  cancelledBookings: number
  monthRevenue: number
  todayRevenue: number
}

// Top Fields Types
export interface TopFieldItem {
  fieldId: string
  fieldName: string
  fieldAddress: string | null
  imageUrl: string | null
  bookingCount: number
  totalRevenue: number
}

export interface GetTopFieldsResponse {
  topFields: TopFieldItem[]
}

// Revenue Data Types
export interface RevenueDataPoint {
  label: string
  date: string
  revenue: number
  bookingCount: number
}

export interface GetRevenueResponse {
  view: 'day' | 'month' | 'year'
  data: RevenueDataPoint[]
  totalRevenue: number
  startDate: string
  endDate: string
}

// API Response Types
export interface DataServiceResponse<T> {
  success: boolean
  message: string
  data: T | null
}

// Legacy types (kept for compatibility)
export interface RevenueData {
  itemRevenue: number
  courseRevenue: number
  premiumRevenue: number
  totalRevenue: number
}

export interface TotalUsersData {
  totalUsers: number
}

export interface SubscriptionData {
  free: number
  premium: number
  total: number
}

export interface PopularLanguagesData {
  english: number
  japanese: number
  korean: number
  chinese: number
}

export interface CoinData {
  itemCoin: number
  courseCoin: number
  totalCoin: number
}

export interface DayRevenueData {
  itemRevenue: number
  courseRevenue: number
  premiumRevenue: number
  totalRevenue: number
}

export interface WeeklyRevenueData {
  monday: DayRevenueData
  tuesday: DayRevenueData
  wednesday: DayRevenueData
  thursday: DayRevenueData
  friday: DayRevenueData
  saturday: DayRevenueData
  sunday: DayRevenueData
}

export interface MonthRevenueData {
  itemRevenue: number
  courseRevenue: number
  premiumRevenue: number
  totalRevenue: number
}

export interface YearlyRevenueData {
  january: MonthRevenueData
  february: MonthRevenueData
  march: MonthRevenueData
  april: MonthRevenueData
  may: MonthRevenueData
  june: MonthRevenueData
  july: MonthRevenueData
  august: MonthRevenueData
  september: MonthRevenueData
  october: MonthRevenueData
  november: MonthRevenueData
  december: MonthRevenueData
}
