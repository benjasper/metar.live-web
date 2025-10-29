export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never }
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: { input: string; output: string }
	String: { input: string; output: string }
	Boolean: { input: boolean; output: boolean }
	Int: { input: number; output: number }
	Float: { input: number; output: number }
	Cursor: { input: any; output: any }
	Time: { input: any; output: any }
}

export type Airport = {
	__typename?: 'Airport'
	/** The country that the airport is located in. */
	country?: Maybe<Country>
	/** Elevation of the airport, in feet. */
	elevation?: Maybe<Scalars['Int']['output']>
	/** Frequencies at the airport. */
	frequencies?: Maybe<Array<Frequency>>
	/** The code that an aviation GPS database (such as Jeppesen's or Garmin's) would normally use for the airport. This will always be the ICAO code if one exists. Note that, unlike the ident column, this is not guaranteed to be globally unique. */
	gpsCode?: Maybe<Scalars['String']['output']>
	/** The three-letter IATA code for the airport. */
	iataCode?: Maybe<Scalars['String']['output']>
	/** The four-letter ICAO code of the airport. */
	icaoCode?: Maybe<Scalars['String']['output']>
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** This will be the ICAO code if available. Otherwise, it will be a local airport code (if no conflict), or if nothing else is available, an internally-generated code starting with the ISO2 country code, followed by a dash and a four-digit number. */
	identifier: Scalars['String']['output']
	/** The unique identifier of the import. */
	importID: Scalars['Int']['output']
	/** Importance of the airport. */
	importance: Scalars['Int']['output']
	/** Extra keywords/phrases to assist with search. May include former names for the airport, alternate codes, names in other languages, nearby tourist destinations, etc. */
	keywords: Array<Scalars['String']['output']>
	/** The last time the record was updated/created. */
	lastUpdated: Scalars['Time']['output']
	/** Latitude of the airport in decimal degrees (positive is north). */
	latitude: Scalars['Float']['output']
	/** The local country code for the airport, if different from the gps_code and iata_code fields (used mainly for US airports). */
	localCode?: Maybe<Scalars['String']['output']>
	/** Longitude of the airport in decimal degrees (positive is east). */
	longitude: Scalars['Float']['output']
	/** The primary municipality that the airport serves (when available). Note that this is not necessarily the municipality where the airport is physically located. */
	municipality?: Maybe<Scalars['String']['output']>
	/** The official airport name, including "Airport", "Airstrip", etc. */
	name: Scalars['String']['output']
	/** The region that the airport is located in. */
	region?: Maybe<Region>
	/** Returns all Runways for this Airport. They can be filtered with the closed parameter. */
	runways: Array<Runway>
	/** Whether the airport has scheduled airline service. */
	scheduledService: Scalars['Boolean']['output']
	/** Weather station at the airport. */
	station?: Maybe<WeatherStation>
	/** Returns the closest weather stations to the airport, within the given radius (in km). */
	stationsVicinity: Array<StationWithDistance>
	/** The timezone of the airport. */
	timezone?: Maybe<Scalars['String']['output']>
	/** Type of airport. */
	type: AirportType
	/** The URL of the airport's website. */
	website?: Maybe<Scalars['String']['output']>
	/** The URL of the airport's Wikipedia page. */
	wikipedia?: Maybe<Scalars['String']['output']>
}

export type AirportRunwaysArgs = {
	closed?: InputMaybe<Scalars['Boolean']['input']>
}

export type AirportStationsVicinityArgs = {
	first?: InputMaybe<Scalars['Int']['input']>
	radius?: InputMaybe<Scalars['Float']['input']>
}

export type AirportConnection = {
	__typename?: 'AirportConnection'
	/** List of airport edges. */
	edges: Array<AirportEdge>
	/** Page info of this connection. */
	pageInfo: PageInfo
	/** Total number of airports. */
	totalCount: Scalars['Int']['output']
}

export type AirportEdge = {
	__typename?: 'AirportEdge'
	/** The cursor of this airport. */
	cursor: Scalars['Cursor']['output']
	/** The airport object. */
	node: Airport
}

/** Ordering options for Airport connections */
export type AirportOrder = {
	/** The ordering direction. */
	direction?: OrderDirection
	/** The field by which to order Airports. */
	field: AirportOrderField
}

/** Properties by which Airport connections can be ordered. */
export enum AirportOrderField {
	IcaoCode = 'ICAO_CODE',
	Importance = 'IMPORTANCE',
}

/** AirportType is enum for the field type */
export enum AirportType {
	ClosedAirport = 'closed_airport',
	Heliport = 'heliport',
	LargeAirport = 'large_airport',
	MediumAirport = 'medium_airport',
	SeaplaneBase = 'seaplane_base',
	SmallAirport = 'small_airport',
}

export type Country = {
	__typename?: 'Country'
	/** The ISO 3166-1 alpha-2 code of the country. A handful of unofficial, non-ISO codes are also in use, such as "XK" for Kosovo. */
	code: Scalars['String']['output']
	/** Where the airport is (primarily) located. */
	continent: CountryContinent
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** The unique identifier of the import. */
	importID: Scalars['Int']['output']
	/** Keywords that can be used to search for the country. */
	keywords: Array<Scalars['String']['output']>
	/** The last time the record was updated/created. */
	lastUpdated: Scalars['Time']['output']
	/** The name of the country. */
	name: Scalars['String']['output']
	/** The wikipedia link of the country. */
	wikipediaLink: Scalars['String']['output']
}

/** CountryContinent is enum for the field continent */
export enum CountryContinent {
	Af = 'AF',
	An = 'AN',
	As = 'AS',
	Eu = 'EU',
	Na = 'NA',
	Oc = 'OC',
	Sa = 'SA',
}

export type Forecast = {
	__typename?: 'Forecast'
	/** The altimeter in the specified unit. */
	altimeter?: Maybe<Scalars['Float']['output']>
	/** The change indicator. */
	changeIndicator?: Maybe<ForecastChangeIndicator>
	/** The probability of the change. */
	changeProbability?: Maybe<Scalars['Int']['output']>
	/** The time of the change. */
	changeTime?: Maybe<Scalars['Time']['output']>
	/** The start time of the forecast period. */
	fromTime: Scalars['Time']['output']
	/** The icing conditions. */
	icingConditions?: Maybe<Array<IcingCondition>>
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** The not decoded string. */
	notDecoded?: Maybe<Scalars['String']['output']>
	/** The sky conditions. */
	skyConditions?: Maybe<Array<SkyCondition>>
	/** The temperature data. */
	temperatureData?: Maybe<Array<TemperatureData>>
	/** The end time of the forecast period. */
	toTime: Scalars['Time']['output']
	/** The turbulence conditions. */
	turbulenceConditions?: Maybe<Array<TurbulenceCondition>>
	/** Visibility horizontal in the specified unit. */
	visibilityHorizontal?: Maybe<Scalars['Float']['output']>
	/** Whether the visibility is more than it's assigned value (+) */
	visibilityHorizontalIsMoreThan: Scalars['Boolean']['output']
	/** Visibility vertical in the specified unit. */
	visibilityVertical?: Maybe<Scalars['Float']['output']>
	/** The weather string. */
	weather?: Maybe<Scalars['String']['output']>
	/** The wind direction in degrees. */
	windDirection?: Maybe<Scalars['Int']['output']>
	/** Whether the wind direction is variable (VRB) */
	windDirectionVariable: Scalars['Boolean']['output']
	/** Wind gust speed in the specified unit. */
	windGust?: Maybe<Scalars['Float']['output']>
	/** The wind shear direction in degrees. */
	windShearDirection?: Maybe<Scalars['Int']['output']>
	/** The height of the wind shear in the specified unit above ground level. */
	windShearHeight?: Maybe<Scalars['Float']['output']>
	/** Wind shear speed in the specified unit. */
	windShearSpeed?: Maybe<Scalars['Float']['output']>
	/** The wind speed in the specified unit. */
	windSpeed?: Maybe<Scalars['Float']['output']>
}

export type ForecastAltimeterArgs = {
	unit?: PressureUnit
}

export type ForecastVisibilityHorizontalArgs = {
	unit?: LengthUnit
}

export type ForecastVisibilityVerticalArgs = {
	unit?: LengthUnit
}

export type ForecastWindGustArgs = {
	unit?: SpeedUnit
}

export type ForecastWindShearHeightArgs = {
	unit?: LengthUnit
}

export type ForecastWindShearSpeedArgs = {
	unit?: SpeedUnit
}

export type ForecastWindSpeedArgs = {
	unit?: SpeedUnit
}

/** ForecastChangeIndicator is enum for the field change_indicator */
export enum ForecastChangeIndicator {
	Becmg = 'BECMG',
	Fm = 'FM',
	Prob = 'PROB',
	Tempo = 'TEMPO',
}

export type Frequency = {
	__typename?: 'Frequency'
	airport?: Maybe<Airport>
	/** A description of the frequency. */
	description: Scalars['String']['output']
	/** Radio frequency in megahertz. Note that the same frequency may appear multiple times for an airport, serving different functions */
	frequency: Scalars['Float']['output']
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** The unique identifier of the import. */
	importID: Scalars['Int']['output']
	/** The last time the record was updated/created. */
	lastUpdated: Scalars['Time']['output']
	/** A code for the frequency type. Some common values are "TWR" (tower), "ATF" or "CTAF" (common traffic frequency), "GND" (ground control), "RMP" (ramp control), "ATIS" (automated weather), "RCO" (remote radio outlet), "ARR" (arrivals), "DEP" (departures), "UNICOM" (monitored ground station), and "RDO" (a flight-service station). */
	type: Scalars['String']['output']
}

export type IcingCondition = {
	__typename?: 'IcingCondition'
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** The intensity of the icing. */
	intensity: Scalars['String']['output']
	/** Max altitude in the specified unit. */
	maxAltitude?: Maybe<Scalars['Float']['output']>
	/** Min altitude in the specified unit. */
	minAltitude?: Maybe<Scalars['Float']['output']>
}

export type IcingConditionMaxAltitudeArgs = {
	unit?: LengthUnit
}

export type IcingConditionMinAltitudeArgs = {
	unit?: LengthUnit
}

export enum LengthUnit {
	Foot = 'FOOT',
	Kilometer = 'KILOMETER',
	Meter = 'METER',
	NauticalMile = 'NAUTICAL_MILE',
	StatuteMile = 'STATUTE_MILE',
}

export type Metar = {
	__typename?: 'Metar'
	/** The altimeter in the specified unit. */
	altimeter?: Maybe<Scalars['Float']['output']>
	/** The dew point in the specified unit. */
	dewpoint?: Maybe<Scalars['Float']['output']>
	flightCategory?: Maybe<MetarFlightCategory>
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** The time the METAR was imported. */
	importTime: Scalars['Time']['output']
	/** The maximum air temperature in Celsius from the past 6 hours. */
	maxTemp6?: Maybe<Scalars['Float']['output']>
	/** The maximum air temperature in Celsius from the past 24 hours. */
	maxTemp24?: Maybe<Scalars['Float']['output']>
	/** The type of METAR. */
	metarType: MetarMetarType
	/** The minimum air temperature in Celsius from the past 6 hours. */
	minTemp6?: Maybe<Scalars['Float']['output']>
	/** The minimum air temperature in Celsius from the past 24 hours. */
	minTemp24?: Maybe<Scalars['Float']['output']>
	/** The time the METAR is expected to be imported/available next. */
	nextImportTimePrediction?: Maybe<Scalars['Time']['output']>
	/** The time the METAR was observed. */
	observationTime: Scalars['Time']['output']
	/** The precipitation in inches from since the last observation. 0.0005 in = trace precipitation. */
	precipitation?: Maybe<Scalars['Float']['output']>
	/** The precipitation in inches from the past 3 hours. 0.0005 in = trace precipitation. */
	precipitation3?: Maybe<Scalars['Float']['output']>
	/** The precipitation in inches from the past 6 hours. 0.0005 in = trace precipitation. */
	precipitation6?: Maybe<Scalars['Float']['output']>
	/** The precipitation in inches from the past 24 hours. 0.0005 in = trace precipitation. */
	precipitation24?: Maybe<Scalars['Float']['output']>
	/** The present weather string. */
	presentWeather?: Maybe<Scalars['String']['output']>
	/** Pressure tendency in the specified unit. */
	pressureTendency?: Maybe<Scalars['Float']['output']>
	/** Whether it's an automated station, of one of the following types A01|A01A|A02|A02A|AOA|AWOS. */
	qualityControlAutoStation: Scalars['Boolean']['output']
	/** Quality control corrected. */
	qualityControlCorrected?: Maybe<Scalars['Boolean']['output']>
	/** Whether Freezing rain sensor is off. */
	qualityControlFreezingRainSensorOff: Scalars['Boolean']['output']
	/** Whether Lightning sensor is off. */
	qualityControlLightningSensorOff: Scalars['Boolean']['output']
	/** Maintenance check indicator - maintenance is needed. */
	qualityControlMaintenanceIndicatorOn: Scalars['Boolean']['output']
	/** No signal. */
	qualityControlNoSignal: Scalars['Boolean']['output']
	/** Whether Present weather sensor is off. */
	qualityControlPresentWeatherSensorOff: Scalars['Boolean']['output']
	/** The raw METAR text. */
	rawText: Scalars['String']['output']
	/** Sea level pressure in the specified unit. */
	seaLevelPressure?: Maybe<Scalars['Float']['output']>
	/** The sky conditions. */
	skyConditions?: Maybe<Array<SkyCondition>>
	/** Snow depth in the specified unit. */
	snowDepth?: Maybe<Scalars['Float']['output']>
	/** The station that provided the METAR. */
	station: WeatherStation
	/** The temperature in the specified unit. */
	temperature?: Maybe<Scalars['Float']['output']>
	/** Vertical visibility in the specified unit. */
	verticalVisibility?: Maybe<Scalars['Float']['output']>
	/** The visibility in the specified unit. */
	visibility?: Maybe<Scalars['Float']['output']>
	/** Whether the visibility is more than it's assigned value (+) */
	visibilityIsMoreThan: Scalars['Boolean']['output']
	/** The wind direction in degrees, or 0 if calm. */
	windDirection?: Maybe<Scalars['Int']['output']>
	/** Whether the wind direction is variable (VRB) */
	windDirectionVariable: Scalars['Boolean']['output']
	/** Wind gust speed in the specified unit. */
	windGust?: Maybe<Scalars['Float']['output']>
	/** The wind speed in the specified unit. */
	windSpeed?: Maybe<Scalars['Float']['output']>
}

export type MetarAltimeterArgs = {
	unit?: PressureUnit
}

export type MetarDewpointArgs = {
	unit?: TemperatureUnit
}

export type MetarPressureTendencyArgs = {
	unit?: PressureUnit
}

export type MetarSeaLevelPressureArgs = {
	unit?: PressureUnit
}

export type MetarSnowDepthArgs = {
	unit?: SmallLengthUnit
}

export type MetarTemperatureArgs = {
	unit?: TemperatureUnit
}

export type MetarVerticalVisibilityArgs = {
	unit?: LengthUnit
}

export type MetarVisibilityArgs = {
	unit?: LengthUnit
}

export type MetarWindGustArgs = {
	unit?: SpeedUnit
}

export type MetarWindSpeedArgs = {
	unit?: SpeedUnit
}

export type MetarConnection = {
	__typename?: 'MetarConnection'
	/** List of metar edges. */
	edges: Array<MetarEdge>
	/** Page info of this connection. */
	pageInfo: PageInfo
	/** Total number of airports. */
	totalCount: Scalars['Int']['output']
}

export type MetarEdge = {
	__typename?: 'MetarEdge'
	/** The cursor of this metar. */
	cursor: Scalars['Cursor']['output']
	/** The metar object. */
	node: Metar
}

/** MetarFlightCategory is enum for the field flight_category */
export enum MetarFlightCategory {
	Ifr = 'IFR',
	Lifr = 'LIFR',
	Mvfr = 'MVFR',
	Vfr = 'VFR',
}

/** MetarMetarType is enum for the field metar_type */
export enum MetarMetarType {
	Metar = 'METAR',
	Speci = 'SPECI',
}

/** Ordering options for Metar connections */
export type MetarOrder = {
	/** The ordering direction. */
	direction?: OrderDirection
	/** The field by which to order Metars. */
	field: MetarOrderField
}

/** Properties by which Metar connections can be ordered. */
export enum MetarOrderField {
	ObservationTime = 'OBSERVATION_TIME',
}

/** Possible directions in which to order a list of items when provided an `orderBy` argument. */
export enum OrderDirection {
	/** Specifies an ascending order for a given `orderBy` argument. */
	Asc = 'ASC',
	/** Specifies a descending order for a given `orderBy` argument. */
	Desc = 'DESC',
}

export type PageInfo = {
	__typename?: 'PageInfo'
	/** The cursor to the last element of the current page. */
	endCursor?: Maybe<Scalars['Cursor']['output']>
	/** Whether there is at least one more page. */
	hasNextPage: Scalars['Boolean']['output']
	/** Whether there is a previous page. */
	hasPreviousPage: Scalars['Boolean']['output']
	/** The cursor to the first element of the current page. */
	startCursor?: Maybe<Scalars['Cursor']['output']>
}

export enum PressureUnit {
	Hectopascal = 'HECTOPASCAL',
	InchOfMercury = 'INCH_OF_MERCURY',
}

export type Query = {
	__typename?: 'Query'
	/** Get a single airport by it's id, identifier, icao code or iata code. */
	getAirport?: Maybe<Airport>
	/** Search for airports by a variety of criteria. */
	getAirports: AirportConnection
	/** Get multiple specific airports. If airport could not be found, it won't be contained in the result. */
	getAirportsByIds: Array<Airport>
	/** Get a single weather station by it's id or identifier. */
	getStation?: Maybe<WeatherStation>
	/** Search for weather stations by it's identifier. */
	getStations: WeatherStationConnection
	/** Get the status of the server. */
	status: Status
}

export type QueryGetAirportArgs = {
	iata?: InputMaybe<Scalars['String']['input']>
	icao?: InputMaybe<Scalars['String']['input']>
	id?: InputMaybe<Scalars['String']['input']>
	identifier?: InputMaybe<Scalars['String']['input']>
}

export type QueryGetAirportsArgs = {
	after?: InputMaybe<Scalars['Cursor']['input']>
	before?: InputMaybe<Scalars['Cursor']['input']>
	first?: InputMaybe<Scalars['Int']['input']>
	hasWeather?: InputMaybe<Scalars['Boolean']['input']>
	iata?: InputMaybe<Scalars['String']['input']>
	icao?: InputMaybe<Scalars['String']['input']>
	identifier?: InputMaybe<Scalars['String']['input']>
	importance?: InputMaybe<Scalars['Int']['input']>
	last?: InputMaybe<Scalars['Int']['input']>
	order?: InputMaybe<Array<AirportOrder>>
	search?: InputMaybe<Scalars['String']['input']>
	type?: InputMaybe<AirportType>
}

export type QueryGetAirportsByIdsArgs = {
	identifiers: Array<Scalars['String']['input']>
}

export type QueryGetStationArgs = {
	id?: InputMaybe<Scalars['String']['input']>
	identifier?: InputMaybe<Scalars['String']['input']>
}

export type QueryGetStationsArgs = {
	after?: InputMaybe<Scalars['Cursor']['input']>
	before?: InputMaybe<Scalars['Cursor']['input']>
	first?: InputMaybe<Scalars['Int']['input']>
	identifier?: InputMaybe<Scalars['String']['input']>
	last?: InputMaybe<Scalars['Int']['input']>
}

export type Region = {
	__typename?: 'Region'
	/** local_code prefixed with the country code to make a globally-unique identifier. */
	code: Scalars['String']['output']
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** The unique identifier of the import. */
	importID: Scalars['Int']['output']
	/** Keywords that can be used to search for the region. */
	keywords: Array<Scalars['String']['output']>
	/** The last time the record was updated/created. */
	lastUpdated: Scalars['Time']['output']
	/** The local code for the administrative subdivision. Whenever possible, these are official ISO 3166:2, at the highest level available, but in some cases OurAirports has to use unofficial codes. There is also a pseudo code "U-A" for each country, which means that the airport has not yet been assigned to a region (or perhaps can't be, as in the case of a deep-sea oil platform). */
	localCode: Scalars['String']['output']
	name: Scalars['String']['output']
	/** The wikipedia link of the region. */
	wikipediaLink: Scalars['String']['output']
}

export type Runway = {
	__typename?: 'Runway'
	airport?: Maybe<Airport>
	/** Whether the runway is currently closed or not. */
	closed: Scalars['Boolean']['output']
	/** Displaced threshold length of the higher numbered runway end, in feet. */
	highRunwayDisplacedThreshold?: Maybe<Scalars['Int']['output']>
	/** Elevation of the high numbered runway end, in feet. */
	highRunwayElevation?: Maybe<Scalars['Int']['output']>
	/** True (not magnetic) heading of the higher numbered runway. */
	highRunwayHeading?: Maybe<Scalars['Float']['output']>
	/** High numbered runway identifier, like 01L. */
	highRunwayIdentifier: Scalars['String']['output']
	/** Latitude of the high numbered runway end, in decimal degrees (positive is north). */
	highRunwayLatitude?: Maybe<Scalars['Float']['output']>
	/** Longitude of the high numbered runway end, in decimal degrees (positive is east). */
	highRunwayLongitude?: Maybe<Scalars['Float']['output']>
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** The unique identifier of the import. */
	importID: Scalars['Int']['output']
	/** The last time the record was updated/created. */
	lastUpdated: Scalars['Time']['output']
	/** The length of the runway in the specified unit. */
	length?: Maybe<Scalars['Float']['output']>
	/** Whether the runway is lighted at night or not. */
	lighted: Scalars['Boolean']['output']
	/** Displaced threshold length of the lower numbered runway end, in feet. */
	lowRunwayDisplacedThreshold?: Maybe<Scalars['Int']['output']>
	/** Elevation of the low numbered runway end, in feet. */
	lowRunwayElevation?: Maybe<Scalars['Int']['output']>
	/** True (not magnetic) heading of the lower numbered runway. */
	lowRunwayHeading?: Maybe<Scalars['Float']['output']>
	/** Low numbered runway identifier, like 18R. */
	lowRunwayIdentifier: Scalars['String']['output']
	/** Latitude of the low numbered runway end, in decimal degrees (positive is north). */
	lowRunwayLatitude?: Maybe<Scalars['Float']['output']>
	/** Longitude of the low numbered runway end, in decimal degrees (positive is east). */
	lowRunwayLongitude?: Maybe<Scalars['Float']['output']>
	/** Code for the runway surface type. This is not yet a controlled vocabulary, but probably will be soon. Some common values include "ASP" (asphalt), "TURF" (turf), "CON" (concrete), "GRS" (grass), "GRE" (gravel), "WATER" (water), and "UNK" (unknown). */
	surface?: Maybe<Scalars['String']['output']>
	/** The width of the runway in the specified unit. */
	width?: Maybe<Scalars['Float']['output']>
}

export type RunwayLengthArgs = {
	unit?: LengthUnit
}

export type RunwayWidthArgs = {
	unit?: LengthUnit
}

export type SkyCondition = {
	__typename?: 'SkyCondition'
	/** The cloud base in the specified unit. */
	cloudBase?: Maybe<Scalars['Float']['output']>
	/** Cloud type. Only present in TAFs. */
	cloudType?: Maybe<SkyConditionCloudType>
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	skyCover: SkyConditionSkyCover
}

export type SkyConditionCloudBaseArgs = {
	unit?: LengthUnit
}

/** SkyConditionCloudType is enum for the field cloud_type */
export enum SkyConditionCloudType {
	Cb = 'CB',
	Cu = 'CU',
	Tcu = 'TCU',
}

/** SkyConditionSkyCover is enum for the field sky_cover */
export enum SkyConditionSkyCover {
	Bkn = 'BKN',
	Cavok = 'CAVOK',
	Clr = 'CLR',
	Few = 'FEW',
	Nsc = 'NSC',
	Ovc = 'OVC',
	Ovcx = 'OVCX',
	Ovx = 'OVX',
	Sct = 'SCT',
	Skc = 'SKC',
}

export enum SmallLengthUnit {
	Centimeter = 'CENTIMETER',
	Inch = 'INCH',
}

export enum SpeedUnit {
	KilometerPerHour = 'KILOMETER_PER_HOUR',
	Knot = 'KNOT',
}

export type StationWithDistance = {
	__typename?: 'StationWithDistance'
	/** The distance in meters from the given location to the airport. */
	distance: Scalars['Float']['output']
	/** The METAR for the station. */
	station: WeatherStation
}

export type Status = {
	__typename?: 'Status'
	/** Last weather sync time. */
	lastWeatherSync: Scalars['Time']['output']
}

export type Taf = {
	__typename?: 'Taf'
	/** TAF bulletin time. */
	bulletinTime: Scalars['Time']['output']
	/** The forecasts */
	forecast?: Maybe<Array<Forecast>>
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** The time the TAF was imported. */
	importTime: Scalars['Time']['output']
	/** The time the TAF was issued. */
	issueTime: Scalars['Time']['output']
	/** The raw TAF text. */
	rawText: Scalars['String']['output']
	/** Remarks. */
	remarks: Scalars['String']['output']
	/** The station that issued this taf. */
	station: WeatherStation
	/** The start time of the TAF validity period. */
	validFromTime: Scalars['Time']['output']
	/** The end time of the TAF validity period. */
	validToTime: Scalars['Time']['output']
}

export type TafConnection = {
	__typename?: 'TafConnection'
	/** List of taf edges. */
	edges: Array<TafEdge>
	/** Page info of this connection. */
	pageInfo: PageInfo
	/** Total number of tafs. */
	totalCount: Scalars['Int']['output']
}

export type TafEdge = {
	__typename?: 'TafEdge'
	/** The cursor of this taf. */
	cursor: Scalars['Cursor']['output']
	/** The taf object. */
	node: Taf
}

/** Ordering options for Taf connections */
export type TafOrder = {
	/** The ordering direction. */
	direction?: OrderDirection
	/** The field by which to order Tafs. */
	field: TafOrderField
}

/** Properties by which Taf connections can be ordered. */
export enum TafOrderField {
	IssueTime = 'ISSUE_TIME',
	ValidFromTime = 'valid_from_time',
}

export type TemperatureData = {
	__typename?: 'TemperatureData'
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** Max temperature in the specified unit. */
	maxTemperature?: Maybe<Scalars['Float']['output']>
	/** Min temperature in the specified unit. */
	minTemperature?: Maybe<Scalars['Float']['output']>
	/** The temperature in the specified unit. */
	temperature: Scalars['Float']['output']
	/** The time the temperature data is valid. */
	validTime: Scalars['Time']['output']
}

export type TemperatureDataMaxTemperatureArgs = {
	unit?: TemperatureUnit
}

export type TemperatureDataMinTemperatureArgs = {
	unit?: TemperatureUnit
}

export type TemperatureDataTemperatureArgs = {
	unit?: TemperatureUnit
}

export enum TemperatureUnit {
	Celsius = 'CELSIUS',
	Fahrenheit = 'FAHRENHEIT',
}

export type TurbulenceCondition = {
	__typename?: 'TurbulenceCondition'
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** The intensity of the turbulence. */
	intensity: Scalars['String']['output']
	/** Max altitude in the specified unit. */
	maxAltitude?: Maybe<Scalars['Float']['output']>
	/** Min altitude in the specified unit. */
	minAltitude?: Maybe<Scalars['Float']['output']>
}

export type TurbulenceConditionMaxAltitudeArgs = {
	unit?: LengthUnit
}

export type TurbulenceConditionMinAltitudeArgs = {
	unit?: LengthUnit
}

export type WeatherStation = {
	__typename?: 'WeatherStation'
	/** The airport that hosts this station. This can also be empty if the metar is from a weather station outside an airport. */
	airport?: Maybe<Airport>
	/** The elevation in meters of the station. */
	elevation?: Maybe<Scalars['Float']['output']>
	/** The unique identifier of the record. */
	id: Scalars['ID']['output']
	/** The latitude in decimal degrees of the station. */
	latitude?: Maybe<Scalars['Float']['output']>
	/** The longitude in decimal degrees of the station. */
	longitude?: Maybe<Scalars['Float']['output']>
	/** Returns the latest METARs for this station sorted by their observation time. */
	metars: MetarConnection
	/** The ICAO identifier of the station that provided the weather data or identifier of the weather station. */
	stationID: Scalars['String']['output']
	/** Returns the latest TAFs for this station sorted by their issued time. */
	tafs: TafConnection
}

export type WeatherStationMetarsArgs = {
	after?: InputMaybe<Scalars['Cursor']['input']>
	before?: InputMaybe<Scalars['Cursor']['input']>
	first?: InputMaybe<Scalars['Int']['input']>
	last?: InputMaybe<Scalars['Int']['input']>
}

export type WeatherStationTafsArgs = {
	after?: InputMaybe<Scalars['Cursor']['input']>
	before?: InputMaybe<Scalars['Cursor']['input']>
	first?: InputMaybe<Scalars['Int']['input']>
	last?: InputMaybe<Scalars['Int']['input']>
}

export type WeatherStationConnection = {
	__typename?: 'WeatherStationConnection'
	/** List of weather station edges. */
	edges: Array<WeatherStationEdge>
	/** Page info of this connection. */
	pageInfo: PageInfo
	/** Total number of weather stations. */
	totalCount: Scalars['Int']['output']
}

export type WeatherStationEdge = {
	__typename?: 'WeatherStationEdge'
	/** The cursor of this weather station. */
	cursor: Scalars['Cursor']['output']
	/** The weather station object. */
	node: WeatherStation
}

export type AirportSearchQueryVariables = Exact<{
	search: Scalars['String']['input']
}>

export type AirportSearchQuery = {
	__typename?: 'Query'
	getAirports: {
		__typename?: 'AirportConnection'
		totalCount: number
		pageInfo: { __typename?: 'PageInfo'; hasNextPage: boolean; endCursor?: any | null }
		edges: Array<{
			__typename?: 'AirportEdge'
			cursor: any
			node: {
				__typename?: 'Airport'
				identifier: string
				icaoCode?: string | null
				iataCode?: string | null
				gpsCode?: string | null
				name: string
				station?: { __typename?: 'WeatherStation'; stationID: string } | null
			}
		}>
	}
}

export type SkyConditionFragment = {
	__typename?: 'SkyCondition'
	skyCover: SkyConditionSkyCover
	cloudType?: SkyConditionCloudType | null
	cloudBase?: number | null
}

export type ForecastFragment = {
	__typename?: 'Forecast'
	fromTime: any
	toTime: any
	changeIndicator?: ForecastChangeIndicator | null
	changeTime?: any | null
	changeProbability?: number | null
	windDirection?: number | null
	windShearDirection?: number | null
	weather?: string | null
	altimeter?: number | null
	windSpeed?: number | null
	windGust?: number | null
	visibilityHorizontal?: number | null
	visibilityHorizontalIsMoreThan: boolean
	visibilityVertical?: number | null
	windShearHeight?: number | null
	windShearSpeed?: number | null
	windDirectionVariable: boolean
	skyConditions?: Array<{
		__typename?: 'SkyCondition'
		skyCover: SkyConditionSkyCover
		cloudType?: SkyConditionCloudType | null
		cloudBase?: number | null
	}> | null
	turbulenceConditions?: Array<{
		__typename?: 'TurbulenceCondition'
		intensity: string
		minAltitude?: number | null
		maxAltitude?: number | null
	}> | null
	icingConditions?: Array<{
		__typename?: 'IcingCondition'
		intensity: string
		minAltitude?: number | null
		maxAltitude?: number | null
	}> | null
	temperatureData?: Array<{
		__typename?: 'TemperatureData'
		validTime: any
		temperature: number
		minTemperature?: number | null
		maxTemperature?: number | null
	}> | null
}

export type MetarFragment = {
	__typename?: 'Metar'
	observationTime: any
	importTime: any
	nextImportTimePrediction?: any | null
	rawText: string
	temperature?: number | null
	dewpoint?: number | null
	altimeter?: number | null
	visibility?: number | null
	visibilityIsMoreThan: boolean
	windDirection?: number | null
	windDirectionVariable: boolean
	windSpeed?: number | null
	windGust?: number | null
	flightCategory?: MetarFlightCategory | null
	presentWeather?: string | null
	skyConditions?: Array<{
		__typename?: 'SkyCondition'
		skyCover: SkyConditionSkyCover
		cloudType?: SkyConditionCloudType | null
		cloudBase?: number | null
	}> | null
}

export type TafFragment = {
	__typename?: 'Taf'
	issueTime: any
	rawText: string
	remarks: string
	validFromTime: any
	validToTime: any
	forecast?: Array<{
		__typename?: 'Forecast'
		fromTime: any
		toTime: any
		changeIndicator?: ForecastChangeIndicator | null
		changeTime?: any | null
		changeProbability?: number | null
		windDirection?: number | null
		windShearDirection?: number | null
		weather?: string | null
		altimeter?: number | null
		windSpeed?: number | null
		windGust?: number | null
		visibilityHorizontal?: number | null
		visibilityHorizontalIsMoreThan: boolean
		visibilityVertical?: number | null
		windShearHeight?: number | null
		windShearSpeed?: number | null
		windDirectionVariable: boolean
		skyConditions?: Array<{
			__typename?: 'SkyCondition'
			skyCover: SkyConditionSkyCover
			cloudType?: SkyConditionCloudType | null
			cloudBase?: number | null
		}> | null
		turbulenceConditions?: Array<{
			__typename?: 'TurbulenceCondition'
			intensity: string
			minAltitude?: number | null
			maxAltitude?: number | null
		}> | null
		icingConditions?: Array<{
			__typename?: 'IcingCondition'
			intensity: string
			minAltitude?: number | null
			maxAltitude?: number | null
		}> | null
		temperatureData?: Array<{
			__typename?: 'TemperatureData'
			validTime: any
			temperature: number
			minTemperature?: number | null
			maxTemperature?: number | null
		}> | null
	}> | null
}

export type AirportWeatherFragment = {
	__typename?: 'Airport'
	station?: {
		__typename?: 'WeatherStation'
		metars: {
			__typename?: 'MetarConnection'
			edges: Array<{
				__typename?: 'MetarEdge'
				node: {
					__typename?: 'Metar'
					observationTime: any
					importTime: any
					nextImportTimePrediction?: any | null
					rawText: string
					temperature?: number | null
					dewpoint?: number | null
					altimeter?: number | null
					visibility?: number | null
					visibilityIsMoreThan: boolean
					windDirection?: number | null
					windDirectionVariable: boolean
					windSpeed?: number | null
					windGust?: number | null
					flightCategory?: MetarFlightCategory | null
					presentWeather?: string | null
					skyConditions?: Array<{
						__typename?: 'SkyCondition'
						skyCover: SkyConditionSkyCover
						cloudType?: SkyConditionCloudType | null
						cloudBase?: number | null
					}> | null
				}
			}>
		}
		tafs: {
			__typename?: 'TafConnection'
			edges: Array<{
				__typename?: 'TafEdge'
				node: {
					__typename?: 'Taf'
					issueTime: any
					rawText: string
					remarks: string
					validFromTime: any
					validToTime: any
					forecast?: Array<{
						__typename?: 'Forecast'
						fromTime: any
						toTime: any
						changeIndicator?: ForecastChangeIndicator | null
						changeTime?: any | null
						changeProbability?: number | null
						windDirection?: number | null
						windShearDirection?: number | null
						weather?: string | null
						altimeter?: number | null
						windSpeed?: number | null
						windGust?: number | null
						visibilityHorizontal?: number | null
						visibilityHorizontalIsMoreThan: boolean
						visibilityVertical?: number | null
						windShearHeight?: number | null
						windShearSpeed?: number | null
						windDirectionVariable: boolean
						skyConditions?: Array<{
							__typename?: 'SkyCondition'
							skyCover: SkyConditionSkyCover
							cloudType?: SkyConditionCloudType | null
							cloudBase?: number | null
						}> | null
						turbulenceConditions?: Array<{
							__typename?: 'TurbulenceCondition'
							intensity: string
							minAltitude?: number | null
							maxAltitude?: number | null
						}> | null
						icingConditions?: Array<{
							__typename?: 'IcingCondition'
							intensity: string
							minAltitude?: number | null
							maxAltitude?: number | null
						}> | null
						temperatureData?: Array<{
							__typename?: 'TemperatureData'
							validTime: any
							temperature: number
							minTemperature?: number | null
							maxTemperature?: number | null
						}> | null
					}> | null
				}
			}>
		}
	} | null
}

export type AirportWeatherQueryVariables = Exact<{
	icao: Scalars['String']['input']
}>

export type AirportWeatherQuery = {
	__typename?: 'Query'
	status: { __typename?: 'Status'; lastWeatherSync: any }
	getAirport?: {
		__typename?: 'Airport'
		station?: {
			__typename?: 'WeatherStation'
			metars: {
				__typename?: 'MetarConnection'
				edges: Array<{
					__typename?: 'MetarEdge'
					node: {
						__typename?: 'Metar'
						observationTime: any
						importTime: any
						nextImportTimePrediction?: any | null
						rawText: string
						temperature?: number | null
						dewpoint?: number | null
						altimeter?: number | null
						visibility?: number | null
						visibilityIsMoreThan: boolean
						windDirection?: number | null
						windDirectionVariable: boolean
						windSpeed?: number | null
						windGust?: number | null
						flightCategory?: MetarFlightCategory | null
						presentWeather?: string | null
						skyConditions?: Array<{
							__typename?: 'SkyCondition'
							skyCover: SkyConditionSkyCover
							cloudType?: SkyConditionCloudType | null
							cloudBase?: number | null
						}> | null
					}
				}>
			}
			tafs: {
				__typename?: 'TafConnection'
				edges: Array<{
					__typename?: 'TafEdge'
					node: {
						__typename?: 'Taf'
						issueTime: any
						rawText: string
						remarks: string
						validFromTime: any
						validToTime: any
						forecast?: Array<{
							__typename?: 'Forecast'
							fromTime: any
							toTime: any
							changeIndicator?: ForecastChangeIndicator | null
							changeTime?: any | null
							changeProbability?: number | null
							windDirection?: number | null
							windShearDirection?: number | null
							weather?: string | null
							altimeter?: number | null
							windSpeed?: number | null
							windGust?: number | null
							visibilityHorizontal?: number | null
							visibilityHorizontalIsMoreThan: boolean
							visibilityVertical?: number | null
							windShearHeight?: number | null
							windShearSpeed?: number | null
							windDirectionVariable: boolean
							skyConditions?: Array<{
								__typename?: 'SkyCondition'
								skyCover: SkyConditionSkyCover
								cloudType?: SkyConditionCloudType | null
								cloudBase?: number | null
							}> | null
							turbulenceConditions?: Array<{
								__typename?: 'TurbulenceCondition'
								intensity: string
								minAltitude?: number | null
								maxAltitude?: number | null
							}> | null
							icingConditions?: Array<{
								__typename?: 'IcingCondition'
								intensity: string
								minAltitude?: number | null
								maxAltitude?: number | null
							}> | null
							temperatureData?: Array<{
								__typename?: 'TemperatureData'
								validTime: any
								temperature: number
								minTemperature?: number | null
								maxTemperature?: number | null
							}> | null
						}> | null
					}
				}>
			}
		} | null
	} | null
}

export type StationsVicinityFragment = {
	__typename?: 'Airport'
	stationsVicinity: Array<{
		__typename?: 'StationWithDistance'
		distance: number
		station: {
			__typename?: 'WeatherStation'
			airport?: {
				__typename?: 'Airport'
				identifier: string
				name: string
				type: AirportType
				icaoCode?: string | null
				iataCode?: string | null
				gpsCode?: string | null
				latitude: number
				longitude: number
			} | null
			metars: {
				__typename?: 'MetarConnection'
				edges: Array<{
					__typename?: 'MetarEdge'
					node: { __typename?: 'Metar'; flightCategory?: MetarFlightCategory | null }
				}>
			}
		}
	}>
}

export type AirportSearchFragment = {
	__typename?: 'Airport'
	identifier: string
	icaoCode?: string | null
	iataCode?: string | null
	gpsCode?: string | null
	name: string
	timezone?: string | null
	elevation?: number | null
	website?: string | null
	wikipedia?: string | null
	latitude: number
	longitude: number
	type: AirportType
	municipality?: string | null
	runways: Array<{
		__typename?: 'Runway'
		closed: boolean
		surface?: string | null
		width?: number | null
		length?: number | null
		lowRunwayHeading?: number | null
		lowRunwayIdentifier: string
		lowRunwayLatitude?: number | null
		lowRunwayLongitude?: number | null
		highRunwayHeading?: number | null
		highRunwayIdentifier: string
		highRunwayLatitude?: number | null
		highRunwayLongitude?: number | null
	}>
	country?: { __typename?: 'Country'; name: string } | null
	station?: {
		__typename?: 'WeatherStation'
		metars: {
			__typename?: 'MetarConnection'
			edges: Array<{
				__typename?: 'MetarEdge'
				node: {
					__typename?: 'Metar'
					observationTime: any
					importTime: any
					nextImportTimePrediction?: any | null
					rawText: string
					temperature?: number | null
					dewpoint?: number | null
					altimeter?: number | null
					visibility?: number | null
					visibilityIsMoreThan: boolean
					windDirection?: number | null
					windDirectionVariable: boolean
					windSpeed?: number | null
					windGust?: number | null
					flightCategory?: MetarFlightCategory | null
					presentWeather?: string | null
					skyConditions?: Array<{
						__typename?: 'SkyCondition'
						skyCover: SkyConditionSkyCover
						cloudType?: SkyConditionCloudType | null
						cloudBase?: number | null
					}> | null
				}
			}>
		}
		tafs: {
			__typename?: 'TafConnection'
			edges: Array<{
				__typename?: 'TafEdge'
				node: {
					__typename?: 'Taf'
					issueTime: any
					rawText: string
					remarks: string
					validFromTime: any
					validToTime: any
					forecast?: Array<{
						__typename?: 'Forecast'
						fromTime: any
						toTime: any
						changeIndicator?: ForecastChangeIndicator | null
						changeTime?: any | null
						changeProbability?: number | null
						windDirection?: number | null
						windShearDirection?: number | null
						weather?: string | null
						altimeter?: number | null
						windSpeed?: number | null
						windGust?: number | null
						visibilityHorizontal?: number | null
						visibilityHorizontalIsMoreThan: boolean
						visibilityVertical?: number | null
						windShearHeight?: number | null
						windShearSpeed?: number | null
						windDirectionVariable: boolean
						skyConditions?: Array<{
							__typename?: 'SkyCondition'
							skyCover: SkyConditionSkyCover
							cloudType?: SkyConditionCloudType | null
							cloudBase?: number | null
						}> | null
						turbulenceConditions?: Array<{
							__typename?: 'TurbulenceCondition'
							intensity: string
							minAltitude?: number | null
							maxAltitude?: number | null
						}> | null
						icingConditions?: Array<{
							__typename?: 'IcingCondition'
							intensity: string
							minAltitude?: number | null
							maxAltitude?: number | null
						}> | null
						temperatureData?: Array<{
							__typename?: 'TemperatureData'
							validTime: any
							temperature: number
							minTemperature?: number | null
							maxTemperature?: number | null
						}> | null
					}> | null
				}
			}>
		}
	} | null
	stationsVicinity: Array<{
		__typename?: 'StationWithDistance'
		distance: number
		station: {
			__typename?: 'WeatherStation'
			airport?: {
				__typename?: 'Airport'
				identifier: string
				name: string
				type: AirportType
				icaoCode?: string | null
				iataCode?: string | null
				gpsCode?: string | null
				latitude: number
				longitude: number
			} | null
			metars: {
				__typename?: 'MetarConnection'
				edges: Array<{
					__typename?: 'MetarEdge'
					node: { __typename?: 'Metar'; flightCategory?: MetarFlightCategory | null }
				}>
			}
		}
	}>
}

export type GetSingleAirportQueryVariables = Exact<{
	identifier: Scalars['String']['input']
}>

export type GetSingleAirportQuery = {
	__typename?: 'Query'
	status: { __typename?: 'Status'; lastWeatherSync: any }
	getAirport?: {
		__typename?: 'Airport'
		identifier: string
		icaoCode?: string | null
		iataCode?: string | null
		gpsCode?: string | null
		name: string
		timezone?: string | null
		elevation?: number | null
		website?: string | null
		wikipedia?: string | null
		latitude: number
		longitude: number
		type: AirportType
		municipality?: string | null
		runways: Array<{
			__typename?: 'Runway'
			closed: boolean
			surface?: string | null
			width?: number | null
			length?: number | null
			lowRunwayHeading?: number | null
			lowRunwayIdentifier: string
			lowRunwayLatitude?: number | null
			lowRunwayLongitude?: number | null
			highRunwayHeading?: number | null
			highRunwayIdentifier: string
			highRunwayLatitude?: number | null
			highRunwayLongitude?: number | null
		}>
		country?: { __typename?: 'Country'; name: string } | null
		station?: {
			__typename?: 'WeatherStation'
			metars: {
				__typename?: 'MetarConnection'
				edges: Array<{
					__typename?: 'MetarEdge'
					node: {
						__typename?: 'Metar'
						observationTime: any
						importTime: any
						nextImportTimePrediction?: any | null
						rawText: string
						temperature?: number | null
						dewpoint?: number | null
						altimeter?: number | null
						visibility?: number | null
						visibilityIsMoreThan: boolean
						windDirection?: number | null
						windDirectionVariable: boolean
						windSpeed?: number | null
						windGust?: number | null
						flightCategory?: MetarFlightCategory | null
						presentWeather?: string | null
						skyConditions?: Array<{
							__typename?: 'SkyCondition'
							skyCover: SkyConditionSkyCover
							cloudType?: SkyConditionCloudType | null
							cloudBase?: number | null
						}> | null
					}
				}>
			}
			tafs: {
				__typename?: 'TafConnection'
				edges: Array<{
					__typename?: 'TafEdge'
					node: {
						__typename?: 'Taf'
						issueTime: any
						rawText: string
						remarks: string
						validFromTime: any
						validToTime: any
						forecast?: Array<{
							__typename?: 'Forecast'
							fromTime: any
							toTime: any
							changeIndicator?: ForecastChangeIndicator | null
							changeTime?: any | null
							changeProbability?: number | null
							windDirection?: number | null
							windShearDirection?: number | null
							weather?: string | null
							altimeter?: number | null
							windSpeed?: number | null
							windGust?: number | null
							visibilityHorizontal?: number | null
							visibilityHorizontalIsMoreThan: boolean
							visibilityVertical?: number | null
							windShearHeight?: number | null
							windShearSpeed?: number | null
							windDirectionVariable: boolean
							skyConditions?: Array<{
								__typename?: 'SkyCondition'
								skyCover: SkyConditionSkyCover
								cloudType?: SkyConditionCloudType | null
								cloudBase?: number | null
							}> | null
							turbulenceConditions?: Array<{
								__typename?: 'TurbulenceCondition'
								intensity: string
								minAltitude?: number | null
								maxAltitude?: number | null
							}> | null
							icingConditions?: Array<{
								__typename?: 'IcingCondition'
								intensity: string
								minAltitude?: number | null
								maxAltitude?: number | null
							}> | null
							temperatureData?: Array<{
								__typename?: 'TemperatureData'
								validTime: any
								temperature: number
								minTemperature?: number | null
								maxTemperature?: number | null
							}> | null
						}> | null
					}
				}>
			}
		} | null
		stationsVicinity: Array<{
			__typename?: 'StationWithDistance'
			distance: number
			station: {
				__typename?: 'WeatherStation'
				airport?: {
					__typename?: 'Airport'
					identifier: string
					name: string
					type: AirportType
					icaoCode?: string | null
					iataCode?: string | null
					gpsCode?: string | null
					latitude: number
					longitude: number
				} | null
				metars: {
					__typename?: 'MetarConnection'
					edges: Array<{
						__typename?: 'MetarEdge'
						node: { __typename?: 'Metar'; flightCategory?: MetarFlightCategory | null }
					}>
				}
			}
		}>
	} | null
}

export type MultipleAirportFragment = {
	__typename?: 'Airport'
	identifier: string
	icaoCode?: string | null
	iataCode?: string | null
	gpsCode?: string | null
	name: string
	type: AirportType
	runways: Array<{
		__typename?: 'Runway'
		closed: boolean
		surface?: string | null
		width?: number | null
		length?: number | null
		lowRunwayHeading?: number | null
		lowRunwayIdentifier: string
		lowRunwayLatitude?: number | null
		lowRunwayLongitude?: number | null
		highRunwayHeading?: number | null
		highRunwayIdentifier: string
		highRunwayLatitude?: number | null
		highRunwayLongitude?: number | null
	}>
	station?: {
		__typename?: 'WeatherStation'
		metars: {
			__typename?: 'MetarConnection'
			edges: Array<{
				__typename?: 'MetarEdge'
				node: {
					__typename?: 'Metar'
					observationTime: any
					windDirection?: number | null
					windSpeed?: number | null
					windGust?: number | null
					rawText: string
					windDirectionVariable: boolean
					flightCategory?: MetarFlightCategory | null
				}
			}>
		}
	} | null
}

export type MultipleAirportsByIdsQueryVariables = Exact<{
	identifiers: Array<Scalars['String']['input']> | Scalars['String']['input']
}>

export type MultipleAirportsByIdsQuery = {
	__typename?: 'Query'
	status: { __typename?: 'Status'; lastWeatherSync: any }
	getAirportsByIds: Array<{
		__typename?: 'Airport'
		identifier: string
		icaoCode?: string | null
		iataCode?: string | null
		gpsCode?: string | null
		name: string
		type: AirportType
		runways: Array<{
			__typename?: 'Runway'
			closed: boolean
			surface?: string | null
			width?: number | null
			length?: number | null
			lowRunwayHeading?: number | null
			lowRunwayIdentifier: string
			lowRunwayLatitude?: number | null
			lowRunwayLongitude?: number | null
			highRunwayHeading?: number | null
			highRunwayIdentifier: string
			highRunwayLatitude?: number | null
			highRunwayLongitude?: number | null
		}>
		station?: {
			__typename?: 'WeatherStation'
			metars: {
				__typename?: 'MetarConnection'
				edges: Array<{
					__typename?: 'MetarEdge'
					node: {
						__typename?: 'Metar'
						observationTime: any
						windDirection?: number | null
						windSpeed?: number | null
						windGust?: number | null
						rawText: string
						windDirectionVariable: boolean
						flightCategory?: MetarFlightCategory | null
					}
				}>
			}
		} | null
	}>
}

export interface PossibleTypesResultData {
	possibleTypes: {
		[key: string]: string[]
	}
}
const result: PossibleTypesResultData = {
	possibleTypes: {},
}
export default result
