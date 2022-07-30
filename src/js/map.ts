import 'maplibre-gl/dist/maplibre-gl.css'

import { GeoJSONFeature, GeoJSONSource, Map, Marker } from 'maplibre-gl'
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
    const length = markers.length
    for (let _ = 0; _ < length; _++) {
      const m = markers.shift()
      m?.remove()
    }
  }
  const marker = new Marker().setLngLat(e.lngLat).addTo(map)
  markers.push(marker)
  doRouting()
})

let geojsonFeature = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [[0, 0]],
  },
}

map.on('load', () => {
  map.addSource('route', {
    type: 'geojson',
    data: geojsonFeature,
  })
  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#ff0000',
      'line-width': 5,
    },
  })
})

const doRouting = async () => {
  if (markers.length == 2) {
    const start = markers[0]
    const end = markers[1]
    const routing = new Routing('http://192.168.0.247:8002')
    const line = await routing.routing(start.getLngLat(), end.getLngLat())
    geojsonFeature.geometry.coordinates = line
  } else {
    geojsonFeature.geometry.coordinates = []
  }
  const source = map.getSource('route') as GeoJSONSource
  if (source) {
    source.setData(geojsonFeature as GeoJSONFeature)
  }
}
