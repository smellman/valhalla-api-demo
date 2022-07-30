import { Valhalla } from './valhalla'
import { LngLat } from 'maplibre-gl'

export type Costing =
  | 'auto'
  | 'bicycle'
  | 'bus'
  | 'bikeshare'
  | 'truck'
  | 'taxi'
  | 'moter_scooter'
  | 'motorcycle'
  | 'multimodal'
  | 'pedestrian'
export type Units = 'kilometers' | 'miles'
export type Language =
  | 'bg-BG'
  | 'ca-ES'
  | 'cs-CZ'
  | 'da-DK'
  | 'de-DE'
  | 'el-GR'
  | 'en-GB'
  | 'en-US-x-pirate'
  | ''

export class Routing extends Valhalla {
  /**
   * routing
   */
  public routing(
    start_position: LngLat,
    end_point: LngLat,
    costing?: Costing
  ) {}
}
