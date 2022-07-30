import 'maplibre-gl/dist/maplibre-gl.css'

import { GeoJSONFeature, GeoJSONSource, Map, Marker } from 'maplibre-gl'
import { Routing } from './valhalla/routing'
import { Isochrone } from './valhalla/isochrone'
import * as bootstrap from 'bootstrap'

type APIMode = 'Routing' | 'Isochrone'

let apiMode: APIMode = 'Routing'

const toggleAPIMode = (newAPIMode: APIMode) => {
  if (apiMode !== newAPIMode) {
    if (newAPIMode == 'Routing') {
      setupRoutingMode()
    } else {
      setupIsochroneMode()
    }
    apiMode = newAPIMode
  }
}

const offcanvas = new bootstrap.Offcanvas('#apiCanvas')

const clickRouting = (e: Event) => {
  e.preventDefault()
  toggleAPIMode('Routing')
  offcanvas.toggle()
}

const clickIsochrone = (e: Event) => {
  e.preventDefault()
  toggleAPIMode('Isochrone')
  offcanvas.toggle()
}

const routingLink = document.getElementById(
  'routingApiLink'
) as HTMLAnchorElement
routingLink.addEventListener('click', clickRouting)

const isochroneLink = document.getElementById(
  'isochroneApiLink'
) as HTMLAnchorElement
isochroneLink.addEventListener('click', clickIsochrone)

const cleanMarkers = () => {
  const length = markers.length
  for (let _ = 0; _ < length; _++) {
    const m = markers.shift()
    m?.remove()
  }
}

const cleanLine = () => {
  geojsonFeature.geometry.coordinates = []
  const source = map.getSource('route') as GeoJSONSource
  if (source) {
    source.setData(geojsonFeature as GeoJSONFeature)
  }
}

const cleanAll = () => {
  cleanMarkers()
  cleanLine()
}

const setupRoutingMode = () => {
  cleanAll()
}

const setupIsochroneMode = () => {
  cleanAll()
}

const map = new Map({
  container: 'map',
  style: 'https://tile.openstreetmap.jp/styles/maptiler-toner-ja/style.json',
  center: [139.7531, 35.68302],
  zoom: 9,
})

const markers: Marker[] = []
let isochroneMarker: Marker | null = null

map.on('click', (e) => {
  if (apiMode == 'Routing') {
    if (markers.length == 2) {
      cleanMarkers()
    }
    const marker = new Marker().setLngLat(e.lngLat).addTo(map)
    markers.push(marker)
    doRouting()
  } else {
    // Isochrone Mode
    if (isochroneMarker) {
      isochroneMarker.remove()
      isochroneMarker = null
    }
    isochroneMarker = new Marker().setLngLat(e.lngLat).addTo(map)
    doIsochrone()
  }
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

const doIsochrone = async () => {
  const isochrone = new Isochrone('http://192.168.0.247:8002')
  await isochrone.isochrone(isochroneMarker?.getLngLat(), 15, 'ff0000')
}
