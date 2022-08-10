import 'maplibre-gl/dist/maplibre-gl.css'

import { GeoJSONFeature, GeoJSONSource, Map, Marker } from 'maplibre-gl'
import { Routing } from './valhalla/routing'
import { Isochrone } from './valhalla/isochrone'
import * as bootstrap from 'bootstrap'

const host = location.host.split(':')[0]

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
  if (isochroneMarker) {
    isochroneMarker.remove()
    isochroneMarker = null
  }
}

const cleanLine = () => {
  geojsonFeature.geometry.coordinates = []
  const source = map.getSource('route') as GeoJSONSource
  if (source) {
    source.setData(geojsonFeature as GeoJSONFeature)
  }
}

const cleanPolygons = () => {
  isochroneFirstFeature.geometry.coordinates = []
  const firstSource = map.getSource('isochroneFirst') as GeoJSONSource
  if (firstSource) {
    firstSource.setData(isochroneFirstFeature as GeoJSONFeature)
  }
}

const cleanAll = () => {
  cleanMarkers()
  cleanLine()
  cleanPolygons()
}

const apiCanvasTitle = document.getElementById(
  'apiCanvasTitle'
) as HTMLHeadingElement
const routingDiv = document.getElementById(
  'routeApiCanvasBody'
) as HTMLDivElement
const isochroneDiv = document.getElementById(
  'isochroneApiCanvasBody'
) as HTMLDivElement

const setupRoutingMode = () => {
  cleanAll()
  apiCanvasTitle.innerText = 'Route API'
  routingDiv.style.display = ''
  isochroneDiv.style.display = 'none'
  routingLink.classList.add('active')
  isochroneLink.classList.remove('active')
}

const setupIsochroneMode = () => {
  cleanAll()
  apiCanvasTitle.innerText = 'Isochrone API'
  routingDiv.style.display = 'none'
  isochroneDiv.style.display = ''
  routingLink.classList.remove('active')
  isochroneLink.classList.add('active')
}

const map = new Map({
  container: 'map',
  style: `http://${host}:8000/styles/maptiler-toner-ja/style.json`,
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

let isochroneFirstFeature = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ],
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
  map.addSource('isochroneFirst', {
    type: 'geojson',
    data: isochroneFirstFeature,
  })
  map.addLayer({
    id: 'isochroneFirst',
    type: 'fill',
    source: 'isochroneFirst',
    layout: {},
    paint: {
      'fill-color': '#ff0000',
      'fill-opacity': 0.33,
    },
  })
})

const doRouting = async () => {
  if (markers.length == 2) {
    const start = markers[0]
    const end = markers[1]
    const routing = new Routing(`http://${host}:8002`)
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
  if (isochroneMarker) {
    const isochrone = new Isochrone(`http://${host}:8002`)
    const firstCoordinates = await isochrone.isochrone(
      isochroneMarker.getLngLat(),
      15,
      'ff0000'
    )
    console.log(firstCoordinates)
    isochroneFirstFeature.geometry.coordinates = [firstCoordinates]
    console.log(isochroneFirstFeature)
    const firstSource = map.getSource('isochroneFirst') as GeoJSONSource
    if (firstSource) {
      firstSource.setData(isochroneFirstFeature as GeoJSONFeature)
    }
  }
}
