import { LngLat } from "maplibre-gl"

export type Location = {
  lng: number
  lat: number
}

export class Valhalla {
  end_point: string
  constructor(end_point: string) {
    this.end_point = end_point
  }

  protected getLocation(position: LngLat): Location  {
    return {
      lng: position.lng,
      lat: position.lat
    }
  }
}
