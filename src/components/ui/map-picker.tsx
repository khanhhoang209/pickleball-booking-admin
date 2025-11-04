import React, { useState, useCallback, useEffect, useRef } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox'
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialLat?: number | null
  initialLng?: number | null
  accessToken: string
  initialAddress?: string
  initialCity?: string
  initialDistrict?: string
}

interface SearchResult {
  id: string
  place_name: string
  center: [number, number]
}

const MapPicker: React.FC<MapPickerProps> = ({
  onLocationSelect,
  initialLat,
  initialLng,
  accessToken,
  initialAddress = '',
  initialCity = '',
  initialDistrict = ''
}) => {
  // Initialize Mapbox Geocoding client
  const geocodingClient = useRef<ReturnType<typeof mbxGeocoding> | null>(null)

  useEffect(() => {
    if (!accessToken) {
      console.error('Mapbox access token is missing!')
    } else {
      console.log('Mapbox access token loaded')
      geocodingClient.current = mbxGeocoding({ accessToken })
    }
  }, [accessToken])

  const defaultCenter = {
    latitude: 10.8231, // Ho Chi Minh City
    longitude: 106.6297
  }

  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(
    initialLat && initialLng ? { latitude: initialLat, longitude: initialLng } : null
  )

  const [viewState, setViewState] = useState({
    latitude: initialLat || defaultCenter.latitude,
    longitude: initialLng || defaultCenter.longitude,
    zoom: marker ? 15 : 12
  })

  // Build initial search query from form data - Vietnamese format: địa chỉ, quận/huyện, thành phố
  const buildInitialQuery = useCallback(() => {
    const parts = [initialAddress, initialDistrict, initialCity].filter(Boolean)
    return parts.join(', ')
  }, [initialAddress, initialDistrict, initialCity])

  const [searchQuery, setSearchQuery] = useState(buildInitialQuery())
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Search for locations using Mapbox Geocoding API SDK
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim() || !geocodingClient.current) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await geocodingClient.current
        .forwardGeocode({
          query: query,
          countries: ['VN'],
          limit: 5
        })
        .send()

      setSearchResults(response.body.features || [])
      setShowResults(true)
    } catch (error) {
      console.error('Error searching location:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Auto-search when component mounts with initial address data
  useEffect(() => {
    const initialQuery = buildInitialQuery()
    if (initialQuery && !initialLat && !initialLng) {
      setSearchQuery(initialQuery)
      searchLocation(initialQuery)
    }
  }, [buildInitialQuery, initialLat, initialLng, searchLocation])

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value)
    }, 500)
  }

  // Handle selecting a search result
  const handleSelectResult = (result: SearchResult) => {
    const [lng, lat] = result.center
    const newMarker = {
      latitude: lat,
      longitude: lng
    }
    console.log('Search result selected - New marker position:', newMarker)
    console.log('Selected place:', result.place_name)
    setMarker(newMarker)
    setViewState({
      latitude: lat,
      longitude: lng,
      zoom: 15
    })
    onLocationSelect(lat, lng)
    setSearchQuery(result.place_name)
    setShowResults(false)
  }

  const handleMapClick = useCallback(
    (event: { lngLat: { lat: number; lng: number } }) => {
      const { lngLat } = event
      const newMarker = {
        latitude: lngLat.lat,
        longitude: lngLat.lng
      }
      console.log('Map clicked - New marker position:', newMarker)
      setMarker(newMarker)
      onLocationSelect(lngLat.lat, lngLat.lng)
      setShowResults(false)
    },
    [onLocationSelect]
  )

  if (!accessToken) {
    return (
      <div className='w-full h-[400px] rounded-lg overflow-hidden border border-red-300 bg-red-50 flex items-center justify-center'>
        <div className='text-center p-6'>
          <svg
            className='w-16 h-16 text-red-400 mx-auto mb-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
          <p className='text-red-700 font-semibold mb-2'>Mapbox Access Token Missing</p>
          <p className='text-red-600 text-sm'>
            Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {/* Search Box */}
      <div className='relative'>
        <div className='relative'>
          <input
            type='text'
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder='Tìm kiếm địa điểm... (VD: Quận 1, TP.HCM)'
            className='w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
            onFocus={() => searchQuery && setShowResults(true)}
          />
          <svg
            className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
          {isSearching && (
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-green-500'></div>
            </div>
          )}
          {searchQuery && !isSearching && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSearchResults([])
                setShowResults(false)
              }}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelectResult(result)}
                className='w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors'
              >
                <div className='flex items-start gap-2'>
                  <svg
                    className='w-5 h-5 text-green-500 mt-0.5 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm text-gray-700'>{result.place_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className='w-full h-[400px] rounded-lg overflow-hidden border border-gray-300'>
        <Map
          {...viewState}
          onMove={(evt: { viewState: typeof viewState }) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapboxAccessToken={accessToken}
          style={{ width: '100%', height: '100%' }}
          mapStyle='mapbox://styles/mapbox/streets-v12'
          attributionControl={false}
        >
          <NavigationControl position='top-right' />
          {marker && (
            <Marker latitude={marker.latitude} longitude={marker.longitude} anchor='bottom'>
              <div className='relative'>
                <svg
                  width='40'
                  height='40'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className='drop-shadow-lg'
                >
                  <path
                    d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'
                    fill='#22c55e'
                    stroke='#15803d'
                    strokeWidth='1.5'
                  />
                  <circle cx='12' cy='9' r='2.5' fill='white' />
                </svg>
              </div>
            </Marker>
          )}
        </Map>
      </div>
    </div>
  )
}

export default MapPicker
