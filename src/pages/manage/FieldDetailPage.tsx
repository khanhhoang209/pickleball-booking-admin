import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import AdminLayout from '~/components/layout/AdminLayout'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import axiosInstance from '~/config/axios'
import { toast } from 'sonner'
import type { Field } from '~/types/field'

const FieldDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [field, setField] = useState<Field | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('Invalid field ID')
      setLoading(false)
      return
    }

    const fetchFieldDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axiosInstance.get(`v1/fields/${id}`)

        console.log('Field Detail Response:', response.data)

        if (response.data.success && response.data.data) {
          console.log('Field Data:', response.data.data)
          console.log('Field Type:', response.data.data.fieldType)
          setField(response.data.data)
        } else {
          setError(response.data.message || 'Failed to fetch field details')
          toast.error('Failed to fetch field details')
        }
      } catch (err) {
        console.error('Error fetching field details:', err)
        let errorMsg = 'Failed to fetch field details'
        if (err instanceof Error) {
          errorMsg = err.message
        }
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchFieldDetail()
  }, [id])

  const handleEdit = () => {
    navigate(`/fields/${id}/edit`)
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!id) return
    try {
      setDeleting(true)
      await axiosInstance.delete(`v1/fields/${id}`)

      toast.success('Xóa sân thành công!')
      navigate('/fields')
    } catch (err) {
      console.error('Error deleting field:', err)
      if (err instanceof Error && 'response' in err) {
        const error = err as { response?: { status: number; data?: { message: string } } }
        if (error.response?.status === 204) {
          toast.success('Xóa sân thành công!')
          navigate('/fields')
          return
        }
      }
      let errorMsg = 'Lỗi khi xóa sân'
      if (err instanceof Error) {
        errorMsg = err.message
      }
      toast.error(errorMsg)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleBack = () => {
    navigate('/fields')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p className='text-gray-600 text-lg'>Đang tải chi tiết sân...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !field) {
    return (
      <AdminLayout>
        <div className='flex flex-col items-center justify-center min-h-screen'>
          <div className='text-center'>
            <svg className='w-16 h-16 text-red-500 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00-.707-.293l-2.414 2.414a1 1 0 01-.707.293H9.414a1 1 0 00-.707.293l-2.414-2.414A1 1 0 016.586 5H9a2 2 0 012 2v2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707.293l2.414-2.414a1 1 0 01.707-.293h2.414a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H19a2 2 0 012 2v10a2 2 0 01-2 2h-1.586a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293h-3.172a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H5a2 2 0 01-2-2V7z'
              />
            </svg>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Lỗi</h2>
            <p className='text-gray-600 mb-6'>{error}</p>
            <button
              onClick={handleBack}
              className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium'
            >
              Quay Lại
            </button>
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
          <div className='flex items-center gap-4'>
            <button
              onClick={handleBack}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              title='Quay lại'
            >
              <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </button>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>{field.name}</h1>
              <p className='text-gray-500 mt-1'>Chi tiết sân thể thao</p>
            </div>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={handleEdit}
              className='px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-lg font-medium flex items-center gap-2'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                />
              </svg>
              Chỉnh Sửa
            </button>
            <button
              onClick={handleDelete}
              className='px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg font-medium flex items-center gap-2'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
              Xóa
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className='space-y-6'>
          {/* Images Row */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Main Image */}
            <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
              <div
                className='bg-gray-100 overflow-hidden flex items-center justify-center'
                style={{ aspectRatio: '16 / 9' }}
              >
                <img src={field.imageUrl} alt={field.name} className='w-full h-full object-contain' />
              </div>
              <div className='p-4 text-center text-gray-600 border-t border-gray-200'>
                <p className='text-sm font-medium'>Hình ảnh sân</p>
              </div>
            </div>

            {/* Blueprint Image */}
            <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
              <div
                className='bg-gray-100 overflow-hidden flex items-center justify-center'
                style={{ aspectRatio: '16 / 9' }}
              >
                <img
                  src={field.bluePrintImageUrl}
                  alt={`${field.name} blueprint`}
                  className='w-full h-full object-contain'
                />
              </div>
              <div className='p-4 text-center text-gray-600 border-t border-gray-200'>
                <p className='text-sm font-medium'>Sơ đồ sân</p>
              </div>
            </div>
          </div>

          {/* Info Cards Row */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Basic Info Card */}
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200'>
              <div className='flex items-center gap-3 mb-5'>
                <div className='w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center'>
                  <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 11.894 1.789l-1.33.665 2.332 2.332a1 1 0 11-1.414 1.414L15.88 9.117l.665-1.33a1 1 0 11.894 1.789l-.8 1.599L16.677 10a1 1 0 11.894 1.789l-3.954 1.582v1.323a1 1 0 11-2 0v-1.323L10.047 14a1 1 0 01-.894.109l-.894-.447-2.332 2.332a1 1 0 01-1.414-1.414L8.12 10.883l-.447-.894a1 1 0 01.109-.894l1.582-3.954H7a1 1 0 110-2h1.323L10 2z' />
                  </svg>
                </div>
                <h3 className='text-lg font-bold text-gray-900'>Thông Tin Cơ Bản</h3>
              </div>

              <div className='space-y-4'>
                {/* Name */}
                <div className='bg-white rounded-lg p-3 border border-blue-100'>
                  <label className='block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1'>
                    Tên Sân
                  </label>
                  <p className='text-lg font-bold text-gray-900'>{field.name}</p>
                </div>

                {/* Price */}
                <div className='bg-white rounded-lg p-3 border border-blue-100'>
                  <label className='block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1'>
                    Giá Thuê / Giờ
                  </label>
                  <p className='text-2xl font-bold text-blue-600'>
                    {field.pricePerHour.toLocaleString()} <span className='text-sm text-gray-600'>VNĐ</span>
                  </p>
                </div>

                {/* Area */}
                <div className='bg-white rounded-lg p-3 border border-blue-100'>
                  <label className='block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1'>
                    Diện Tích
                  </label>
                  <p className='text-lg font-bold text-gray-900'>
                    {field.area} <span className='text-sm text-gray-600'>m²</span>
                  </p>
                </div>

                {/* Field Type */}
                <div>
                  <label className='block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2'>
                    Loại Sân
                  </label>
                  {field.fieldType && field.fieldType.name ? (
                    <div className='bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3'>
                      <p className='text-sm font-bold text-purple-900'>{field.fieldType.name}</p>
                      {field.fieldType.description && (
                        <p className='text-xs text-purple-700 mt-1'>{field.fieldType.description}</p>
                      )}
                    </div>
                  ) : (
                    <div className='bg-gray-100 border border-gray-300 rounded-lg p-3'>
                      <p className='text-sm text-gray-600'>Chưa có loại sân</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Info Card */}
            <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200'>
              <div className='flex items-center gap-3 mb-5'>
                <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center'>
                  <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-bold text-gray-900'>Vị Trí</h3>
              </div>

              <div className='space-y-4'>
                {/* Address */}
                <div className='bg-white rounded-lg p-3 border border-green-100'>
                  <label className='block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1'>
                    Địa Chỉ
                  </label>
                  <p className='text-gray-900 font-semibold'>{field.address}</p>
                </div>

                {/* City and District */}
                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-white rounded-lg p-3 border border-green-100'>
                    <label className='block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1'>
                      Thành Phố
                    </label>
                    <p className='text-sm font-semibold text-gray-900'>{field.city}</p>
                  </div>
                  <div className='bg-white rounded-lg p-3 border border-green-100'>
                    <label className='block text-xs font-semibold text-green-600 uppercase tracking-wide mb-1'>
                      Quận/Huyện
                    </label>
                    <p className='text-sm font-semibold text-gray-900'>{field.district}</p>
                  </div>
                </div>

                {/* Coordinates */}
                <div className='bg-white rounded-lg p-4 border border-green-100'>
                  <label className='block text-xs font-semibold text-green-600 uppercase tracking-wide mb-3'>
                    Tọa Độ
                  </label>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='bg-gray-50 rounded p-2 border border-gray-200'>
                      <p className='text-xs text-gray-600'>Latitude</p>
                      <p className='text-sm font-semibold text-gray-900'>{field.latitude}</p>
                    </div>
                    <div className='bg-gray-50 rounded p-2 border border-gray-200'>
                      <p className='text-xs text-gray-600'>Longitude</p>
                      <p className='text-sm font-semibold text-gray-900'>{field.longitude}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200'>
              <div className='flex items-center gap-3 mb-5'>
                <div className='w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center'>
                  <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-bold text-gray-900'>Mô Tả</h3>
              </div>
              <div className='space-y-4'>
                <div className='bg-white rounded-lg p-3 border border-purple-100'>
                  <p className='text-gray-700 leading-relaxed'>{field.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map URL Section */}
      {field.mapUrl && field.mapUrl !== 'string' && (
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm p-8 border border-green-100'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex-shrink-0 w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center'>
                <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M12.586 4.586a2 2 0 112.828 2.828l-.793.793-2.828-2.829.793-.792zM9.172 9.172a2 2 0 110 2.828L7 10.828v2a2 2 0 11-2-2h2l1.172-1.172a2 2 0 012.828-2.828l-2.828 2.828z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-900'>Vị Trí Trên Bản Đồ</h3>
                <p className='text-sm text-gray-600'>Xem vị trí sân trên Google Maps</p>
              </div>
            </div>
            <a
              href={field.mapUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md font-medium hover:shadow-lg'
            >
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.343a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM16.364 15.364a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM13 18v-1a1 1 0 112 0v1a1 1 0 11-2 0zM4.343 15.657a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zM3.636 4.343a1 1 0 001.414-1.414L4.343 2.222a1 1 0 00-1.414 1.414l.707.707zM7 18v-1a1 1 0 11-2 0v1a1 1 0 112 0z' />
              </svg>
              Mở Bản Đồ
            </a>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title='Xóa Sân Thể Thao'
        description='Bạn có chắc chắn muốn xóa sân này? Hành động này không thể hoàn tác.'
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={deleting}
        confirmText='Xóa'
        cancelText='Hủy'
      />
    </AdminLayout>
  )
}

export default FieldDetailPage
