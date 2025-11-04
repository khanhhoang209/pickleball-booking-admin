declare module '@mapbox/mapbox-sdk/services/geocoding' {
  interface GeocodingConfig {
    accessToken: string
  }

  interface GeocodingFeature {
    id: string
    place_name: string
    center: [number, number]
    geometry: {
      type: string
      coordinates: [number, number]
    }
  }

  interface GeocodingResponse {
    body: {
      features: GeocodingFeature[]
    }
  }

  interface ForwardGeocodeRequest {
    query: string
    countries?: string[]
    limit?: number
  }

  interface GeocodingClient {
    forwardGeocode(request: ForwardGeocodeRequest): {
      send(): Promise<GeocodingResponse>
    }
  }

  function geocoding(config: GeocodingConfig): GeocodingClient

  export default geocoding
}
