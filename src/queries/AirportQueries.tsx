import { gql } from '@solid-primitives/graphql'

export const AIRPORT_SEARCH = gql`
	query AirportSearch($search: String!) {
		getAirports(search: $search, first: 10, importance: 3) {
			pageInfo {
				hasNextPage
				endCursor
			}
			totalCount
			edges {
				cursor
				node {
					identifier
					icaoCode
					iataCode
					gpsCode
					name
					station {
						stationID
					}
				}
			}
		}
	}
`

const WEATHER_FRAGMENT = gql`
	fragment SkyCondition on SkyCondition {
		skyCover
		cloudType
		cloudBase
	}

	fragment Forecast on Forecast {
		fromTime
		toTime
		changeIndicator
		changeTime
		changeProbability
		windDirection
		windShearDirection
		weather
		skyConditions {
			skyCover
			cloudType
			cloudBase(unit: FOOT)
		}
		turbulenceConditions {
			intensity
			minAltitude(unit: FOOT)
			maxAltitude(unit: FOOT)
		}
		icingConditions {
			intensity
			minAltitude(unit: FOOT)
			maxAltitude(unit: FOOT)
		}
		temperatureData {
			validTime
			temperature(unit: CELSIUS)
			minTemperature(unit: CELSIUS)
			maxTemperature(unit: CELSIUS)
		}
		altimeter(unit: HECTOPASCAL)
		windSpeed(unit: KNOT)
		windGust(unit: KNOT)
		visibilityHorizontal(unit: KILOMETER)
		visibilityHorizontalIsMoreThan
		visibilityVertical(unit: FOOT)
		windShearHeight(unit: FOOT)
		windShearSpeed(unit: KNOT)
		windDirectionVariable
	}

	fragment Metar on Metar {
		observationTime
		importTime
		nextImportTimePrediction
		rawText
		temperature
		dewpoint
		altimeter
		visibility
		visibilityIsMoreThan
		windDirection
		windDirectionVariable
		windSpeed
		windGust
		flightCategory
		presentWeather
		skyConditions {
			...SkyCondition
		}
	}

	fragment Taf on Taf {
		issueTime
		rawText
		remarks
		validFromTime
		validToTime
		forecast {
			...Forecast
		}
	}

	fragment AirportWeather on Airport {
		station {
			metars(first: 2) {
				edges {
					node {
						...Metar
					}
				}
			}
			tafs(first: 1) {
				edges {
					node {
						...Taf
					}
				}
			}
		}
	}
`

export const AIRPORT_WEATHER =
	WEATHER_FRAGMENT +
	gql`
		query AirportWeather($icao: String!) {
			getAirport(icao: $icao) {
				...AirportWeather
			}
		}
	`

const AIRPORTS_IN_VICINITY_FRAGMENT = gql`
	fragment StationsVicinity on Airport {
		stationsVicinity(first: 10, radius: 250) {
			distance
			station {
				airport {
					identifier
					name
					type
					icaoCode
					iataCode
					gpsCode
					latitude
					longitude
				}
				metars(first: 1) {
					edges {
						node {
							flightCategory
						}
					}
				}
			}
		}
	}
`

export const AIRPORT_SINGLE =
	WEATHER_FRAGMENT +
	AIRPORTS_IN_VICINITY_FRAGMENT +
	gql`
		fragment AirportSearch on Airport {
			identifier
			icaoCode
			iataCode
			gpsCode
			name
			timezone
			elevation
			website
			wikipedia
			latitude
			longitude
			type
			runways(closed: false) {
				closed
				surface
				width(unit: KILOMETER)
				length(unit: KILOMETER)
				lowRunwayHeading
				lowRunwayIdentifier
				lowRunwayLatitude
				lowRunwayLongitude

				highRunwayHeading
				highRunwayIdentifier
				highRunwayLatitude
				highRunwayLongitude
			}
			municipality
			country {
				name
			}
			...AirportWeather
			...StationsVicinity
		}

		query GetSingleAirport($identifier: String!) {
			getAirport(identifier: $identifier) {
				...AirportSearch
			}
		}
	`

export const MULTIPLE_AIRPORTS_BY_IDS = gql`
	fragment MultipleAirport on Airport {
		identifier
		icaoCode
		iataCode
		gpsCode
		name
		type
		runways(closed: false) {
			closed
			surface
			width(unit: KILOMETER)
			length(unit: KILOMETER)
			lowRunwayHeading
			lowRunwayIdentifier
			lowRunwayLatitude
			lowRunwayLongitude
			highRunwayHeading
			highRunwayIdentifier
			highRunwayLatitude
			highRunwayLongitude
		}
		station {
			metars(first: 1) {
				edges {
					node {
						observationTime
						windDirection
						windSpeed
						windGust
						rawText
						windDirectionVariable
						flightCategory
					}
				}
			}
		}
	}

	query MultipleAirportsByIds($identifiers: [String!]!) {
		getAirportsByIds(identifiers: $identifiers) {
			...MultipleAirport
		}
	}
`
