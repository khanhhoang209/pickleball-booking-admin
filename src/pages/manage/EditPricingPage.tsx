import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import AdminLayout from '~/components/layout/AdminLayout'
import axiosInstance from '~/config/axios'
import { toast } from 'sonner'
import type { DayOfWeekType } from '~/types/pricing'
import { DayOfWeek, DayOfWeekLabels } from '~/types/pricing'
import type { Field } from '~/types/field'

const EditPricingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [fields, setFields] = useState<Field[]>([])
  const [loadingFields, setLoadingFields] = useState(true)

  interface EditPricingRangeFormData {
    fieldId: string
    dayOfWeek: DayOfWeekType | null
    startTime: string // HH:mm
    endTime: string   // HH:mm
    price: number
  }

  const [formData, setFormData] = useState<EditPricingRangeFormData>({
    fieldId: '',
    startTime: '',
    endTime: '',
    dayOfWeek: null,
    price: 0
  })

  // Fetch fields
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoadingFields(true)
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
      } catch (err) {
        console.error('Error fetching fields:', err)
        toast.error('Không thể tải danh sách sân')
      } finally {
        setLoadingFields(false)
      }
    }

    fetchFields()
  }, [])

  // Fetch pricing data
  useEffect(() => {
    if (!id) {
      toast.error('Invalid pricing ID')
      setLoading(false)
      return
    }

    const fetchPricing = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get(`v1/pricings/${id}`)

        if (response.data.success && response.data.data) {
          const pricing = response.data.data as {
            fieldId: string
            timeSlotId: string
            dayOfWeek: DayOfWeekType
            price: number
            timeSlotStartTime?: string
            timeSlotEndTime?: string
            rangeStartTime?: string
            rangeEndTime?: string
            timeSlot?: { startTime: string; endTime: string }
          }

          // Prefer range from API; fallback to timeSlot times
          const rawStart = pricing.rangeStartTime || pricing.timeSlotStartTime || pricing.timeSlot?.startTime || ''
          const rawEnd = pricing.rangeEndTime || pricing.timeSlotEndTime || pricing.timeSlot?.endTime || ''
          const toHHmm = (t: string) => (t ? t.substring(0, 5) : '')

          setFormData({
            fieldId: pricing.fieldId,
            startTime: toHHmm(rawStart),
            endTime: toHHmm(rawEnd),
            dayOfWeek: pricing.dayOfWeek,
            price: pricing.price
          })
        } else {
          toast.error(response.data.message || 'Không thể tải dữ liệu giá')
        }
      } catch (err) {
        console.error('Error fetching pricing:', err)
        let errorMsg = 'Lỗi khi tải dữ liệu giá'
        if (err instanceof Error) {
          errorMsg = err.message
        }
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchPricing()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price'
        ? (value === '' ? 0 : Number(value))
        : name === 'dayOfWeek'
        ? (value === '' ? null : Number(value))
        : value
    }))
  }

  const allowedMinute = (mm: number) => mm === 0 || mm === 30

  const timeValidation = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return { ok: false, reason: 'empty' }
    const start = new Date(`2000-01-01T${formData.startTime}:00`)
    const end = new Date(`2000-01-01T${formData.endTime}:00`)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { ok: false, reason: 'format' }
    if (start >= end) return { ok: false, reason: 'order' }
    const sm = start.getMinutes()
    const em = end.getMinutes()
    if (!allowedMinute(sm) || !allowedMinute(em)) return { ok: false, reason: 'minute' }
    const diffMin = Math.round((end.getTime() - start.getTime()) / 60000)
    if (diffMin % 30 !== 0) return { ok: false, reason: 'interval' }
    const slotCount = diffMin / 30
    return { ok: true, reason: 'ok', diffMin, slotCount }
  }, [formData.startTime, formData.endTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.fieldId) {
      toast.error('Vui lòng chọn sân')
      return
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error('Vui lòng chọn khung giờ bắt đầu và kết thúc')
      return
    }
    if (!timeValidation.ok) {
      const map: Record<string, string> = {
        empty: 'Vui lòng chọn khung giờ',
        format: 'Định dạng giờ không hợp lệ',
        order: 'EndTime phải lớn hơn StartTime',
        minute: 'Phút chỉ được 00 hoặc 30',
        interval: 'Khoảng thời gian phải chia hết cho 30 phút'
      }
      toast.error(map[timeValidation.reason] || 'Khung giờ không hợp lệ')
      return
    }
    if (formData.dayOfWeek === null) {
      toast.error('Vui lòng chọn ngày trong tuần')
      return
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ')
      return
    }

    try {
      setSubmitting(true)

      // convert HH:mm -> HH:mm:ss for API TimeOnly binder
      const payload = {
        fieldId: formData.fieldId,
        dayOfWeek: formData.dayOfWeek,
        startTime: `${formData.startTime}:00`,
        endTime: `${formData.endTime}:00`,
        price: formData.price
      }

  // Update pricing by range (controller uses [HttpPut] on /pricings)
  await axiosInstance.put('v1/pricings', payload)

      toast.success('Cập nhật giá thành công!')
      navigate('/pricings')
    } catch (err: unknown) {
      console.error('Error updating pricing:', err)
      // Nếu status 204 hoặc 200 không phải lỗi, coi là thành công
      if (err instanceof Error && 'response' in err) {
        const error = err as { response?: { status: number } }
        if (error.response?.status === 204 || error.response?.status === 200) {
          toast.success('Cập nhật giá thành công!')
          navigate('/pricings')
          return
        }
      }
      let errorMsg = 'Lỗi khi cập nhật giá'
      if (err instanceof Error) {
        errorMsg = err.message
      }
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/pricings')
  }

  const formatTime = (time: string) => time

  if (loading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-gray-600 text-lg'>Đang tải dữ liệu...</p>
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
            <h1 className='text-3xl font-bold text-gray-900'>Chỉnh Sửa Giá</h1>
            <p className='text-gray-500 mt-1'>Cập nhật thông tin giá thuê sân</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Pricing Information Section */}
          <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-8 border border-blue-200'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center'>
                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-gray-900'>Thông Tin Giá</h2>
            </div>

            <div className='space-y-4'>
              {/* Field */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Sân <span className='text-red-500'>*</span>
                </label>
                <select
                  name='fieldId'
                  value={formData.fieldId}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>-- Chọn sân --</option>
                  {loadingFields ? (
                    <option disabled>Đang tải...</option>
                  ) : (
                    fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Time Range */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Giờ Bắt Đầu <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='time'
                    name='startTime'
                    value={formData.startTime}
                    onChange={handleInputChange}
                    step={1800}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Giờ Kết Thúc <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='time'
                    name='endTime'
                    value={formData.endTime}
                    onChange={handleInputChange}
                    step={1800}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>
              {formData.startTime && formData.endTime && (
                <p className={`text-sm ${timeValidation.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {timeValidation.ok
                    ? `Sẽ cập nhật ${timeValidation.slotCount} pricing (30 phút/slot)`
                    : 'Khung giờ phải theo bước 30 phút, phút chỉ 00 hoặc 30 và EndTime > StartTime'}
                </p>
              )}

              {/* Day of Week */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Ngày Trong Tuần <span className='text-red-500'>*</span>
                </label>
                <select
                  name='dayOfWeek'
                  value={formData.dayOfWeek === null ? '' : formData.dayOfWeek}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>-- Chọn ngày --</option>
                  {Object.entries(DayOfWeek).map(([key, value]) => (
                    <option key={key} value={value}>
                      {DayOfWeekLabels[value as DayOfWeekType]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Giá (VNĐ) <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  name='price'
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  min='0'
                  step='1000'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='0'
                />
                {formData.price > 0 && (
                  <p className='mt-1 text-sm text-gray-500'>
                    Giá hiển thị: <span className='font-semibold text-blue-600'>{formData.price.toLocaleString()}đ</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          {formData.fieldId && formData.startTime && formData.endTime && formData.dayOfWeek !== null && formData.price > 0 && (
            <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-8 border border-green-200'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center'>
                  <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <h2 className='text-2xl font-bold text-gray-900'>Tóm Tắt</h2>
              </div>

              <div className='space-y-3 bg-white rounded-lg p-6'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Sân:</span>
                  <span className='font-semibold text-gray-900'>
                    {fields.find((f) => f.id === formData.fieldId)?.name || 'N/A'}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Khung giờ:</span>
                  <span className='font-semibold text-gray-900'>
                    {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
                  </span>
                </div>
                {timeValidation.ok && (
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Số slot cập nhật:</span>
                    <span className='font-semibold text-gray-900'>{timeValidation.slotCount}</span>
                  </div>
                )}
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Ngày:</span>
                  <span className='px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
                    {DayOfWeekLabels[formData.dayOfWeek]}
                  </span>
                </div>
                <div className='flex justify-between items-center pt-3 border-t border-gray-200'>
                  <span className='text-lg font-semibold text-gray-900'>Tổng giá:</span>
                  <span className='text-2xl font-bold text-green-600'>{formData.price.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-3 justify-end'>
            <button
              type='button'
              onClick={handleCancel}
              className='px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-lg font-medium'
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type='submit'
              className='px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  Cập Nhật Giá
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default EditPricingPage
