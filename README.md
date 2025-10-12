<h1 align="center">metar.live </h1>
<p align="center">🛫☀️🌦</p>
<p align="center">Latest worldwide aviation weather</p>

## What is this?

metar.live <i>(previously known as metar.gg)</i> is an app that fetches latest METAR and TAF data from [NOAA](https://www.aviationweather.gov) and presents it in an intuitive way.

The accompanying Go GraphQL API can be found [here](https://github.com/benjasper/metar.live-backend).

### Features
* ⚡ Latest, up to date METARs and TAFs
* 🕑 Next METAR publishing time prediction
* 🔄 Automatic polling for weather updates
* 🧭 Runway wind renderer
* 💨 Calculates preferred runway including Headwind, tailwind and crosswind components
* 🔄 Unit conversion for every value
* 🌑 Dark mode
* 🛬 Nearest Airports

## Development 💻

### Tech
* SolidJS
* Typescript
* Tailwind

### Prerequisites

- PNPM

### Setup

1. Clone the repository
2. Run `pnpm install` to download the dependencies
3. Run `pnpm start` to start the dev server
4. The app is now available on port 3000

If you changed a GraphQL query, run `pnpm generate` to regenerate the Typescript types.

### Pull Requests
PRs are welcome!

## License 📝
[MIT](LICENSE)
