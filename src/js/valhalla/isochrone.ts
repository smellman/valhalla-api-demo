import { Valhalla, Costing } from './valhalla'
import { LngLat } from 'maplibre-gl'

const api_path = '/isochrone?json='

export class Isochrone extends Valhalla {
  /**
   * isochrone
   */
  public async isochrone(
    pos: LngLat,
    time: number,
    color: string,
    costing: Costing = 'pedestrian'
  ) {
    const location = this.getLocation(pos)
    const query = {
      locations: [location],
      costing: costing,
      contours: [{ time: time, color: color }],
    }
    const queryString = JSON.stringify(query)
    const requestUrl = this.end_point + api_path + queryString
    const response = await fetch(requestUrl)
    const json = await response.json()
    console.log(json)
  }
}
