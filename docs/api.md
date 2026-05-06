# API Reference

Base URL: `/api/v1`

All protected endpoints require `Authorization: Bearer <token>` header.

---

## Auth

### POST /auth/register
Create a new user account.

**Auth required:** No

**Request body:**
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Response `201`:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true,
  "searches_used": 0,
  "search_limit": 5,
  "created_at": "2026-05-01T12:00:00Z"
}
```

**Errors:** `400` email already registered.

---

### POST /auth/login
Authenticate and receive a JWT token.

**Auth required:** No

**Request body:**
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Response `200`:**
```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

**Errors:** `401` invalid credentials.

---

### GET /auth/me
Return the currently authenticated user.

**Auth required:** Yes

**Response `200`:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true,
  "searches_used": 2,
  "search_limit": 5,
  "created_at": "2026-05-01T12:00:00Z"
}
```

---

## Keywords

### POST /keywords/generate
Generate YouTube search keywords from a niche description using Gemini AI.

**Auth required:** Yes

**Request body:**
```json
{ "niche": "personal finance for Gen Z", "language": "en" }
```

**Response `200`:**
```json
{ "keywords": ["gen z budgeting", "money tips college", "..."], "niche": "personal finance for Gen Z" }
```

**Errors:** `502` Gemini API unavailable. `429` AI rate limit exceeded.

---

## Search

### POST /search
Search YouTube for viral videos matching keywords and filters.

**Auth required:** Yes

**Request body:**
```json
{
  "niche": "personal finance for Gen Z",
  "keywords": ["gen z budgeting", "money tips college"],
  "filters": {
    "language": "en",
    "duration": "medium",
    "min_duration": 0,
    "max_duration": null,
    "min_subs": 1000,
    "max_subs": null,
    "min_views": 0,
    "max_views": null,
    "date_range": "30d"
  }
}
```

**Filter fields:**
| Field | Type | Description |
|---|---|---|
| `language` | `string \| null` | BCP-47 region code (`"en"`, `"es"`) |
| `duration` | `"short" \| "medium" \| "long" \| null` | YouTube duration category |
| `min_duration` | `number` | Minimum seconds (post-filter) |
| `max_duration` | `number \| null` | Maximum seconds, `null` = no limit |
| `min_subs` | `number` | Minimum channel subscribers |
| `max_subs` | `number \| null` | Maximum subscribers, `null` = no limit |
| `min_views` | `number` | Minimum video views |
| `max_views` | `number \| null` | Maximum views, `null` = no limit |
| `date_range` | `"7d" \| "30d" \| "90d" \| "365d" \| null` | Published within range |

**Response `200`:**
```json
{
  "results": [
    {
      "id": 1,
      "youtube_id": "dQw4w9WgXcQ",
      "title": "How Gen Z Actually Budgets",
      "channel_name": "MoneyMind",
      "channel_id": "UC...",
      "views": 850000,
      "subs": 42000,
      "outlier_score": 12.4,
      "virality_class": "ultra_viral",
      "duration_seconds": 743,
      "language": "en",
      "published_at": "2026-04-15T09:00:00Z",
      "thumbnail_url": "https://i.ytimg.com/..."
    }
  ],
  "total": 38,
  "quota_used": 201
}
```

**Errors:** `402` search quota reached. `429` YouTube API quota exceeded. `502` YouTube API error.

---

### GET /search/history
Return the authenticated user's past searches (paginated).

**Auth required:** Yes

**Query params:** `limit` (default 20), `offset` (default 0)

**Response `200`:**
```json
{
  "items": [
    {
      "id": 5,
      "niche": "personal finance for Gen Z",
      "keywords": ["gen z budgeting"],
      "filters": {},
      "quota_used": 201,
      "created_at": "2026-05-01T12:00:00Z",
      "video_count": 38
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

## Explore

### POST /explore/trending
Fetch trending YouTube videos without keywords, applying ViralScout filters.

**Auth required:** Yes

**Request body:** Same `filters` object as `/search` (no `niche` or `keywords` fields).

```json
{
  "language": "en",
  "duration": null,
  "min_duration": 0,
  "max_duration": null,
  "min_subs": 1000,
  "max_subs": null,
  "min_views": 0,
  "max_views": null,
  "date_range": "7d"
}
```

**Response `200`:** Same shape as `/search` response.

**Notes:** Iterates YouTube pages until 50 filtered results are collected (up to 200 raw videos fetched). `quota_used` reflects actual API units consumed.

---

## Admin

> All admin endpoints require the authenticated user to have `admin_email` matching the configured `ADMIN_EMAIL` env var.

### GET /admin/users
List all registered users.

**Response `200`:**
```json
[
  { "id": 1, "email": "user@example.com", "searches_used": 2, "search_limit": 5, "is_active": true, "created_at": "..." }
]
```

---

### PATCH /admin/users/{user_id}/limit
Update a user's search limit.

**Request body:** `{ "limit": 20 }`

**Response `200`:** Updated user object.

---

### POST /admin/users/{user_id}/reset
Reset a user's `searches_used` counter to 0.

**Response `200`:** Updated user object.

---

## Health

### GET /health
Service liveness check. No auth required.

**Response `200`:** `{ "status": "ok" }`
