import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import AdminLayout from '~/components/layout/AdminLayout'
import axiosInstance from '~/config/axios'
import { toast } from 'sonner'
import type { Booking, BookingsResponse } from '~/types/booking'

const BookingsPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [totalPages, setTotalPages] = useState(0)

  // Filter states
  const [searchFieldName, setSearchFieldName] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(500000)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')

  const fetchBookings = async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: pageSize.toString()
      })

      if (searchFieldName) {
        params.append('fieldName', searchFieldName)
      }
      if (searchEmail) {
        params.append('email', searchEmail)
      }
      if (minPrice > 0) {
        params.append('minPrice', minPrice.toString())
      }
      if (maxPrice > 0 && maxPrice !== 500000) {
        params.append('maxPrice', maxPrice.toString())
      }
      if (selectedStatus) {
        params.append('status', selectedStatus)
      }
      if (selectedDate) {
        params.append('date', selectedDate)
      }

      const response = await axiosInstance.get<BookingsResponse>(`v1/bookings?${params.toString()}`)

      if (response.data.success && response.data.data) {
        setBookings(response.data.data)
        setTotalPages(response.data.totalPages)
        setCurrentPage(response.data.pageNumber)
      } else {
        toast.error('Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      let errorMsg = 'Failed to fetch bookings'
      if (error instanceof Error) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, location])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBookings(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchBookings(newPage)
    }
  }

  const handleReset = () => {
    setSearchFieldName('')
    setSearchEmail('')
    setMinPrice(0)
    setMaxPrice(500000)
    setSelectedStatus('')
    setSelectedDate('')
    setCurrentPage(1)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case '0':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'cancelled':
      case '2':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'completed':
      case '3':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case '0':
        return 'Chờ thanh toán'
      case 'cancelled':
      case '2':
        return 'Đã hủy'
      case 'completed':
      case '3':
        return 'Thành công'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // Get HH:mm from HH:mm:ss
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Quản Lý Booking</h1>
            <p className='text-gray-500 mt-1'>Quản lý và theo dõi tất cả các booking</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <form onSubmit={handleSearch} className='space-y-4'>
            {/* Row 1: Tên Sân và Email */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Tên Sân</label>
                <input
                  type='text'
                  value={searchFieldName}
                  onChange={(e) => setSearchFieldName(e.target.value)}
                  placeholder='Nhập tên sân...'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Email Khách Hàng</label>
                <input
                  type='email'
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder='Nhập email khách hàng...'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            {/* Row 2: Giá và Trạng thái */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Giá Tối Thiểu</label>
                <input
                  type='number'
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  min='0'
                  placeholder='0'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Giá Tối Đa</label>
                <input
                  type='number'
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  min='0'
                  placeholder='500000'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Trạng Thái</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>Tất cả</option>
                  <option value='0'>Chờ thanh toán</option>
                  <option value='2'>Đã hủy</option>
                  <option value='3'>Thành công</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Ngày Đặt</label>
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={handleReset}
                className='px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium'
              >
                Đặt Lại
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium'
              >
                {loading ? 'Đang tìm...' : 'Tìm Kiếm'}
              </button>
            </div>
          </form>
        </div>

        {/* Bookings Table */}
        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Tên Sân
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Email Khách Hàng
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Ngày Đặt
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Khung Giờ
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Tổng Tiền
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Trạng Thái
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan={7} className='px-6 py-12 text-center'>
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                        <span className='ml-3 text-gray-500'>Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.id} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>{booking.fieldName}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-600'>{booking.email}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>{formatDate(booking.date)}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-900'>
                          {booking.timeSlots
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map((slot) => (
                              <div key={slot.id} className='flex items-center gap-1'>
                                <span className='text-xs bg-gray-100 px-2 py-1 rounded'>
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-semibold text-gray-900'>
                          {booking.totalPrice.toLocaleString()}đ
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(
                            booking.status
                          )}`}
                        >
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                            className='text-blue-600 hover:text-blue-800 font-medium'
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className='px-6 py-12 text-center'>
                      <div className='flex flex-col items-center justify-center'>
                        <svg
                          className='w-16 h-16 text-gray-400 mb-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                          />
                        </svg>
                        <p className='text-gray-500 text-lg font-medium'>Không có booking nào</p>
                        <p className='text-gray-400 text-sm'>Thử thay đổi các bộ lọc của bạn</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center justify-center'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  Trước
                </button>

                {/* Page Numbers */}
                <div className='flex gap-1'>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, idx, arr) => {
                      if (idx > 0 && arr[idx - 1] !== page - 1) {
                        return (
                          <span key={`ellipsis-${page}`} className='px-2 py-2 text-gray-400'>
                            ...
                          </span>
                        )
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 border border-gray-300 hover:bg-gray-50'
                          } disabled:cursor-not-allowed`}
                        >
                          {page}
                        </button>
                      )
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  Tiếp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default BookingsPage
