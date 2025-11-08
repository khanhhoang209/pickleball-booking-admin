import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import AdminLayout from '~/components/layout/AdminLayout'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import axiosInstance from '~/config/axios'
import { toast } from 'sonner'
import type { Pricing, PricingsResponse, DayOfWeekType, TimeSlot } from '~/types/pricing'
import { DayOfWeek, DayOfWeekLabels } from '~/types/pricing'
import type { Field } from '~/types/field'

const PricingsPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [pricings, setPricings] = useState<Pricing[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filter states
  const [fields, setFields] = useState<Field[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string>('')
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<DayOfWeekType | ''>('')
  const [isActive, setIsActive] = useState(true)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Pricing | null>(null)
  const [deleting, setDeleting] = useState(false)
  // removed restore feature per request

  // Fetch fields for filter
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await axiosInstance.get('v1/fields', {
          params: {
            isActive: true,
            pageNumber: 1,
            pageSize: 100
          }
        })
        if (response.data.success && response.data.data) {
          setFields(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching fields:', error)
      }
    }
    fetchFields()
  }, [])

  // Fetch timeslots for display fallback (some APIs may not expand timeSlot)
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await axiosInstance.get('v1/timeslots', {
          params: {
            isActive: true,
            pageNumber: 1,
            pageSize: 200
          }
        })
        if (response.data.success && response.data.data) {
          setTimeSlots(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching time slots:', error)
      }
    }
    fetchTimeSlots()
  }, [])

  const fetchPricings = async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: pageSize.toString(),
        isActive: isActive.toString()
      })

      if (selectedFieldId) {
        params.append('fieldId', selectedFieldId)
      }
      if (selectedDayOfWeek !== '') {
        params.append('dayOfWeek', selectedDayOfWeek.toString())
      }

      const response = await axiosInstance.get<PricingsResponse>(`v1/pricings?${params.toString()}`)

      if (response.data.success && response.data.data) {
        setPricings(response.data.data)
        setTotalCount(response.data.totalCount)
        setTotalPages(response.data.totalPages)
        setCurrentPage(response.data.pageNumber)
      } else {
        toast.error('Không thể tải danh sách giá')
      }
    } catch (error) {
      console.error('Error fetching pricings:', error)
      let errorMsg = 'Không thể tải danh sách giá'
      if (error instanceof Error) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPricings(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldId, selectedDayOfWeek, isActive, location])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchPricings(newPage)
    }
  }

  const handleReset = () => {
    setSelectedFieldId('')
    setSelectedDayOfWeek('')
    setIsActive(true)
    setCurrentPage(1)
  }

  const handleDeleteClick = (pricing: Pricing) => {
    setDeleteTarget(pricing)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)

      // Determine range to delete: prefer batch range; fallback to slot times
      const pick = deleteTarget
      const pickStart = pick.rangeStartTime || pick.timeSlotStartTime || pick.timeSlot?.startTime || (() => {
        const slot = timeSlots.find((t) => t.id === pick.timeSlotId)
        return slot?.startTime || ''
      })()
      const pickEnd = pick.rangeEndTime || pick.timeSlotEndTime || pick.timeSlot?.endTime || (() => {
        const slot = timeSlots.find((t) => t.id === pick.timeSlotId)
        return slot?.endTime || ''
      })()

      const toHHmm = (t: string) => (t ? t.substring(0, 5) : '')
      const payload = {
        fieldId: pick.fieldId,
        dayOfWeek: pick.dayOfWeek,
        startTime: `${toHHmm(pickStart)}:00`,
        endTime: `${toHHmm(pickEnd)}:00`
      }

      await axiosInstance.delete('v1/pricings', { data: payload })

      toast.success('Xóa giá theo khoảng thành công!')
      await fetchPricings(currentPage)
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
    } catch (err) {
      console.error('Error deleting pricing:', err)
      let errorMsg = 'Lỗi khi xóa giá theo khoảng'
      if (err instanceof Error) {
        errorMsg = (err as any)?.response?.data?.message || err.message
      }
      toast.error(errorMsg)
    } finally {
      setDeleting(false)
    }
  }

  // restore handler removed

  const formatTime = (time: string) => {
    if (!time) return ''
    return time.substring(0, 5) // Format HH:mm:ss to HH:mm
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Quản Lý Giá</h1>
            <p className='text-gray-500 mt-1'>Quản lý giá thuê sân theo thời gian</p>
          </div>
          <button
            onClick={() => navigate('/pricings/create')}
            className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium flex items-center gap-2'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            Thêm Giá Mới
          </button>
        </div>

        {/* Filter Section */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Field Filter */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Sân</label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>Tất cả sân</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day of Week Filter */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Ngày trong tuần</label>
                <select
                  value={selectedDayOfWeek}
                  onChange={(e) => setSelectedDayOfWeek(e.target.value === '' ? '' : Number(e.target.value) as DayOfWeekType)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>Tất cả các ngày</option>
                  {Object.entries(DayOfWeek).map(([key, value]) => (
                    <option key={key} value={value}>
                      {DayOfWeekLabels[value as DayOfWeekType]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Trạng Thái</label>
                <select
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='true'>Đang hoạt động</option>
                  <option value='false'>Không hoạt động</option>
                </select>
              </div>
            </div>

            {/* Reset Button */}
            <div className='flex justify-end'>
              <button
                type='button'
                onClick={handleReset}
                className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium'
              >
                Đặt Lại Bộ Lọc
              </button>
            </div>
          </div>
        </div>

        {/* Pricings Table */}
        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
          {loading ? (
            <div className='p-12 text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
              <p className='text-gray-600'>Đang tải...</p>
            </div>
          ) : pricings.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Sân
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Khung Giờ
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Khoảng Thời Gian
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Ngày
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Giá
                    </th>
                    {isActive && (
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Hành Động
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {pricings.map((pricing) => (
                    <tr key={pricing.id} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {pricing.field?.name || fields.find((f) => f.id === pricing.fieldId)?.name || 'N/A'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {pricing.timeSlotStartTime && pricing.timeSlotEndTime
                            ? `${formatTime(pricing.timeSlotStartTime)} - ${formatTime(pricing.timeSlotEndTime)}`
                            : pricing.timeSlot
                            ? `${formatTime(pricing.timeSlot.startTime)} - ${formatTime(pricing.timeSlot.endTime)}`
                            : (() => {
                                const slot = timeSlots.find((t) => t.id === pricing.timeSlotId)
                                return slot ? `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}` : 'N/A'
                              })()}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {pricing.rangeStartTime && pricing.rangeEndTime
                            ? `${formatTime(pricing.rangeStartTime)} - ${formatTime(pricing.rangeEndTime)}`
                            : '—'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
                          {DayOfWeekLabels[pricing.dayOfWeek]}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-semibold text-green-600'>
                          {pricing.price.toLocaleString()}đ
                        </div>
                      </td>
                      {isActive && (
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                          <button
                            onClick={() => navigate(`/pricings/${pricing.id}/edit`)}
                            className='inline-flex items-center px-3 py-1.5 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors'
                          >
                            <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                              />
                            </svg>
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteClick(pricing)}
                            className='inline-flex items-center px-3 py-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors'
                          >
                            <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                              />
                            </svg>
                            Xóa
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='p-12 text-center'>
              <svg
                className='w-16 h-16 text-gray-400 mx-auto mb-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                />
              </svg>
              <p className='text-gray-500 text-lg font-medium'>Không có dữ liệu</p>
              <p className='text-gray-400 text-sm'>Thử thay đổi các bộ lọc của bạn</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                Hiển thị <span className='font-semibold'>{(currentPage - 1) * pageSize + 1}</span> đến{' '}
                <span className='font-semibold'>{Math.min(currentPage * pageSize, totalCount)}</span> trong{' '}
                <span className='font-semibold'>{totalCount}</span> bản ghi
              </div>

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

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title='Xóa Giá Theo Khoảng'
        description={(() => {
          if (!deleteTarget) return 'Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.'
          const fieldName = fields.find((f) => f.id === deleteTarget.fieldId)?.name || 'N/A'
          const s = deleteTarget.rangeStartTime || deleteTarget.timeSlotStartTime || deleteTarget.timeSlot?.startTime
          const e = deleteTarget.rangeEndTime || deleteTarget.timeSlotEndTime || deleteTarget.timeSlot?.endTime
          const fmt = (t?: string) => (t ? t.substring(0, 5) : '—')
          return `Sẽ xóa tất cả pricing cho sân "${fieldName}" vào ${DayOfWeekLabels[deleteTarget.dayOfWeek]} trong khoảng ${fmt(s)} - ${fmt(e)}.`
        })()}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={deleting}
        confirmText='Xóa'
        cancelText='Hủy'
      />
    </AdminLayout>
  )
}

export default PricingsPage
