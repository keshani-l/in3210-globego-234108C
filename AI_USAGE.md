# AI usage

## Phase 1 — 24 November 2026

For the IN3210 GlobeGo assignment (234108C), I asked OpenAI Codex to initialize the project using Expo's blank TypeScript template, preserve the existing repository and README, and keep the work to Phase 1.

Codex inspected the repository and checked Node.js, npm, and Git. It sourced the official Expo template, set up the project metadata and lint configuration, and wrote the welcome screen and shared theme tokens.

Codex ran TypeScript and ESLint, started Metro, verified the welcome screen in Chrome, and exported bundles for web, Android, and iOS. The code and configuration are ready for student review.

## Phase 2 — 24 November 2026

Codex implemented the Login and Registration screens, Zod validation, DummyJSON requests through RTK Query, and Redux session state. It added SecureStore persistence on native platforms, in-memory web sessions, typed React Navigation flows, and the Profile sign-out action. Codex also updated the README with setup instructions, public demo credentials, and the registration and session limitations.

Codex checked valid and invalid sign-in and simulated registration against the live DummyJSON API. It ran the browser walkthrough in Chrome, TypeScript, ESLint, Expo's package compatibility check, and 14 Jest tests, and exported bundles for web, Android, and iOS. The session tests used mocked native storage. SecureStore behaviour on a physical device or emulator remains unverified.

## Phase 3 — 24 November 2026

Codex checked the official REST Countries service and verified Countrydrop's public v3.1 mirror. It added the country API slice, response validation, Home search and region filters, reusable country components, and the Details screen. It also documented the mirror's snapshot and the app's React Navigation entry point.

Codex ran TypeScript, ESLint, Expo's dependency compatibility check, and 21 Jest tests. It verified the live list and Sri Lanka detail in Chrome, plus search, navigation, login, logout, refresh, and controlled loading, retry, missing-data, empty, and image-failure cases. Expo exported bundles for web, Android, and iOS. Native runtime behaviour and the native pull-to-refresh gesture remain unverified.

## Phase 4 — 26 November 2026

Codex implemented and reviewed the Redux favourites slice, user-specific AsyncStorage persistence, the Home and Details controls, and the wishlist screen. It added 10 tests covering favourites, storage recovery, account isolation, and overlapping reads and writes.

Codex ran TypeScript, ESLint, Expo's compatibility check, and all 31 Jest tests. It exported web, Android, and iOS bundles. A Chrome walkthrough used two live DummyJSON demo accounts to verify wishlist isolation, screen synchronization, the empty state, browser refresh and re-login, and saved cards with Countrydrop requests blocked. Native runtime persistence remains unverified.
