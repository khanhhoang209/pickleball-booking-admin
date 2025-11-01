import React, { useEffect, useState } from 'react'
import AdminLayout from '~/components/layout/AdminLayout'
import { toast } from 'sonner'
import type {
  RevenueData,
  SubscriptionData,
  PopularLanguagesData,
  CoinData,
  WeeklyRevenueData,
  YearlyRevenueData
} from '~/types/dashboard'

const Dashboard: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    itemRevenue: 0,
    courseRevenue: 0,
    premiumRevenue: 0,
    totalRevenue: 0
  })
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [totalCourses, setTotalCourses] = useState<number>(0)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [coinData, setCoinData] = useState<CoinData>({
    itemCoin: 0,
    courseCoin: 0,
    totalCoin: 0
  })
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    free: 0,
    premium: 0,
    total: 0
  })
  const [popularLanguagesData, setPopularLanguagesData] = useState<PopularLanguagesData>({
    english: 0,
    japanese: 0,
    korean: 0,
    chinese: 0
  })
  const [weeklyRevenueData, setWeeklyRevenueData] = useState<WeeklyRevenueData | null>(null)
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<RevenueData>({
    itemRevenue: 0,
    courseRevenue: 0,
    premiumRevenue: 0,
    totalRevenue: 0
  })
  const [yearlyRevenueData, setYearlyRevenueData] = useState<YearlyRevenueData | null>(null)
  const [salesPeriod, setSalesPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingCoins, setLoadingCoins] = useState(true)
  const [loadingItems, setLoadingItems] = useState(true)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [loadingLanguages, setLoadingLanguages] = useState(true)
  const [loadingWeeklyRevenue, setLoadingWeeklyRevenue] = useState(true)
  const [loadingMonthlyRevenue, setLoadingMonthlyRevenue] = useState(true)
  const [loadingYearlyRevenue, setLoadingYearlyRevenue] = useState(true)
  const [startDate, setStartDate] = useState<string>(() => {
    // Default to 1 year ago
    const date = new Date()
    date.setFullYear(date.getFullYear() - 1)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => {
    // Default to today
    return new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    // fetchRevenueData()
    // fetchTotalUsers()
    // fetchTotalCourses()
    // fetchTotalCoins()
    // fetchTotalItems()
    // fetchSubscriptionData()
    // fetchPopularLanguages()
    // fetchWeeklyRevenue()
    // fetchMonthlyRevenue()
    // fetchYearlyRevenue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // const fetchRevenueData = async () => {
  //   try {
  //     setLoading(true)
  //     const startDateTime = new Date(startDate).toISOString()

  //     // End date: add 1 day then subtract 1 second to get 23:59:59
  //     const endDateObj = new Date(endDate)
  //     endDateObj.setDate(endDateObj.getDate() + 1)
  //     endDateObj.setSeconds(endDateObj.getSeconds() - 1)
  //     const endDateTime = endDateObj.toISOString()

  //     const response = await apiService.get<RevenueData>(
  //       `/dashboards/revenue?StartDate=${startDateTime}&EndDate=${endDateTime}`
  //     )

  //     if (response.succeeded && response.data) {
  //       setRevenueData(response.data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching revenue data:', error)
  //     toast.error('Không thể tải dữ liệu doanh thu')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // const fetchTotalUsers = async () => {
  //   try {
  //     setLoadingUsers(true)
  //     const response = await apiService.get<number>('/dashboards/total-users')

  //     if (response.succeeded && response.data !== undefined) {
  //       setTotalUsers(response.data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching total users:', error)
  //     toast.error('Không thể tải dữ liệu người dùng')
  //   } finally {
  //     setLoadingUsers(false)
  //   }
  // }

  // const fetchTotalCourses = async () => {
  //   try {
  //     setLoadingCourses(true)
  //     const response = await apiService.get<number>('/dashboards/total-courses')

  //     if (response.succeeded && response.data !== undefined) {
  //       setTotalCourses(response.data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching total courses:', error)
  //     toast.error('Không thể tải dữ liệu khóa học')
  //   } finally {
  //     setLoadingCourses(false)
  //   }
  // }

  // const fetchTotalCoins = async () => {
  //   try {
  //     setLoadingCoins(true)
  //     const response = await apiService.get<CoinData>('/dashboards/total-coins')

  //     if (response.succeeded && response.data) {
  //       setCoinData(response.data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching total coins:', error)
  //     toast.error('Không thể tải dữ liệu xu')
  //   } finally {
  //     setLoadingCoins(false)
  //   }
  // }

  // const fetchTotalItems = async () => {
  //   try {
  //     setLoadingItems(true)
  //     const response = await apiService.get<number>('/dashboards/total-items')

  //     if (response.succeeded && response.data !== undefined) {
  //       setTotalItems(response.data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching total items:', error)
  //     toast.error('Không thể tải dữ liệu vật phẩm')
  //   } finally {
  //     setLoadingItems(false)
  //   }
  // }

  // const fetchSubscriptionData = async () => {
  //   try {
  //     setLoadingSubscription(true)
  //     const response = await apiService.get<SubscriptionData>('/dashboards/subscription')

  //     if (response.succeeded && response.data) {
  //       setSubscriptionData(response.data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching subscription data:', error)
  //     toast.error('Không thể tải dữ liệu đăng ký')
  //   } finally {
  //     setLoadingSubscription(false)
  //   }
  // }

  // const fetchPopularLanguages = async () => {
  //   try {
  //     setLoadingLanguages(true)
  //     const startDateTime = new Date(startDate).toISOString()

  //     // End date: add 1 day then subtract 1 second to get 23:59:59
  //     const endDateObj = new Date(endDate)
  //     endDateObj.setDate(endDateObj.getDate() + 1)
  //     endDateObj.setSeconds(endDateObj.getSeconds() - 1)
  //     const endDateTime = endDateObj.toISOString()

  //     const response = await apiService.get<PopularLanguagesData>(
  //       `/dashboards/popular-languages?StartDate=${startDateTime}&EndDate=${endDateTime}`
  //     )

  //     if (response.succeeded && response.data) {
  //       setPopularLanguagesData(response.data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching popular languages:', error)
  //     toast.error('Không thể tải dữ liệu ngôn ngữ phổ biến')
  //   } finally {
  //     setLoadingLanguages(false)
  //   }
  // }

  // const fetchWeeklyRevenue = async () => {
  //   try {
  //     setLoadingWeeklyRevenue(true)
  //     const response = await apiService.get<WeeklyRevenueData>('/dashboards/weekly-revenue')

  //     if (response.succeeded && response.data) {
  //       setWeeklyRevenueData(response.data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching weekly revenue:', error)
  //     toast.error('Không thể tải dữ liệu doanh thu tuần')
  //   } finally {
  //     setLoadingWeeklyRevenue(false)
  //   }
  // }

  // const fetchMonthlyRevenue = async () => {
  //   try {
  //     setLoadingMonthlyRevenue(true)
  //     const response = await apiService.get<RevenueData>('/dashboards/monthly-revenue')

  //     if (response.succeeded && response.data) {
  //       setMonthlyRevenueData(response.data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching monthly revenue:', error)
  //     toast.error('Không thể tải dữ liệu doanh thu tháng')
  //   } finally {
  //     setLoadingMonthlyRevenue(false)
  //   }
  // }

  // const fetchYearlyRevenue = async () => {
  //   try {
  //     setLoadingYearlyRevenue(true)
  //     const response = await apiService.get<YearlyRevenueData>('/dashboards/yearly-revenue')

  //     if (response.succeeded && response.data) {
  //       setYearlyRevenueData(response.data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching yearly revenue:', error)
  //     toast.error('Không thể tải dữ liệu doanh thu năm')
  //   } finally {
  //     setLoadingYearlyRevenue(false)
  //   }
  // }

  const handleDateChange = () => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        toast.error('Ngày bắt đầu phải trước ngày kết thúc')
        return
      }
      // fetchRevenueData()
      // fetchPopularLanguages()
    }
  }

  const statsCards = [
    {
      title: 'Tổng số người dùng hiện tại',
      value: loadingUsers ? '...' : totalUsers.toString(),
      color: 'blue',
      icon: (
        <svg className='w-6 h-6 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
          />
        </svg>
      )
    },
    {
      title: 'Tổng số khóa học hiện tại',
      value: loadingCourses ? '...' : totalCourses.toString(),
      color: 'green',
      icon: (
        <svg className='w-6 h-6 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
          />
        </svg>
      )
    },
    {
      title: 'Tổng số vật phẩm hiện tại',
      value: loadingItems ? '...' : totalItems.toString(),
      color: 'purple',
      icon: (
        <svg className='w-6 h-6 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          />
        </svg>
      )
    }
  ]

  const freePercentage = subscriptionData.total > 0 ? (subscriptionData.free / subscriptionData.total) * 100 : 0
  const premiumPercentage = subscriptionData.total > 0 ? (subscriptionData.premium / subscriptionData.total) * 100 : 0

  // API already returns percentage, so use directly
  const popularLanguages = [
    {
      name: 'Tiếng Anh',
      percentage: popularLanguagesData.english,
      count: popularLanguagesData.english
    },
    {
      name: 'Tiếng Nhật',
      percentage: popularLanguagesData.japanese,
      count: popularLanguagesData.japanese
    },
    {
      name: 'Tiếng Hàn',
      percentage: popularLanguagesData.korean,
      count: popularLanguagesData.korean
    },
    {
      name: 'Tiếng Trung',
      percentage: popularLanguagesData.chinese,
      count: popularLanguagesData.chinese
    }
  ]

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Date Range Filter */}
        <div className='bg-white rounded-lg p-6 shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2 flex-1'>
              <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>Ngày bắt đầu:</label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
            <div className='flex items-center gap-2 flex-1'>
              <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>Ngày kết thúc:</label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>
            <button
              onClick={handleDateChange}
              disabled={loading}
              className='px-6 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm'
            >
              {loading ? 'Đang tải...' : 'Áp dụng'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {statsCards.map((card, index) => (
            <div key={index} className='bg-white rounded-lg p-6 shadow-sm'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <p className='text-sm text-gray-500 mb-1'>Thống kê</p>
                  <h3 className='text-lg font-semibold text-gray-900'>{card.title}</h3>
                </div>
                <div className='flex items-center space-x-2'>{card.icon}</div>
              </div>
              <div className='flex items-center'>
                <span className='text-3xl font-bold text-gray-900'>{card.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Sales Chart */}
          <div className='bg-white rounded-lg p-6 shadow-sm lg:col-span-1'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Thống kê</p>
                <h3 className='text-lg font-semibold text-gray-900'>Tổng quan doanh số</h3>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => setSalesPeriod('week')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    salesPeriod === 'week'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tuần
                </button>
                <button
                  onClick={() => setSalesPeriod('month')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    salesPeriod === 'month'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tháng
                </button>
                <button
                  onClick={() => setSalesPeriod('year')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    salesPeriod === 'year'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Năm
                </button>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className='h-64 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 p-3 pb-3'>
              {/* Week View - 7 days (Mon-Sun) with 3 bars each */}
              {salesPeriod === 'week' && (
                <div className='h-full flex items-center justify-center'>
                  {loadingWeeklyRevenue ? (
                    <div className='text-gray-500'>Đang tải...</div>
                  ) : weeklyRevenueData ? (
                    (() => {
                      const totalWeekRevenue =
                        weeklyRevenueData.monday.totalRevenue +
                        weeklyRevenueData.tuesday.totalRevenue +
                        weeklyRevenueData.wednesday.totalRevenue +
                        weeklyRevenueData.thursday.totalRevenue +
                        weeklyRevenueData.friday.totalRevenue +
                        weeklyRevenueData.saturday.totalRevenue +
                        weeklyRevenueData.sunday.totalRevenue

                      if (totalWeekRevenue === 0) {
                        return <div className='text-gray-400'>Không có dữ liệu</div>
                      }

                      return (
                        <div className='grid grid-cols-7 gap-2.5 h-full items-end w-full'>
                          {[
                            { day: 'T2', data: weeklyRevenueData.monday },
                            { day: 'T3', data: weeklyRevenueData.tuesday },
                            { day: 'T4', data: weeklyRevenueData.wednesday },
                            { day: 'T5', data: weeklyRevenueData.thursday },
                            { day: 'T6', data: weeklyRevenueData.friday },
                            { day: 'T7', data: weeklyRevenueData.saturday },
                            { day: 'CN', data: weeklyRevenueData.sunday }
                          ].map(({ day, data }) => {
                            const maxRevenue = Math.max(
                              weeklyRevenueData.monday.totalRevenue,
                              weeklyRevenueData.tuesday.totalRevenue,
                              weeklyRevenueData.wednesday.totalRevenue,
                              weeklyRevenueData.thursday.totalRevenue,
                              weeklyRevenueData.friday.totalRevenue,
                              weeklyRevenueData.saturday.totalRevenue,
                              weeklyRevenueData.sunday.totalRevenue
                            )
                            const getHeight = (revenue: number) => {
                              if (maxRevenue === 0) return '10%'
                              return `${(revenue / maxRevenue) * 100}%`
                            }
                            const getPercentage = (revenue: number) => {
                              if (data.totalRevenue === 0) return 0
                              return Math.round((revenue / data.totalRevenue) * 100)
                            }

                            return (
                              <div key={day} className='flex flex-col items-center gap-2 h-full justify-end'>
                                <div className='flex gap-0.5 items-end flex-1'>
                                  {data.itemRevenue > 0 && (
                                    <div
                                      className='w-6 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all hover:opacity-80 relative flex items-start justify-center pt-1'
                                      style={{
                                        height: getHeight(data.itemRevenue),
                                        minHeight: '10px'
                                      }}
                                      title={`Vật phẩm: ${data.itemRevenue.toLocaleString()} VNĐ (${getPercentage(data.itemRevenue)}%)`}
                                    >
                                      {data.totalRevenue > 0 && (
                                        <span className='text-[9px] font-bold text-white' style={{ lineHeight: '1' }}>
                                          {getPercentage(data.itemRevenue)}%
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {data.courseRevenue > 0 && (
                                    <div
                                      className='w-6 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all hover:opacity-80 relative flex items-start justify-center pt-1'
                                      style={{
                                        height: getHeight(data.courseRevenue),
                                        minHeight: '10px'
                                      }}
                                      title={`Khóa học: ${data.courseRevenue.toLocaleString()} VNĐ (${getPercentage(data.courseRevenue)}%)`}
                                    >
                                      {data.totalRevenue > 0 && (
                                        <span className='text-[9px] font-bold text-white' style={{ lineHeight: '1' }}>
                                          {getPercentage(data.courseRevenue)}%
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {data.premiumRevenue > 0 && (
                                    <div
                                      className='w-6 bg-gradient-to-t from-green-500 to-green-300 rounded-t transition-all hover:opacity-80 relative flex items-start justify-center pt-1'
                                      style={{
                                        height: getHeight(data.premiumRevenue),
                                        minHeight: '10px'
                                      }}
                                      title={`Premium: ${data.premiumRevenue.toLocaleString()} VNĐ (${getPercentage(data.premiumRevenue)}%)`}
                                    >
                                      {data.totalRevenue > 0 && (
                                        <span className='text-[9px] font-bold text-white' style={{ lineHeight: '1' }}>
                                          {getPercentage(data.premiumRevenue)}%
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <span className='text-xs font-medium text-gray-600'>{day}</span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()
                  ) : (
                    <div className='text-gray-400'>Không có dữ liệu</div>
                  )}
                </div>
              )}

              {/* Month View - Horizontal bars for 3 categories */}
              {salesPeriod === 'month' && (
                <div className='flex flex-col justify-center gap-6 h-full'>
                  {loadingMonthlyRevenue ? (
                    <div className='flex items-center justify-center text-gray-500'>Đang tải...</div>
                  ) : monthlyRevenueData.totalRevenue > 0 ? (
                    <>
                      {/* Item */}
                      {monthlyRevenueData.itemRevenue > 0 && (
                        <div className='flex items-center gap-3'>
                          <span className='text-xs font-medium text-gray-600 w-20'>Vật phẩm</span>
                          <div className='flex-1 bg-gray-200 rounded-full h-8'>
                            <div
                              className='h-8 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all hover:opacity-80 flex items-center justify-end pr-3'
                              style={{
                                width: `${(monthlyRevenueData.itemRevenue / monthlyRevenueData.totalRevenue) * 100}%`,
                                minWidth: '60px'
                              }}
                              title={`Vật phẩm: ${monthlyRevenueData.itemRevenue.toLocaleString()} VNĐ`}
                            >
                              <span className='text-xs font-semibold text-white'>
                                {Math.round((monthlyRevenueData.itemRevenue / monthlyRevenueData.totalRevenue) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Course */}
                      {monthlyRevenueData.courseRevenue > 0 && (
                        <div className='flex items-center gap-3'>
                          <span className='text-xs font-medium text-gray-600 w-20'>Khóa học</span>
                          <div className='flex-1 bg-gray-200 rounded-full h-8'>
                            <div
                              className='h-8 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full transition-all hover:opacity-80 flex items-center justify-end pr-3'
                              style={{
                                width: `${(monthlyRevenueData.courseRevenue / monthlyRevenueData.totalRevenue) * 100}%`,
                                minWidth: '60px'
                              }}
                              title={`Khóa học: ${monthlyRevenueData.courseRevenue.toLocaleString()} VNĐ`}
                            >
                              <span className='text-xs font-semibold text-white'>
                                {Math.round((monthlyRevenueData.courseRevenue / monthlyRevenueData.totalRevenue) * 100)}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Premium */}
                      {monthlyRevenueData.premiumRevenue > 0 && (
                        <div className='flex items-center gap-3'>
                          <span className='text-xs font-medium text-gray-600 w-20'>Premium</span>
                          <div className='flex-1 bg-gray-200 rounded-full h-8'>
                            <div
                              className='h-8 bg-gradient-to-r from-green-500 to-green-300 rounded-full transition-all hover:opacity-80 flex items-center justify-end pr-3'
                              style={{
                                width: `${(monthlyRevenueData.premiumRevenue / monthlyRevenueData.totalRevenue) * 100}%`,
                                minWidth: '60px'
                              }}
                              title={`Premium: ${monthlyRevenueData.premiumRevenue.toLocaleString()} VNĐ`}
                            >
                              <span className='text-xs font-semibold text-white'>
                                {Math.round(
                                  (monthlyRevenueData.premiumRevenue / monthlyRevenueData.totalRevenue) * 100
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className='flex items-center justify-center text-gray-400'>Không có dữ liệu</div>
                  )}
                </div>
              )}

              {/* Year View - Vertical bars for 12 months */}
              {salesPeriod === 'year' && (
                <div className='h-full flex items-center justify-center'>
                  {loadingYearlyRevenue ? (
                    <div className='text-gray-500'>Đang tải...</div>
                  ) : yearlyRevenueData ? (
                    (() => {
                      const totalYearRevenue =
                        yearlyRevenueData.january.totalRevenue +
                        yearlyRevenueData.february.totalRevenue +
                        yearlyRevenueData.march.totalRevenue +
                        yearlyRevenueData.april.totalRevenue +
                        yearlyRevenueData.may.totalRevenue +
                        yearlyRevenueData.june.totalRevenue +
                        yearlyRevenueData.july.totalRevenue +
                        yearlyRevenueData.august.totalRevenue +
                        yearlyRevenueData.september.totalRevenue +
                        yearlyRevenueData.october.totalRevenue +
                        yearlyRevenueData.november.totalRevenue +
                        yearlyRevenueData.december.totalRevenue

                      if (totalYearRevenue === 0) {
                        return <div className='text-gray-400'>Không có dữ liệu</div>
                      }

                      return (
                        <div className='grid grid-cols-12 gap-1 h-full items-end w-full'>
                          {[
                            { month: 'T1', data: yearlyRevenueData.january },
                            { month: 'T2', data: yearlyRevenueData.february },
                            { month: 'T3', data: yearlyRevenueData.march },
                            { month: 'T4', data: yearlyRevenueData.april },
                            { month: 'T5', data: yearlyRevenueData.may },
                            { month: 'T6', data: yearlyRevenueData.june },
                            { month: 'T7', data: yearlyRevenueData.july },
                            { month: 'T8', data: yearlyRevenueData.august },
                            { month: 'T9', data: yearlyRevenueData.september },
                            { month: 'T10', data: yearlyRevenueData.october },
                            { month: 'T11', data: yearlyRevenueData.november },
                            { month: 'T12', data: yearlyRevenueData.december }
                          ].map(({ month, data }) => {
                            const maxRevenue = Math.max(
                              yearlyRevenueData.january.totalRevenue,
                              yearlyRevenueData.february.totalRevenue,
                              yearlyRevenueData.march.totalRevenue,
                              yearlyRevenueData.april.totalRevenue,
                              yearlyRevenueData.may.totalRevenue,
                              yearlyRevenueData.june.totalRevenue,
                              yearlyRevenueData.july.totalRevenue,
                              yearlyRevenueData.august.totalRevenue,
                              yearlyRevenueData.september.totalRevenue,
                              yearlyRevenueData.october.totalRevenue,
                              yearlyRevenueData.november.totalRevenue,
                              yearlyRevenueData.december.totalRevenue
                            )
                            const getHeight = (revenue: number) => {
                              if (maxRevenue === 0) return '10%'
                              return `${(revenue / maxRevenue) * 100}%`
                            }
                            const getPercentage = (revenue: number) => {
                              if (data.totalRevenue === 0) return 0
                              return Math.round((revenue / data.totalRevenue) * 100)
                            }
                            return (
                              <div key={month} className='flex flex-col items-center gap-1.5 h-full justify-end'>
                                <div className='flex gap-0.5 items-end flex-1'>
                                  <div
                                    className='w-3 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all hover:opacity-80'
                                    style={{
                                      height: getHeight(data.itemRevenue),
                                      minHeight: data.itemRevenue > 0 ? '8px' : '0'
                                    }}
                                    title={`Vật phẩm: ${data.itemRevenue.toLocaleString()} VNĐ (${getPercentage(data.itemRevenue)}%)`}
                                  ></div>
                                  <div
                                    className='w-3 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all hover:opacity-80'
                                    style={{
                                      height: getHeight(data.courseRevenue),
                                      minHeight: data.courseRevenue > 0 ? '8px' : '0'
                                    }}
                                    title={`Khóa học: ${data.courseRevenue.toLocaleString()} VNĐ (${getPercentage(data.courseRevenue)}%)`}
                                  ></div>
                                  <div
                                    className='w-3 bg-gradient-to-t from-green-500 to-green-300 rounded-t transition-all hover:opacity-80'
                                    style={{
                                      height: getHeight(data.premiumRevenue),
                                      minHeight: data.premiumRevenue > 0 ? '8px' : '0'
                                    }}
                                    title={`Premium: ${data.premiumRevenue.toLocaleString()} VNĐ (${getPercentage(data.premiumRevenue)}%)`}
                                  ></div>
                                </div>
                                <span className='text-xs font-medium text-gray-600'>{month}</span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()
                  ) : (
                    <div className='text-gray-400'>Không có dữ liệu</div>
                  )}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className='mt-4 flex items-center justify-center gap-6'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-gradient-to-br from-purple-600 to-purple-400 rounded'></div>
                <span className='text-xs text-gray-600'>Vật phẩm</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-300 rounded'></div>
                <span className='text-xs text-gray-600'>Khóa học</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-gradient-to-br from-green-500 to-green-300 rounded'></div>
                <span className='text-xs text-gray-600'>Premium</span>
              </div>
            </div>
          </div>

          {/* Subscription Stats */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <div className='mb-6'>
              <p className='text-sm text-gray-500 mb-1'>Thống kê</p>
              <h3 className='text-lg font-semibold text-gray-900'>Các gói đăng ký</h3>
            </div>
            <div className='flex items-center justify-between gap-8'>
              {/* Pie Chart */}
              <div className='relative w-48 h-48 flex-shrink-0'>
                {loadingSubscription ? (
                  <div className='flex items-center justify-center h-full text-gray-500'>Đang tải...</div>
                ) : (
                  <>
                    <svg className='w-48 h-48 transform -rotate-90' viewBox='0 0 200 200'>
                      {/* Background circle */}
                      <circle cx='100' cy='100' r='80' fill='none' stroke='#F3F4F6' strokeWidth='40' />

                      {/* Free segment */}
                      {subscriptionData.free > 0 && (
                        <circle
                          cx='100'
                          cy='100'
                          r='80'
                          fill='none'
                          stroke='#60A5FA'
                          strokeWidth='40'
                          strokeDasharray={`${(freePercentage / 100) * 502.4} 502.4`}
                          strokeLinecap='butt'
                        />
                      )}

                      {/* Premium segment */}
                      {subscriptionData.premium > 0 && (
                        <circle
                          cx='100'
                          cy='100'
                          r='80'
                          fill='none'
                          stroke='#4ADE80'
                          strokeWidth='40'
                          strokeDasharray={`${(premiumPercentage / 100) * 502.4} 502.4`}
                          strokeDashoffset={`-${(freePercentage / 100) * 502.4}`}
                          strokeLinecap='butt'
                        />
                      )}
                    </svg>

                    {/* Center text */}
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='text-center'>
                        <div className='text-3xl font-bold text-gray-900'>{subscriptionData.total}</div>
                        <div className='text-sm text-gray-500 mt-1'>Tổng số</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Legend */}
              <div className='flex-1 space-y-4'>
                {loadingSubscription ? (
                  <div className='text-gray-500'>Đang tải...</div>
                ) : (
                  <>
                    {/* Total */}
                    <div className='flex items-center justify-between p-3 bg-purple-50 rounded-lg'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-4 h-4 rounded-full bg-purple-500'></div>
                        <span className='text-sm font-medium text-gray-900'>Tổng số</span>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-bold text-gray-900'>{subscriptionData.total}</div>
                        <div className='text-xs text-gray-500'>100%</div>
                      </div>
                    </div>

                    {/* Free */}
                    <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-4 h-4 rounded-full bg-blue-400'></div>
                        <span className='text-sm font-medium text-gray-900'>Miễn phí</span>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-bold text-gray-900'>{subscriptionData.free}</div>
                        <div className='text-xs text-gray-500'>{Math.round(freePercentage)}%</div>
                      </div>
                    </div>

                    {/* Premium */}
                    <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-4 h-4 rounded-full bg-green-400'></div>
                        <span className='text-sm font-medium text-gray-900'>Premium</span>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-bold text-gray-900'>{subscriptionData.premium}</div>
                        <div className='text-xs text-gray-500'>{Math.round(premiumPercentage)}%</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Revenue Chart */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <div className='mb-4'>
              <p className='text-sm text-gray-500 mb-1'>Doanh thu</p>
              <h3 className='text-lg font-semibold text-gray-900'>
                {loading ? (
                  <span className='text-gray-400'>Đang tải...</span>
                ) : (
                  `${revenueData.totalRevenue.toLocaleString()} VNĐ`
                )}
              </h3>
            </div>

            {/* Mini Chart */}
            <div className='h-40 bg-gray-50 rounded-lg flex items-end p-4 gap-3'>
              {!loading && revenueData.totalRevenue > 0 ? (
                <>
                  {/* Item Revenue Bar */}
                  <div className='flex-1 flex flex-col items-center gap-2'>
                    <div className='w-full flex items-end justify-center' style={{ height: '120px' }}>
                      <div
                        className='bg-purple-500 rounded-t-lg w-full transition-all duration-300 flex items-end justify-center pb-1'
                        style={{
                          height: `${(revenueData.itemRevenue / revenueData.totalRevenue) * 100}%`,
                          minHeight: '30px'
                        }}
                      >
                        <span className='text-xs text-white font-medium'>
                          {Math.round((revenueData.itemRevenue / revenueData.totalRevenue) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Course Revenue Bar */}
                  <div className='flex-1 flex flex-col items-center gap-2'>
                    <div className='w-full flex items-end justify-center' style={{ height: '120px' }}>
                      <div
                        className='bg-blue-400 rounded-t-lg w-full transition-all duration-300 flex items-end justify-center pb-1'
                        style={{
                          height: `${(revenueData.courseRevenue / revenueData.totalRevenue) * 100}%`,
                          minHeight: '30px'
                        }}
                      >
                        <span className='text-xs text-white font-medium'>
                          {Math.round((revenueData.courseRevenue / revenueData.totalRevenue) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Premium Revenue Bar */}
                  <div className='flex-1 flex flex-col items-center gap-2'>
                    <div className='w-full flex items-end justify-center' style={{ height: '120px' }}>
                      <div
                        className='bg-green-400 rounded-t-lg w-full transition-all duration-300 flex items-end justify-center pb-1'
                        style={{
                          height: `${(revenueData.premiumRevenue / revenueData.totalRevenue) * 100}%`,
                          minHeight: '30px'
                        }}
                      >
                        <span className='text-xs text-white font-medium'>
                          {Math.round((revenueData.premiumRevenue / revenueData.totalRevenue) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className='w-full h-full flex items-center justify-center text-gray-400 text-sm'>
                  {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                </div>
              )}
            </div>

            <div className='mt-4 space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                  <span className='text-gray-600'>Vật phẩm</span>
                </div>
                <span className='font-medium'>
                  {loading ? '...' : `${revenueData.itemRevenue.toLocaleString()} VNĐ`}
                </span>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
                  <span className='text-gray-600'>Khóa học</span>
                </div>
                <span className='font-medium'>
                  {loading ? '...' : `${revenueData.courseRevenue.toLocaleString()} VNĐ`}
                </span>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                  <span className='text-gray-600'>Gói Premium</span>
                </div>
                <span className='font-medium'>
                  {loading ? '...' : `${revenueData.premiumRevenue.toLocaleString()} VNĐ`}
                </span>
              </div>
            </div>
          </div>

          {/* Popular Language Pack */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <div className='mb-4'>
              <p className='text-sm text-gray-500 mb-1'>Thống kê</p>
              <h3 className='text-lg font-semibold text-gray-900'>Gói ngôn ngữ phổ biến</h3>
            </div>

            {loadingLanguages ? (
              <div className='text-gray-500'>Đang tải...</div>
            ) : (
              <div className='space-y-4'>
                {popularLanguages.map((lang, index) => (
                  <div key={index}>
                    <div className='flex justify-between text-sm mb-1'>
                      <span className='text-gray-600'>{lang.name}</span>
                      <span className='text-gray-900 font-medium'>{Math.round(lang.percentage)}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-purple-500 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${lang.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Coins */}
          <div className='bg-white rounded-lg p-6 shadow-sm'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Tổng số xu</p>
                <h3 className='text-lg font-semibold text-gray-900'>
                  {loadingCoins ? (
                    <span className='text-gray-400'>Đang tải...</span>
                  ) : (
                    coinData.totalCoin.toLocaleString()
                  )}
                </h3>
                <p className='text-xs text-gray-400 mt-1'>Xu đã được sử dụng trong hệ thống</p>
              </div>
              <div className='w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center shadow-md'>
                <svg className='w-10 h-10 text-yellow-600' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z' />
                </svg>
              </div>
            </div>

            <div className='border-t pt-4'>
              <p className='text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide'>Phân bổ theo nguồn</p>
              <div className='space-y-4'>
                {/* Item Coins */}
                <div>
                  <div className='flex items-center justify-between mb-1.5'>
                    <div className='flex items-center gap-2'>
                      <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                      <span className='text-sm font-medium text-gray-700'>Xu từ Vật phẩm</span>
                    </div>
                    <span className='text-sm font-bold text-gray-900'>
                      {loadingCoins ? '...' : coinData.itemCoin.toLocaleString()}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full'
                      style={{
                        width: `${coinData.totalCoin > 0 ? (coinData.itemCoin / coinData.totalCoin) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Course Coins */}
                <div>
                  <div className='flex items-center justify-between mb-1.5'>
                    <div className='flex items-center gap-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-sm font-medium text-gray-700'>Xu từ Khóa học</span>
                    </div>
                    <span className='text-sm font-bold text-gray-900'>
                      {loadingCoins ? '...' : coinData.courseCoin.toLocaleString()}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full'
                      style={{
                        width: `${coinData.totalCoin > 0 ? (coinData.courseCoin / coinData.totalCoin) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard
