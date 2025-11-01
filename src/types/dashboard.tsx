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
