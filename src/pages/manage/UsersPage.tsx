import React, { useEffect, useState } from 'react'
import AdminLayout from '~/components/layout/AdminLayout'
import { toast } from 'sonner'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import axiosInstance from '~/config/axios'
import type { UsersResponse, User } from '~/types/user'
import { Search, Mail, Phone, User as UserIcon, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchName, setSearchName] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchName) params.append('searchName', searchName)
      if (searchEmail) params.append('searchEmail', searchEmail)
      params.append('pageNumber', pageNumber.toString())
      params.append('pageSize', pageSize.toString())

      const response = await axiosInstance.get<UsersResponse>(
        `/v1/users?${params.toString()}`
      )

      if (response.data.success && response.data.data) {
        setUsers(response.data.data)
        setTotalPages(response.data.totalPages)
        setTotalCount(response.data.totalCount)
      } else {
        toast.error(response.data.message || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Unable to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPageNumber(1)
    fetchUsers()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClearFilters = () => {
    setSearchName('')
    setSearchEmail('')
    setPageNumber(1)
    setTimeout(() => fetchUsers(), 0)
  }

  const handleChangeUserStatus = async (userId: string, isActive: boolean) => {
    try {
      setChangingStatusId(userId)
      const response = await axiosInstance.post(
        `/v1/users/${userId}/status`,
        { userId, isActive }
      )

      if (response.data.success) {
        toast.success(response.data.message || `User ${isActive ? 'activated' : 'deactivated'} successfully`)
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isActive } : user
          )
        )
      } else {
        toast.error(response.data.message || 'Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Unable to update user status')
    } finally {
      setChangingStatusId(null)
    }
  }

  return (
    <AdminLayout>
      <div className='space-y-6 p-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>User Management</h1>
          <p className='text-gray-500 mt-2'>Manage customer accounts and information</p>
        </div>

        {/* Search Filters */}
        <Card className='p-6'>
          <div className='flex items-center gap-4 flex-wrap'>
            <div className='flex-1 min-w-[200px]'>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Search by Name</label>
              <div className='relative'>
                <UserIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  type='text'
                  placeholder='Enter name...'
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex-1 min-w-[200px]'>
              <label className='text-sm font-medium text-gray-700 mb-2 block'>Search by Email</label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  type='text'
                  placeholder='Enter email...'
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex items-end gap-2'>
              <Button onClick={handleSearch} disabled={loading} className='flex items-center gap-2'>
                <Search className='w-4 h-4' />
                Search
              </Button>
              <Button
                variant='outline'
                onClick={handleClearFilters}
                disabled={loading || (!searchName && !searchEmail)}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        <div className='flex items-center justify-between'>
          <p className='text-sm text-gray-600'>
            {loading ? 'Loading...' : `Showing ${users.length} of ${totalCount} total users`}
          </p>
        </div>

        {/* Users Table */}
        <Card className='overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    User
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Contact
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Username
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan={5} className='px-6 py-12 text-center text-gray-500'>
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='px-6 py-12 text-center text-gray-500'>
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className='hover:bg-gray-50 transition'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                            <UserIcon className='w-5 h-5 text-blue-600' />
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {user.firstName} {user.lastName}
                            </div>
                            <div className='text-sm text-gray-500'>ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-sm text-gray-900'>
                            <Mail className='w-4 h-4 text-gray-400' />
                            {user.email}
                          </div>
                          {user.phoneNumber && (
                            <div className='flex items-center gap-2 text-sm text-gray-500'>
                              <Phone className='w-4 h-4 text-gray-400' />
                              {user.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>{user.userName}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center gap-2'>
                          {user.isActive ? (
                            <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                              <CheckCircle className='w-3 h-3 mr-1' />
                              Active
                            </Badge>
                          ) : (
                            <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
                              <XCircle className='w-3 h-3 mr-1' />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <Button
                          variant={user.isActive ? 'outline' : 'default'}
                          size='sm'
                          onClick={() => handleChangeUserStatus(user.id, !user.isActive)}
                          disabled={changingStatusId === user.id}
                          className={user.isActive ? '' : 'bg-green-600 hover:bg-green-700'}
                        >
                          {changingStatusId === user.id ? 'Updating...' : user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
              disabled={pageNumber === 1 || loading}
              className='flex items-center gap-1'
            >
              <ChevronLeft className='w-4 h-4' />
              Previous
            </Button>
            
            <div className='flex items-center gap-1'>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= pageNumber - 1 && page <= pageNumber + 1)

                if (!showPage) {
                  // Show ellipsis
                  if (page === pageNumber - 2 || page === pageNumber + 2) {
                    return (
                      <span key={page} className='px-2 text-gray-500'>
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <Button
                    key={page}
                    variant={page === pageNumber ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setPageNumber(page)}
                    disabled={loading}
                    className='min-w-[40px]'
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
              disabled={pageNumber === totalPages || loading}
              className='flex items-center gap-1'
            >
              Next
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default UsersPage
