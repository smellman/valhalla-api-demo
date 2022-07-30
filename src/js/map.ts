import 'maplibre-gl/dist/maplibre-gl.css'

import { Map } from 'maplibre-gl'

const map = new Map({
  container: 'map',
  style: 'https://tile.openstreetmap.jp/styles/maptiler-toner-ja/style.json',
  center: [139.7531, 35.68302],
  zoom: 9,
})
