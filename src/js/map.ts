import 'maplibre-gl/dist/maplibre-gl.css'

import { Map, Marker } from 'maplibre-gl'
import { Routing } from './valhalla/routing'

const map = new Map({
  container: 'map',
  style: 'https://tile.openstreetmap.jp/styles/maptiler-toner-ja/style.json',
  center: [139.7531, 35.68302],
  zoom: 9,
})

const markers: Marker[] = []

map.on('click', (e) => {
  if (markers.length == 2) {
    for (let _ = 0; _ < markers.length; _++) {
      const m = markers.shift()
      m?.remove()
    }
  }
  const marker = new Marker().setLngLat(e.lngLat).addTo(map)
  markers.push(marker)
  doRouting()
})

const doRouting = () => {
  if (markers.length == 2) {
    const start = markers[0]
    const end = markers[1]
    const routing = new Routing('http://192.168.0.247:8002')
    routing.routing('test', start.getLngLat(), end.getLngLat())
  }
}
