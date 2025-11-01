import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import AdminLayout from '~/components/layout/AdminLayout'
import ConfirmDialog from '~/components/ui/confirm-dialog'
import axiosInstance from '~/config/axios'
import { toast } from 'sonner'
import type { Field, FieldsResponse } from '~/types/field'

const FieldsPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filter states
  const [searchName, setSearchName] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(500000)
  const [isActive, setIsActive] = useState(true)

  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteFieldId, setDeleteFieldId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFields = async (page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: pageSize.toString(),
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        isActive: isActive.toString()
      })

      if (searchName) {
        params.append('name', searchName)
      }

      const response = await axiosInstance.get<FieldsResponse>(`v1/fields?${params.toString()}`)

      if (response.data.success && response.data.data) {
        setFields(response.data.data)
        setTotalCount(response.data.totalCount)
        setTotalPages(response.data.totalPages)
        setCurrentPage(response.data.pageNumber)
      } else {
        toast.error('Failed to fetch fields')
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
      let errorMsg = 'Failed to fetch fields'
      if (error instanceof Error) {
        errorMsg = error.message
      }
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFields(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice, isActive, location])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFields(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchFields(newPage)
    }
  }

  const handleReset = () => {
    setSearchName('')
    setMinPrice(0)
    setMaxPrice(500000)
    setIsActive(true)
    setCurrentPage(1)
  }

  const handleDeleteClick = (fieldId: string) => {
    setDeleteFieldId(fieldId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteFieldId) return
    try {
      setDeleting(true)
      await axiosInstance.delete(`v1/fields/${deleteFieldId}`)

      toast.success('Xóa sân thành công!')
      // Refresh the list
      await fetchFields(currentPage)
      setShowDeleteConfirm(false)
      setDeleteFieldId(null)
    } catch (err) {
      console.error('Error deleting field:', err)
      if (err instanceof Error && 'response' in err) {
        const error = err as { response?: { status: number; data?: { message: string } } }
        if (error.response?.status === 204) {
          toast.success('Xóa sân thành công!')
          await fetchFields(currentPage)
          setShowDeleteConfirm(false)
          setDeleteFieldId(null)
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
    }
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Quản Lý Sân Thể Thao</h1>
            <p className='text-gray-500 mt-1'>Manage and monitor all sports fields</p>
          </div>
          <button
            onClick={() => navigate('/fields/create')}
            className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium flex items-center gap-2'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            Thêm Sân Mới
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <form onSubmit={handleSearch} className='space-y-4'>
            {/* Search Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Tên Sân</label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder='Nhập tên sân...'
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <button
                  type='submit'
                  disabled={loading}
                  className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium'
                >
                  {loading ? 'Đang tìm...' : 'Tìm Kiếm'}
                </button>
              </div>
            </div>

            {/* Price Range and Status Filters */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Min Price */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Giá Tối Thiểu (VNĐ)</label>
                <input
                  type='number'
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  min='0'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* Max Price */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Giá Tối Đa (VNĐ)</label>
                <input
                  type='number'
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  min='0'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
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
          </form>
        </div>

        {/* Fields Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {loading ? (
            // Loading skeletons
            Array(pageSize)
              .fill(0)
              .map((_, index) => (
                <div key={index} className='bg-white rounded-lg shadow-sm overflow-hidden animate-pulse'>
                  <div className='h-48 bg-gray-300'></div>
                  <div className='p-4 space-y-3'>
                    <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                    <div className='h-4 bg-gray-300 rounded'></div>
                    <div className='h-4 bg-gray-300 rounded w-1/2'></div>
                  </div>
                </div>
              ))
          ) : fields.length > 0 ? (
            fields.map((field) => (
              <div
                key={field.id}
                className='bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer'
              >
                {/* Image Container */}
                <div className='relative h-48 bg-gray-200 overflow-hidden'>
                  <img
                    src={field.imageUrl}
                    alt={field.name}
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                  />
                  <div className='absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold'>
                    {field.pricePerHour.toLocaleString()}đ/h
                  </div>
                </div>

                {/* Field Info */}
                <div className='p-4 space-y-3'>
                  {/* Name */}
                  <h3 className='text-lg font-bold text-gray-900 line-clamp-1'>{field.name}</h3>

                  {/* Description */}
                  <p className='text-sm text-gray-600 line-clamp-2'>{field.description}</p>

                  {/* Field Type */}
                  {field.fieldType && (
                    <div className='bg-purple-50 border border-purple-200 rounded-lg px-3 py-2'>
                      <p className='text-xs font-semibold text-purple-600 uppercase tracking-wide'>Loại Sân</p>
                      <p className='text-sm font-bold text-purple-900'>{field.fieldType.name}</p>
                    </div>
                  )}

                  {/* Location */}
                  <div className='flex items-center text-sm text-gray-500 gap-1'>
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='line-clamp-1'>{field.address}</span>
                  </div>

                  {/* Area */}
                  <div className='flex items-center text-sm text-gray-500 gap-1'>
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
                    </svg>
                    <span>{field.area} m²</span>
                  </div>

                  {/* Actions */}
                  <div className='pt-3 border-t border-gray-200 flex gap-2'>
                    <button
                      onClick={() => navigate(`/fields/${field.id}`)}
                      className='flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'
                    >
                      Chi Tiết
                    </button>
                    <button
                      onClick={() => navigate(`/fields/${field.id}/edit`)}
                      className='flex-1 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors'
                    >
                      Chỉnh Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteClick(field.id)}
                      className='flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors'
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-full flex items-center justify-center py-12'>
              <div className='text-center'>
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
                <span className='font-semibold'>{totalCount}</span> sân
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

export default FieldsPage
