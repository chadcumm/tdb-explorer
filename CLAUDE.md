# TDB Explorer

## Project Overview
Angular 16 app for exploring and searching TDB (Transaction Database) request data. Deployed to `tdb-explorer.cernertools.com` via SST v4 (S3 + CloudFront).

## Tech Stack
- **Framework:** Angular 16 (standalone components)
- **Language:** TypeScript 5.1
- **Deployment:** SST v4 (S3 + CloudFront)
- **Auth:** Shared Cognito pool via cernertools.com SSO cookies

## Commands
- `npm start` — dev server (ng serve)
- `npm run build` — production build
- `npm test` — run unit tests

## Architecture
- **Components** (`src/app/components/`) — header, request-list, request-detail, category-view, script-list
- **Services** (`src/app/services/`) — tdb-data.service.ts (data loading + search)
- **Models** (`src/app/models/`) — tdb-request.model.ts
- **Pipes** (`src/app/pipes/`) — highlight.pipe.ts (search term highlighting)
- **Data** (`src/assets/data/`) — tdb-requests.json (static dataset)

## Key Patterns
- All components are `standalone: true`
- CSS custom properties for theming (--canvas, --border, --accent, etc.)
- Static JSON data loaded via HttpClient

## CernerTools Integration
- Part of the cernertools.com ecosystem
- Cognito User Pool ID: `us-east-1_aDNcmvxfv`
- SSO cookies: `ct_id_token`, `ct_refresh_token`, `ct_user_email` (scoped to `.cernertools.com`)
- Cognito Client ID: Set after deploying cernertools repo (creates TdbExplorerClient)

## Related Apps
- **Landing Page** — `cernertools.com` (Angular 19, SST/CloudFront)
- **MTA Analyzer** — `mta.cernertools.com` (Angular 19, SST/CloudFront)
- **IF Generator** — `if-generator.cernertools.com` (React/Express, App Runner)
