import 'maplibre-gl/dist/maplibre-gl.css'

import {
  GeoJSONSource,
  GeolocateControl,
  Map,
  Marker,
  NavigationControl,
} from 'maplibre-gl'
import { LineString, Polygon } from 'geojson'
import { Routing } from './valhalla/routing'
import { Isochrone } from './valhalla/isochrone'
import { Costing, CostingArray } from './valhalla/valhalla'
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
  routeFeature.coordinates = []
  const source = map.getSource('route') as GeoJSONSource
  if (source) {
    source.setData(routeFeature)
  }
}

const cleanPolygons = () => {
  isochroneFirstFeature.coordinates = []
  const firstSource = map.getSource('isochroneFirst') as GeoJSONSource
  if (firstSource) {
    firstSource.setData(isochroneFirstFeature)
  }
  isochroneSecondFeature.coordinates = []
  const secondSource = map.getSource('isochroneSecond') as GeoJSONSource
  if (secondSource) {
    secondSource.setData(isochroneSecondFeature)
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

const routingCosting = document.getElementById(
  'routingCosting'
) as HTMLSelectElement
const isochroneCosting = document.getElementById(
  'isochroneCosting'
) as HTMLSelectElement

const setupCosting = (select: HTMLSelectElement, defaultValue: string) => {
  CostingArray.forEach((v) => {
    const costItem = document.createElement('option') as HTMLOptionElement
    costItem.value = v
    costItem.text = v
    if (v === defaultValue) {
      costItem.selected = true
    }
    select.appendChild(costItem)
  })
}

const initalizeRouting = () => {
  setupCosting(routingCosting, 'auto')
}

initalizeRouting()

const initalizeIsochrone = () => {
  setupCosting(isochroneCosting, 'pedestrian')
}

initalizeIsochrone()

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
  //style: `http://${host}:8080/styles/openmaptiles/style.json`,
  style: `http://${host}:8080/styles/osm-bright/style.json`,
  center: [139.7531, 35.68302],
  zoom: 9,
  hash: true,
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

let routeFeature: LineString = {
  type: 'LineString',
  coordinates: [[0, 0]],
}

let isochroneFirstFeature: Polygon = {
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
}

let isochroneSecondFeature: Polygon = {
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
}

map.addControl(new NavigationControl({}))

map.addControl(
  new GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  })
)

map.on('load', () => {
  map.addSource('route', {
    type: 'geojson',
    data: routeFeature,
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
  map.addSource('isochroneSecond', {
    type: 'geojson',
    data: isochroneSecondFeature,
  })
  map.addLayer({
    id: 'isochroneSecond',
    type: 'fill',
    source: 'isochroneSecond',
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
    const cost = routingCosting.value as Costing
    const line = await routing.routing(start.getLngLat(), end.getLngLat(), cost)
    routeFeature.coordinates = line
  } else {
    routeFeature.coordinates = []
  }
  const source = map.getSource('route') as GeoJSONSource
  if (source) {
    source.setData(routeFeature)
  }
}

const originDate = new Date('1970-01-01 00:00:00')

const doIsochrone = async () => {
  if (isochroneMarker) {
    const isochrone = new Isochrone(`http://${host}:8002`)
    const cost = isochroneCosting.value as Costing
    const isochroneFirstMin = document.getElementById(
      'isochroneFirstMin'
    ) as HTMLInputElement
    const firstMinDate = new Date(`1970-01-01 ${isochroneFirstMin.value}:00`)
    const firstMin =
      (firstMinDate.getTime() - originDate.getTime()) / (60 * 1000)
    const firstColorElement = document.getElementById(
      'isochroneFirstColor'
    ) as HTMLInputElement
    const firstColor = firstColorElement.value.slice(1)
    const firstCoordinates = await isochrone.isochrone(
      isochroneMarker.getLngLat(),
      firstMin,
      firstColor,
      cost
    )
    isochroneFirstFeature.coordinates = [firstCoordinates]
    map.setPaintProperty(
      'isochroneFirst',
      'fill-color',
      firstColorElement.value
    )
    console.log(firstColorElement.value)
    const firstSource = map.getSource('isochroneFirst') as GeoJSONSource
    if (firstSource) {
      firstSource.setData(isochroneFirstFeature)
    }
    const isochroneSecondMin = document.getElementById(
      'isochroneSecondMin'
    ) as HTMLInputElement
    const secondMinDate = new Date(`1970-01-01 ${isochroneSecondMin.value}:00`)
    const secondMin =
      (secondMinDate.getTime() - originDate.getTime()) / (60 * 1000)
    const secondColorElement = document.getElementById(
      'isochroneSecondColor'
    ) as HTMLInputElement
    const secondColor = secondColorElement.value.slice(1)
    const secondCoordinates = await isochrone.isochrone(
      isochroneMarker.getLngLat(),
      secondMin,
      secondColor,
      cost
    )
    isochroneSecondFeature.coordinates = [secondCoordinates]
    map.setPaintProperty(
      'isochroneSecond',
      'fill-color',
      secondColorElement.value
    )
    const secondSource = map.getSource('isochroneSecond') as GeoJSONSource
    if (secondSource) {
      secondSource.setData(isochroneSecondFeature)
    }
  }
}
