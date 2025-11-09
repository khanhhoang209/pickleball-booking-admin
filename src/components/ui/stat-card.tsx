import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconBgColor?: string
  iconColor?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  loading?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  trend,
  loading = false
}) => {
  return (
    <div className='bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm text-gray-500 mb-1'>{title}</p>
          <h3 className='text-2xl font-bold text-gray-900'>
            {loading ? (
              <span className='inline-block w-20 h-8 bg-gray-200 animate-pulse rounded'></span>
            ) : (
              value
            )}
          </h3>
          {subtitle && <p className='text-xs text-gray-500 mt-2'>{subtitle}</p>}
          {trend && !loading && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}

interface StatusCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  borderColor: string
  loading?: boolean
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  borderColor,
  loading = false
}) => {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${borderColor}`}>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-gray-500 mb-1'>{title}</p>
          <h3 className='text-xl font-bold text-gray-900'>
            {loading ? (
              <span className='inline-block w-16 h-7 bg-gray-200 animate-pulse rounded'></span>
            ) : (
              value
            )}
          </h3>
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </div>
  )
}
