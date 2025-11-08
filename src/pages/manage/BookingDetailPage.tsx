import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import AdminLayout from '~/components/layout/AdminLayout'
import axiosInstance from '~/config/axios'
import { toast } from 'sonner'
import type { Booking, BookingDetailResponse } from '~/types/booking'

const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBookingDetail = async () => {
    if (!id) return

    try {
      setLoading(true)
      const response = await axiosInstance.get<BookingDetailResponse>(`v1/bookings/${id}`)

      if (response.data.success && response.data.data) {
        setBooking(response.data.data)
      } else {
        toast.error('Failed to fetch booking details')
        navigate('/bookings')
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
      toast.error('Failed to fetch booking details')
      navigate('/bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookingDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // Get HH:mm from HH:mm:ss
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='flex items-center gap-3'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            <span className='text-gray-500 text-lg'>Đang tải...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!booking) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <svg className='w-16 h-16 text-gray-400 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              />
            </svg>
            <p className='text-gray-500 text-lg font-medium'>Không tìm thấy booking</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <button
              onClick={() => navigate('/bookings')}
              className='text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center gap-1'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
              Quay lại danh sách
            </button>
            <h1 className='text-3xl font-bold text-gray-900'>Chi Tiết Booking</h1>
            <p className='text-gray-500 mt-1'>Thông tin chi tiết về booking</p>
          </div>

          {/* Status Badge */}
          <span
            className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusBadgeClass(
              booking.status
            )}`}
          >
            {getStatusText(booking.status)}
          </span>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Booking Information */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Basic Info Card */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <svg className='w-6 h-6 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                Thông tin cơ bản
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-500 mb-1'>Tên Sân</label>
                  <p className='text-gray-900 font-semibold'>{booking.fieldName}</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 mb-1'>Email Khách Hàng</label>
                  <p className='text-gray-900'>{booking.email}</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 mb-1'>Ngày đặt</label>
                  <p className='text-gray-900'>{formatDate(booking.date)}</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 mb-1'>Tổng tiền</label>
                  <p className='font-bold text-lg text-blue-600'>{booking.totalPrice.toLocaleString()}đ</p>
                </div>
              </div>
            </div>

            {/* Time Slots Card */}
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <svg className='w-6 h-6 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                Khung giờ đặt
              </h2>

              <div className='space-y-3'>
                {booking.timeSlots
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((slot, index) => (
                    <div
                      key={slot.id}
                      className='flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold'>
                          {index + 1}
                        </div>
                        <div>
                          <p className='text-sm text-gray-500'>Khung giờ</p>
                          <p className='text-lg font-bold text-gray-900'>
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-sm p-6 sticky top-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <svg className='w-6 h-6 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                </svg>
                Hành động
              </h2>

              <div className='space-y-3'>
                {(booking.status?.toLowerCase() === 'cancelled' ||
                  booking.status === '2' ||
                  booking.status?.toLowerCase() === 'completed' ||
                  booking.status === '3' ||
                  booking.status?.toLowerCase() === 'pending' ||
                  booking.status === '0') && (
                  <div className='p-4 bg-gray-50 rounded-lg border border-gray-200 text-center'>
                    <p className='text-gray-600 text-sm'>
                      {booking.status?.toLowerCase() === 'completed' || booking.status === '3'
                        ? 'Booking đã thanh toán thành công'
                        : booking.status?.toLowerCase() === 'cancelled' || booking.status === '2'
                          ? 'Booking đã bị hủy'
                          : 'Booking đang chờ thanh toán'}
                    </p>
                  </div>
                )}

                <div className='pt-3 border-t border-gray-200'>
                  <button
                    onClick={() => navigate('/bookings')}
                    className='w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium'
                  >
                    Quay lại danh sách
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default BookingDetailPage
