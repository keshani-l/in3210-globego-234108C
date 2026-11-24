# in3210-globego-234108C
React Native country discovery app with offline-first functionality for IN3210 Assignment 2.

## GlobeGo

**Explore the World, Anywhere**

IN3210 Mobile Applications Development, University of Moratuwa. Index number 234108C.

Phase 3 adds live country discovery and country details to the authentication and navigation from Phase 2. Favourites is a preview for Phase 4.

## Run locally

Use Node.js 22 (22.13 or later) or Node.js 24 (24.3 or later) with npm. Node.js 26.13.1 was also used to verify Phase 2. Run the following commands from the project folder. [Expo SDK 58 requirements](https://docs.expo.dev/versions/v58.0.0/)

```sh
npm ci
npm run web
```

For a phone, run `npm start` and open the project with an Expo Go version that supports Expo SDK 58. For a configured emulator, use `npm run android`. On macOS with the iOS Simulator, use `npm run ios`. In Windows PowerShell, use `npm.cmd` if the shell blocks `npm.ps1`.

## Demo sign-in

| Field | Value |
| --- | --- |
| Username | `emilys` |
| Password | `emilyspass` |

The login form calls DummyJSON's `POST /auth/login`. Registration calls `POST /users/add` and returns you to Login with a confirmation. DummyJSON simulates the registration response without saving an account. Use an existing demo account to sign in and enter only sample information in the registration form. [DummyJSON authentication](https://dummyjson.com/docs/auth) · [DummyJSON user registration](https://dummyjson.com/docs/users#users-add)

## App architecture

- **Interface.** Expo SDK 58, React Native and TypeScript power the app. Feather supplies the icons, and the shared theme keeps colours, spacing and typography consistent. Zod checks required fields, registration email and matching passwords before submission.
- **Requests and state.** RTK Query handles the two DummyJSON requests. Redux Toolkit stores the authentication status, user profile and expiry time. Passwords stay in the form and request code. Signing out also clears the authentication API cache.
- **Session storage.** Android and iOS use Expo SecureStore for the access token and profile. An unexpired saved session restores locally, so startup can work offline. Expired or malformed saved sessions are discarded, and users sign in again when the token expires. Restoration uses the saved JWT expiry and the device clock. Server-side revocation checks require an online request. On web, the session lives in memory and a page refresh or close signs the user out. [Expo SecureStore](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/)
- **Navigation.** React Navigation shows Login and Registration while signed out. Signing in opens the Home, Favourites and Profile tabs. Home opens Details with a typed country ID. Profile shows the signed-in user's information and provides the sign-out button. The entry point is `index.ts`, which registers `App.tsx` and its React Navigation container. Expo CLI may print a router-directory message when it sees `src/app`.
- **Countries.** `src/features/countries` contains the screens, response parsers, local filters, and a separate `countriesApi` RTK Query slice. Redux registers that slice alongside `authApi`. The list has one in-memory cache entry, while Details has an entry per country code. The parsers validate the response shape and convert fields into TypeScript models before the screens use them.

## Country discovery and API

Home downloads the country list and uses a virtualized list to show flags, names, capitals, regions, and population. Search matches country names and capitals without a new request. The region filter applies to the same results, and Clear filters resets both controls. Use pull-to-refresh on mobile or the Refresh button to request the latest available list.

Open any country card to load its Details by three-letter code. Details shows the flag, official name, geography, population, area, languages, currencies, time zones, and independence status where available.

The app uses Countrydrop, a public mirror of the legacy REST Countries v3.1 dataset. The official hosted v3.1 service has been retired, and the official v5 service requires a key. The mirror uses a February 2026 snapshot, so figures can differ from current estimates. Country requests and remote flag images require a connection. [Countrydrop API reference](https://plainworkdigital.com/d20261017a29/api-reference) · [REST Countries API versions](https://restcountries.com/docs/countries/api-versions)

| Request | Purpose |
| --- | --- |
| `GET /v3.1/all?fields=cca3,name,capital,region,flags,population` | Download the six fields used for discovery |
| `GET /v3.1/alpha/{cca3}?fields=cca3,name,capital,region,flags,population,subregion,area,languages,currencies,timezones,independent` | Load one country's details, for example `LKA` |

## Checks

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
```

The Jest tests cover authentication validation, mocked SecureStore behaviour, country response transformation, search, filtering, and number formatting. To try country discovery, sign in as `emilys`, search for `Kotte`, choose Asia, and open Sri Lanka. To check a real mobile restart, sign in online, close the app, turn on airplane mode and reopen it before the token expires. Confirm that the Home screen opens, then sign out from Profile and reopen the app to confirm it starts on Login.
