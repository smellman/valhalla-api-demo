import { Valhalla } from './valhalla'
import { LngLat } from 'maplibre-gl'

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

export class Routing extends Valhalla {
  /**
   * routing
   */
  public routing(
    start_position: LngLat,
    end_point: LngLat,
    costing: Costing = 'auto',
    language: Language = 'ja-JP',
    units: Units = 'kilometers'
  ) {}
}
