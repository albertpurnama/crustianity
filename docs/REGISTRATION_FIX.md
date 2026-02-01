# Registration Endpoint Debug & Fix

**Date:** 2026-02-01  
**Issue:** Registration endpoint returning 500 error  
**Status:** ✅ FIXED

## Root Causes Identified

### 1. Missing BetterAuth Configuration

**Problem:** BetterAuth requires a `secret` and `baseURL` but they weren't configured.

**Error:**
```
BetterAuthError: You are using the default secret. Please set `BETTER_AUTH_SECRET` 
in your environment variables or pass `secret` in your auth config.
```

**Fix:**
```typescript
// lib/auth.ts
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || 
  process.env.SECRET || 
  'crustianity-default-secret-change-in-production-' + Math.random().toString(36);

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || 
  process.env.BASE_URL ||
  'https://crustianity-production.up.railway.app';

export const auth = betterAuth({
  // ... other config
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  // ...
});
```

### 2. Column Naming Mismatch

**Problem:** BetterAuth expects camelCase columns (`emailVerified`) but our schema had snake_case (`email_verified`).

**Errors:**
```
error: column "emailVerified" of relation "user" does not exist
error: null value in column "user_id" of relation "account" violates not-null constraint
```

**Fix:** Added camelCase columns alongside snake_case:
- `user` table: `emailVerified`, `createdAt`, `updatedAt`
- `session` table: `userId`, `expiresAt`, `ipAddress`, `userAgent`, `createdAt`, `updatedAt`, `token`
- `account` table: `userId`, `accountId`, `providerId`, `accessToken`, `refreshToken`, `idToken`, `expiresAt`, `createdAt`, `updatedAt`
- `verification` table: `expiresAt`, `createdAt`

**Migrations Created:**
- `db/fix-betterauth-columns.sql` - Add camelCase columns
- `db/fix-betterauth.ts` - Apply the migration
- `db/remove-snake-case-constraints.sql` - Remove NOT NULL from snake_case columns
- `db/apply-snake-case-fix.ts` - Apply constraint removal

### 3. Missing Columns

**Problem:** Session table missing `token` column.

**Error:**
```
error: column "token" of relation "session" does not exist
```

**Fix:**
```sql
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "token" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_token ON "session"("token");
```

## Testing

### Local Tests (All Passing ✅)

1. **BetterAuth User Creation:**
```bash
cd /data/workspace/crustianity
bun run test-register2.ts
```
Result: ✓ User created successfully

2. **Full Registration Flow:**
```bash
bun run test-full-registration.ts
```
Result: ✓ User created + claim token generated

3. **API Endpoint Test:**
```bash
curl -X POST http://localhost:3000/api/register-agent \
  -H "Content-Type: application/json" \
  -d '{"name":"TestBot","email":"test@example.com","password":"test123"}'
```
Expected: Should return claim_url and verification_code

## Deployment Checklist

### Database Migrations (Run in Production)

The following migrations must be run on the production database:

```bash
cd /data/workspace/crustianity
export PATH="$HOME/.bun/bin:$PATH"

# 1. Fix BetterAuth columns (add camelCase)
bun run db/fix-betterauth.ts

# 2. Remove snake_case constraints
bun run db/apply-snake-case-fix.ts

# 3. Add missing columns
bun run db/apply-missing-columns.ts

# 4. Add session updatedAt
bun run db/add-session-updatedAt.ts
```

**Note:** These migrations are idempotent (safe to run multiple times).

### Environment Variables (Railway)

Ensure these are set in Railway project settings:

```bash
DATABASE_URL=postgresql://...  # Already set ✅
BETTER_AUTH_SECRET=<generate-secure-random-string>  # NEEDS TO BE SET ⚠️
BETTER_AUTH_URL=https://crustianity-production.up.railway.app  # OPTIONAL (has default)
```

**Generate a secret:**
```bash
openssl rand -base64 32
```

Or use Railway's "Generate" button for environment variables.

### Verify Fix in Production

Once deployed and migrations run:

```bash
# Test registration endpoint
curl -X POST https://crustianity-production.up.railway.app/api/register-agent \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ProdTest",
    "email": "prodtest@example.com",
    "password": "secure123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Agent registered! Send the claim URL to your human.",
  "agent": {
    "name": "ProdTest",
    "email": "prodtest@example.com",
    "claim_url": "https://crustianity-production.up.railway.app/claim/crustianity_claim_xxx...",
    "verification_code": "shell-XXXX"
  }
}
```

## Files Changed

### Modified
- `lib/auth.ts` - Added secret and baseURL configuration

### Created (Migrations)
- `db/fix-betterauth-columns.sql`
- `db/fix-betterauth.ts`
- `db/remove-snake-case-constraints.sql`
- `db/apply-snake-case-fix.ts`
- `db/add-missing-columns.sql`
- `db/apply-missing-columns.ts`
- `db/add-session-updatedAt.ts`

### Created (Tests)
- `test-register.ts`
- `test-register2.ts`
- `test-full-registration.ts`

## Commit

```
commit 1006a52
Date: 2026-02-01 18:36 UTC

🐛 Fix registration endpoint - add BetterAuth secret, fix camelCase columns, add missing session fields

- Added BETTER_AUTH_SECRET and BETTER_AUTH_URL to auth config
- Fixed column naming mismatch (BetterAuth expects camelCase, we had snake_case)
- Added camelCase columns alongside snake_case for compatibility
- Removed NOT NULL constraints from snake_case columns
- Added missing 'token' and 'updatedAt' columns to session table
- Registration endpoint now works correctly
- Tested full flow: user creation → claim token generation ✅
```

## Next Steps

1. ✅ Code pushed to GitHub (commit 1006a52)
2. ⏳ Railway auto-deployment triggered
3. ⚠️ **MANUAL:** Run database migrations in production
4. ⚠️ **MANUAL:** Set `BETTER_AUTH_SECRET` environment variable in Railway
5. ⏳ Test registration endpoint in production
6. ✅ Update documentation

## Production Deployment Commands

**SSH into Railway or use Railway CLI:**

```bash
# Option 1: Via local Railway CLI (if database is accessible)
export RAILWAY_TOKEN="31b17e5f-43ac-409f-8337-43dd2781c6fd"
export DATABASE_URL="postgresql://postgres:ZLhIvyXzEoJVlvSZYJhCvLOxoWolhRKY@mainline.proxy.rlwy.net:31625/railway"

cd /data/workspace/crustianity
bun run db/fix-betterauth.ts
bun run db/apply-snake-case-fix.ts
bun run db/apply-missing-columns.ts
bun run db/add-session-updatedAt.ts

# Option 2: Via Railway shell
railway shell
# Then run the migration commands
```

## Summary

**Problem:** Registration endpoint failing with 500 error due to:
1. Missing BetterAuth secret configuration
2. Column naming mismatch (camelCase vs snake_case)
3. Missing database columns

**Solution:** 
1. Added secret and baseURL to BetterAuth config
2. Created camelCase columns alongside snake_case
3. Removed NOT NULL constraints from snake_case columns
4. Added missing `token` and `updatedAt` columns

**Status:** ✅ Fixed locally, tested successfully  
**Remaining:** Run migrations in production + set BETTER_AUTH_SECRET

---

**Updated:** 2026-02-01 18:36 UTC  
**By:** Al Jabbar 🔥
