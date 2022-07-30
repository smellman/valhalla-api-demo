import { Valhalla } from './valhalla'
import { LngLat } from 'maplibre-gl'
import { decode } from './polyline'
import { lineString } from '@turf/helpers'

export const CostingArray = [
  'auto',
  'bicycle',
  'bus',
  'bikeshare',
  'truck',
  'taxi',
  'moter_scooter',
  'motorcycle',
  'multimodal',
  'pedestrian',
] as const
export type Costing = typeof CostingArray[number]
export const UnitsArray = ['kilometers', 'miles']
export type Units = typeof UnitsArray[number]
export const LanguageArray = [
  'bg-BG',
  'ca-ES',
  'cs-CZ',
  'da-DK',
  'de-DE',
  'el-GR',
  'en-GB',
  'en-US-x-pirate',
  'en-US',
  'es-ES',
  'et-EE',
  'fi-FI',
  'fr-FR',
  'hi-IN',
  'hu-HU',
  'it-IT',
  'ja-JP',
  'nb-NO',
  'nl-NL',
  'pl-PL',
  'pt-BR',
  'pt-PT',
  'ro-RO',
  'ru-RU',
  'sk-SK',
  'sl-SI',
  'sv-SE',
  'tr-TR',
  'uk-UA',
] as const
export type Language = typeof LanguageArray[number]

const api_path = '/route?json='

export class Routing extends Valhalla {
  /**
   * routing
   */
  public async routing(
    start_position: LngLat,
    end_point: LngLat,
    costing: Costing = 'auto',
    language: Language = 'ja-JP',
    units: Units = 'kilometers'
  ) {
    const start = this.getLocation(start_position)
    const end = this.getLocation(end_point)
    const query = {
      locations: [start, end],
      costing: costing,
      costing_options: {
        auto: {
          country_crossing_penalty: 2000,
        },
      },
      language: language,
      units: units,
      id: 'test',
    }
    const queryString = JSON.stringify(query)
    const requestUrl = this.end_point + api_path + queryString
    const response = await fetch(requestUrl)
    const json = await response.json()
    const decoded = decode(json.trip.legs[0].shape, 6)
    const result: number[][] = []
    decoded.forEach((v) => result.push([v[1], v[0]]))
    return lineString(result)
  }
}
