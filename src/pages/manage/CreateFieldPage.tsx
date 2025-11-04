import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import AdminLayout from '~/components/layout/AdminLayout'
import axiosInstance from '~/config/axios'
import { toast } from 'sonner'
import type { FieldType, CreateFieldFormData, Province, Ward } from '~/types/field'
import MapPicker from '~/components/ui/map-picker'

const CreateFieldPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([])
  const [loadingFieldTypes, setLoadingFieldTypes] = useState(true)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewBlueprint, setPreviewBlueprint] = useState<string | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [wards, setWards] = useState<Ward[]>([])
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  const [formData, setFormData] = useState<CreateFieldFormData>({
    name: '',
    description: '',
    address: '',
    pricePerHour: 0,
    imageUrl: null,
    area: null,
    bluePrintImageUrl: null,
    latitude: null,
    longitude: null,
    mapUrl: '',
    city: '',
    district: '',
    fieldTypeId: ''
  })

  // Fetch field types
  useEffect(() => {
    const fetchFieldTypes = async () => {
      try {
        setLoadingFieldTypes(true)
        const response = await axiosInstance.get('v1/field-types', {
          params: {
            isActive: true,
            pageNumber: 1,
            pageSize: 100
          }
        })

        if (response.data.success && response.data.data) {
          setFieldTypes(response.data.data)
        }
      } catch (err) {
        console.error('Error fetching field types:', err)
        toast.error('Không thể tải loại sân')
      } finally {
        setLoadingFieldTypes(false)
      }
    }
    const fetchProvinces = async () => {
      try {
        const response = await axiosInstance.get('https://tinhthanhpho.com/api/v1/new-provinces', {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TINHTHANHPHO_API_KEY}`
          },
          params: {
            limit: 100
          }
        })
        if (response.data.success && response.data.data) {
          setProvinces(response.data.data)
        }
      } catch (err) {
        console.error('Error fetching provinces:', err)
        toast.error('Không thể tải danh sách tỉnh thành')
      }
    }

    fetchProvinces()
    fetchFieldTypes()
  }, [])

  useEffect(() => {
    const fetchWards = async () => {
      try {
        if (!selectedProvince) {
          setWards([])
          return
        }
        const provinceCode = selectedProvince.code
        const response = await axiosInstance.get(
          `https://tinhthanhpho.com/api/v1/new-provinces/${provinceCode}/wards`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_TINHTHANHPHO_API_KEY}`
            },
            params: {
              provinceCode,
              limit: 100
            }
          }
        )
        if (response.data.success && response.data.data) {
          setWards(response.data.data)
        }
      } catch (err) {
        console.error('Error fetching wards:', err)
        toast.error('Không thể tải danh sách phường xã')
      }
    }

    fetchWards()
  }, [selectedProvince])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'pricePerHour' || name === 'area' || name === 'latitude' || name === 'longitude'
          ? value === ''
            ? null
            : Number(value)
          : value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'imageUrl' | 'bluePrintImageUrl') => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fileType]: file
      }))

      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        if (fileType === 'imageUrl') {
          setPreviewImage(reader.result as string)
        } else {
          setPreviewBlueprint(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên sân')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả')
      return
    }
    if (!formData.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ')
      return
    }
    if (!formData.city.trim()) {
      toast.error('Vui lòng chọn thành phố')
      return
    }
    if (!formData.district.trim()) {
      toast.error('Vui lòng chọn quận/huyện')
      return
    }
    if (!formData.pricePerHour || formData.pricePerHour <= 0) {
      toast.error('Vui lòng nhập giá thuê hợp lệ')
      return
    }
    if (!formData.fieldTypeId) {
      toast.error('Vui lòng chọn loại sân')
      return
    }

    try {
      setLoading(true)

      // Create FormData for file upload
      const form = new FormData()
      form.append('name', formData.name)
      form.append('description', formData.description)
      form.append('address', formData.address)
      form.append('pricePerHour', formData.pricePerHour.toString())
      form.append('fieldTypeId', formData.fieldTypeId)

      if (formData.imageUrl) {
        form.append('imageUrl', formData.imageUrl)
      }
      if (formData.bluePrintImageUrl) {
        form.append('bluePrintImageUrl', formData.bluePrintImageUrl)
      }
      if (formData.area) {
        form.append('area', formData.area.toString())
      }
      if (formData.city) {
        form.append('city', formData.city)
      }
      if (formData.district) {
        form.append('district', formData.district)
      }
      if (formData.latitude !== null) {
        form.append('latitude', formData.latitude.toString())
      }
      if (formData.longitude !== null) {
        form.append('longitude', formData.longitude.toString())
      }
      if (formData.mapUrl) {
        form.append('mapUrl', formData.mapUrl)
      }

      const response = await axiosInstance.post('v1/fields', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        toast.success('Tạo sân thành công!')
        navigate('/fields')
      } else {
        toast.error(response.data.message || 'Không thể tạo sân')
      }
    } catch (err) {
      console.error('Error creating field:', err)
      let errorMsg = 'Lỗi khi tạo sân'
      if (err instanceof Error) {
        errorMsg = err.message
      }
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/fields')
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Thêm Sân Mới</h1>
            <p className='text-gray-500 mt-1'>Tạo một sân thể thao mới</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information Section */}
          <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-8 border border-blue-200'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center'>
                <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 11.894 1.789l-1.33.665 2.332 2.332a1 1 0 11-1.414 1.414L15.88 9.117l.665-1.33a1 1 0 11.894 1.789l-.8 1.599L16.677 10a1 1 0 11.894 1.789l-3.954 1.582v1.323a1 1 0 11-2 0v-1.323L10.047 14a1 1 0 01-.894.109l-.894-.447-2.332 2.332a1 1 0 01-1.414-1.414L8.12 10.883l-.447-.894a1 1 0 01.109-.894l1.582-3.954H7a1 1 0 110-2h1.323L10 2z' />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-gray-900'>Thông Tin Cơ Bản</h2>
            </div>

            <div className='space-y-4'>
              {/* Name */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Tên Sân <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Nhập tên sân'
                />
              </div>

              {/* Description */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Mô Tả <span className='text-red-500'>*</span>
                </label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Nhập mô tả sân'
                />
              </div>

              {/* Price and Area - 2 columns */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Giá Thuê / Giờ (VNĐ) <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    name='pricePerHour'
                    value={formData.pricePerHour || ''}
                    onChange={handleInputChange}
                    min='0'
                    step='1000'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='0'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Diện Tích (m²)</label>
                  <input
                    type='number'
                    name='area'
                    value={formData.area || ''}
                    onChange={handleInputChange}
                    min='0'
                    step='0.01'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='0'
                  />
                </div>
              </div>

              {/* Field Type */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Loại Sân <span className='text-red-500'>*</span>
                </label>
                <select
                  name='fieldTypeId'
                  value={formData.fieldTypeId}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>-- Chọn loại sân --</option>
                  {loadingFieldTypes ? (
                    <option disabled>Đang tải...</option>
                  ) : (
                    fieldTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-8 border border-green-200'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center'>
                <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-gray-900'>Thông Tin Vị Trí</h2>
            </div>

            <div className='space-y-4'>
              {/* Address */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Địa Chỉ <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='address'
                  value={formData.address}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='Nhập địa chỉ'
                />
              </div>

              {/* City and District - 2 columns */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Thành Phố <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='city'
                    value={selectedProvince?.code || ''}
                    onChange={(e) => {
                      const province = provinces.find((p) => p.code === e.target.value)
                      setSelectedProvince(province || null)
                      setSelectedWard(null)
                      setFormData((prev) => ({
                        ...prev,
                        city: province?.name || '',
                        district: ''
                      }))
                    }}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                  >
                    <option value=''>-- Chọn thành phố --</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Quận/Huyện <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name='district'
                    value={selectedWard?.code || ''}
                    onChange={(e) => {
                      const ward = wards.find((w) => w.code === e.target.value)
                      setSelectedWard(ward || null)
                      setFormData((prev) => ({
                        ...prev,
                        district: ward?.name || ''
                      }))
                    }}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                    disabled={!selectedProvince}
                  >
                    <option value=''>-- Chọn quận/huyện --</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Map Location Picker */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Chọn Vị Trí Trên Bản Đồ</label>
                <p className='text-xs text-gray-500 mb-3'>
                  Tìm kiếm địa điểm hoặc click vào bản đồ để chọn vị trí chính xác. Vĩ độ và kinh độ sẽ được lưu tự
                  động.
                </p>
                <MapPicker
                  accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''}
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  initialAddress={formData.address}
                  initialCity={formData.city}
                  initialDistrict={formData.district}
                  onLocationSelect={(lat, lng) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng
                    }))
                  }}
                />
              </div>

              {/* Map URL */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>URL Bản Đồ (Tùy chọn)</label>
                <input
                  type='url'
                  name='mapUrl'
                  value={formData.mapUrl}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='https://maps.google.com/...'
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-8 border border-purple-200'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center'>
                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-gray-900'>Hình Ảnh</h2>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Main Image */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Hình Ảnh Sân</label>
                <div className='border-2 border-dashed border-purple-300 rounded-lg p-6'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleFileChange(e, 'imageUrl')}
                    className='hidden'
                    id='imageUrl'
                  />
                  <label htmlFor='imageUrl' className='cursor-pointer'>
                    {previewImage ? (
                      <div className='relative'>
                        <img src={previewImage} alt='Preview' className='w-full h-48 object-cover rounded-lg' />
                        <div className='mt-2 text-center'>
                          <p className='text-sm text-gray-600'>Click để thay đổi</p>
                        </div>
                      </div>
                    ) : (
                      <div className='text-center py-8'>
                        <svg
                          className='w-12 h-12 text-purple-400 mx-auto mb-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                        </svg>
                        <p className='text-gray-600'>Click để tải lên hình ảnh</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Blueprint Image */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Sơ Đồ Sân</label>
                <div className='border-2 border-dashed border-purple-300 rounded-lg p-6'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleFileChange(e, 'bluePrintImageUrl')}
                    className='hidden'
                    id='bluePrintImageUrl'
                  />
                  <label htmlFor='bluePrintImageUrl' className='cursor-pointer'>
                    {previewBlueprint ? (
                      <div className='relative'>
                        <img src={previewBlueprint} alt='Preview' className='w-full h-48 object-cover rounded-lg' />
                        <div className='mt-2 text-center'>
                          <p className='text-sm text-gray-600'>Click để thay đổi</p>
                        </div>
                      </div>
                    ) : (
                      <div className='text-center py-8'>
                        <svg
                          className='w-12 h-12 text-purple-400 mx-auto mb-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                        </svg>
                        <p className='text-gray-600'>Click để tải lên sơ đồ</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 justify-end'>
            <button
              type='button'
              onClick={handleCancel}
              className='px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-lg font-medium'
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type='submit'
              className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                  </svg>
                  Tạo Sân
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default CreateFieldPage
