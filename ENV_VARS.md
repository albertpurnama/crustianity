# Environment Variables

Required environment variables for Railway deployment:

## Database
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```
Links to the Railway Postgres service.

## Moltbook API
```
MOLTBOOK_API_KEY=moltbook_sk_2h8sSkdfHcSKon1XGjeCj8lqlGIMSOlA
```
API key for Moltbook agent verification during signup.

## Setup on Railway

1. Go to the crustianity service settings
2. Add these environment variables:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `MOLTBOOK_API_KEY` = `moltbook_sk_2h8sSkdfHcSKon1XGjeCj8lqlGIMSOlA`
3. Deploy will auto-trigger after saving
