import React, { useEffect, useState } from 'react'
import AdminLayout from '~/components/layout/AdminLayout'
import { toast } from 'sonner'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import axiosInstance from '~/config/axios'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  Users,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp
} from 'lucide-react'
import type {
  DashboardSummary,
  GetTopFieldsResponse,
  GetRevenueResponse,
  DataServiceResponse
} from '~/types/dashboard'

const Dashboard: React.FC = () => {
  // State for dashboard data
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [topFields, setTopFields] = useState<GetTopFieldsResponse | null>(null)
  const [revenueData, setRevenueData] = useState<GetRevenueResponse | null>(null)
  
  // Loading states
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingTopFields, setLoadingTopFields] = useState(true)
  const [loadingRevenue, setLoadingRevenue] = useState(true)
  
  // Filters
  const [revenueView, setRevenueView] = useState<'day' | 'month' | 'year'>('month')
  const [topCount, setTopCount] = useState(5)
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 6)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchDashboardSummary()
    fetchTopFields()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchRevenueData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revenueView])

  const fetchDashboardSummary = async () => {
    try {
      setLoadingSummary(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', new Date(startDate).toISOString())
      if (endDate) params.append('endDate', new Date(endDate).toISOString())

      const response = await axiosInstance.get<DataServiceResponse<DashboardSummary>>(
        `/v1/dashboards/summary?${params.toString()}`
      )

      if (response.data.success && response.data.data) {
        setSummary(response.data.data)
      } else {
        toast.error(response.data.message || 'Failed to fetch dashboard summary')
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      toast.error('Unable to load dashboard summary')
    } finally {
      setLoadingSummary(false)
    }
  }

  const fetchTopFields = async () => {
    try {
      setLoadingTopFields(true)
      const response = await axiosInstance.get<DataServiceResponse<GetTopFieldsResponse>>(
        `/v1/dashboards/top-fields?topCount=${topCount}`
      )

      if (response.data.success && response.data.data) {
        setTopFields(response.data.data)
      } else {
        toast.error(response.data.message || 'Failed to fetch top fields')
      }
    } catch (error) {
      console.error('Error fetching top fields:', error)
      toast.error('Unable to load top fields')
    } finally {
      setLoadingTopFields(false)
    }
  }

  const fetchRevenueData = async () => {
    try {
      setLoadingRevenue(true)
      const params = new URLSearchParams()
      params.append('view', revenueView)
      if (startDate) params.append('startDate', new Date(startDate).toISOString())
      if (endDate) params.append('endDate', new Date(endDate).toISOString())

      const response = await axiosInstance.get<DataServiceResponse<GetRevenueResponse>>(
        `/v1/dashboards/revenue?${params.toString()}`
      )

      if (response.data.success && response.data.data) {
        setRevenueData(response.data.data)
      } else {
        toast.error(response.data.message || 'Failed to fetch revenue data')
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
      toast.error('Unable to load revenue data')
    } finally {
      setLoadingRevenue(false)
    }
  }

  const handleApplyFilters = () => {
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date')
      return
    }
    fetchDashboardSummary()
    fetchRevenueData()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  return (
    <AdminLayout>
      <div className='space-y-6 p-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-500 mt-2'>Overview of your pickleball booking business</p>
        </div>

        {/* Date Range Filter */}
        <Card className='p-6'>
          <div className='flex items-center gap-4 flex-wrap'>
            <div className='flex items-center gap-2 flex-1 min-w-[200px]'>
              <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>Start Date:</label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div className='flex items-center gap-2 flex-1 min-w-[200px]'>
              <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>End Date:</label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <Button onClick={handleApplyFilters} disabled={loadingSummary || loadingRevenue}>
              {loadingSummary || loadingRevenue ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Total Bookings */}
          <Card className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Total Bookings</p>
                <h3 className='text-2xl font-bold text-gray-900'>
                  {loadingSummary ? '...' : formatNumber(summary?.totalBookings || 0)}
                </h3>
                <div className='flex items-center gap-2 mt-2'>
                  <div className='flex items-center gap-1 text-xs text-green-600'>
                    <CheckCircle className='w-3 h-3' />
                    <span>{formatNumber(summary?.completedBookings || 0)} completed</span>
                  </div>
                </div>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                <Calendar className='w-6 h-6 text-blue-600' />
              </div>
            </div>
          </Card>

          {/* Total Customers */}
          <Card className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Total Customers</p>
                <h3 className='text-2xl font-bold text-gray-900'>
                  {loadingSummary ? '...' : formatNumber(summary?.totalCustomers || 0)}
                </h3>
                <p className='text-xs text-gray-500 mt-2'>Registered users</p>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                <Users className='w-6 h-6 text-green-600' />
              </div>
            </div>
          </Card>

          {/* Total Fields */}
          <Card className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Total Fields</p>
                <h3 className='text-2xl font-bold text-gray-900'>
                  {loadingSummary ? '...' : formatNumber(summary?.totalFields || 0)}
                </h3>
                <p className='text-xs text-gray-500 mt-2'>Available courts</p>
              </div>
              <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center'>
                <MapPin className='w-6 h-6 text-purple-600' />
              </div>
            </div>
          </Card>

          {/* Total Revenue */}
          <Card className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Total Revenue</p>
                <h3 className='text-2xl font-bold text-gray-900'>
                  {loadingSummary ? '...' : formatCurrency(summary?.totalRevenue || 0)}
                </h3>
                <div className='flex items-center gap-1 text-xs text-green-600 mt-2'>
                  <TrendingUp className='w-3 h-3' />
                  <span>Month: {formatCurrency(summary?.monthRevenue || 0)}</span>
                </div>
              </div>
              <div className='w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center'>
                <DollarSign className='w-6 h-6 text-yellow-600' />
              </div>
            </div>
          </Card>
        </div>

        {/* Booking Status Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card className='p-6 border-l-4 border-l-green-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Completed Bookings</p>
                <h3 className='text-xl font-bold text-gray-900'>
                  {loadingSummary ? '...' : formatNumber(summary?.completedBookings || 0)}
                </h3>
              </div>
              <CheckCircle className='w-8 h-8 text-green-500' />
            </div>
          </Card>

          <Card className='p-6 border-l-4 border-l-orange-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Pending Bookings</p>
                <h3 className='text-xl font-bold text-gray-900'>
                  {loadingSummary ? '...' : formatNumber(summary?.pendingBookings || 0)}
                </h3>
              </div>
              <Clock className='w-8 h-8 text-orange-500' />
            </div>
          </Card>

          <Card className='p-6 border-l-4 border-l-red-500'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Cancelled Bookings</p>
                <h3 className='text-xl font-bold text-gray-900'>
                  {loadingSummary ? '...' : formatNumber(summary?.cancelledBookings || 0)}
                </h3>
              </div>
              <XCircle className='w-8 h-8 text-red-500' />
            </div>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>Revenue Overview</h3>
              <p className='text-sm text-gray-500 mt-1'>
                {revenueData ? `Total: ${formatCurrency(revenueData.totalRevenue)}` : 'Loading...'}
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant={revenueView === 'day' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setRevenueView('day')}
              >
                Day
              </Button>
              <Button
                variant={revenueView === 'month' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setRevenueView('month')}
              >
                Month
              </Button>
              <Button
                variant={revenueView === 'year' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setRevenueView('year')}
              >
                Year
              </Button>
            </div>
          </div>

          {loadingRevenue ? (
            <div className='h-80 flex items-center justify-center text-gray-500'>Loading chart...</div>
          ) : revenueData && revenueData.data.length > 0 ? (
            <ResponsiveContainer width='100%' height={400}>
              <BarChart data={revenueData.data}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='label' />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Bar dataKey='revenue' fill='#3b82f6' name='Revenue' />
                <Bar dataKey='bookingCount' fill='#10b981' name='Bookings' />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className='h-80 flex items-center justify-center text-gray-400'>No data available</div>
          )}
        </Card>

        {/* Revenue Trend Line Chart */}
        {revenueData && revenueData.data.length > 0 && (
          <Card className='p-6'>
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-gray-900'>Revenue Trend</h3>
              <p className='text-sm text-gray-500 mt-1'>Track revenue growth over time</p>
            </div>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={revenueData.data}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='label' />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Line type='monotone' dataKey='revenue' stroke='#3b82f6' strokeWidth={2} name='Revenue' />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Top Performing Fields */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>Top Performing Fields</h3>
              <p className='text-sm text-gray-500 mt-1'>Most booked courts by revenue</p>
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-sm text-gray-600'>Show:</label>
              <select
                value={topCount}
                onChange={(e) => {
                  setTopCount(Number(e.target.value))
                  setTimeout(() => fetchTopFields(), 0)
                }}
                className='px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={20}>Top 20</option>
              </select>
            </div>
          </div>

          {loadingTopFields ? (
            <div className='text-center py-8 text-gray-500'>Loading top fields...</div>
          ) : topFields && topFields.topFields.length > 0 ? (
            <div className='space-y-4'>
              {topFields.topFields.map((field, index) => (
                <div key={field.fieldId} className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition'>
                  <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm'>
                    {index + 1}
                  </div>
                  {field.imageUrl && (
                    <img
                      src={field.imageUrl}
                      alt={field.fieldName}
                      className='w-16 h-16 object-cover rounded-lg'
                    />
                  )}
                  <div className='flex-1'>
                    <h4 className='font-semibold text-gray-900'>{field.fieldName}</h4>
                    <p className='text-sm text-gray-500'>{field.fieldAddress || 'No address'}</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-gray-900'>{formatCurrency(field.totalRevenue)}</p>
                    <p className='text-sm text-gray-500'>{formatNumber(field.bookingCount)} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-400'>No fields data available</div>
          )}
        </Card>

        {/* Revenue Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card className='p-6 bg-gradient-to-br from-blue-50 to-blue-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-blue-700 mb-1'>Today's Revenue</p>
                <h3 className='text-3xl font-bold text-blue-900'>
                  {loadingSummary ? '...' : formatCurrency(summary?.todayRevenue || 0)}
                </h3>
              </div>
              <TrendingUp className='w-12 h-12 text-blue-600 opacity-50' />
            </div>
          </Card>

          <Card className='p-6 bg-gradient-to-br from-green-50 to-green-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-green-700 mb-1'>This Month's Revenue</p>
                <h3 className='text-3xl font-bold text-green-900'>
                  {loadingSummary ? '...' : formatCurrency(summary?.monthRevenue || 0)}
                </h3>
              </div>
              <DollarSign className='w-12 h-12 text-green-600 opacity-50' />
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard
