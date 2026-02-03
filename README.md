# OpenMarket API

REST API for the OpenMarket marketplace frontend. MongoDB backend. No payment endpoints.

- **Base URL:** `/api`
- **Version:** 1.0.0

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Set `MONGODB_URI` (e.g. `mongodb://localhost:27017/openmarket`)
   - Set `JWT_SECRET` (use a long random string in production)
   - Optionally set `PORT` (default `3000`), `CORS_ORIGIN` (e.g. `http://localhost:5173`), `BASE_URL` (for upload URLs, default `http://localhost:PORT`), and `UPLOAD_DIR` (default `./uploads`)

3. **Run**
   ```bash
   npm start
   ```
   Or with auto-reload:
   ```bash
   npm run dev
   ```

## Auth

- **Login:** `POST /api/auth/login` — body: `{ "email", "password" }` → `{ user, token }`
- **Register:** `POST /api/auth/register` — body: email, password, registrationType (quick|full|company), plus optional user fields
- **Me:** `GET /api/auth/me` — header: `Authorization: Bearer <token>`

Frontend can store the token in `localStorage` (e.g. `openmarket_token`) and send `Authorization: Bearer <token>` on protected requests.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/register` | No | Register |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/users/:id` | Optional | User by ID |
| GET | `/api/users/username/:username` | Optional | User by username |
| PATCH | `/api/users/:id` | Yes | Update own profile |
| PATCH | `/api/users/:id/password` | Yes | Change password |
| GET | `/api/listings` | No | List (query: search, category, sort, limit, offset) |
| GET | `/api/listings/featured` | No | Featured (query: limit) |
| GET | `/api/listings/:id` | No | Single listing |
| GET | `/api/listings/seller/:sellerId` | No | Listings by seller |
| POST | `/api/listings` | Yes | Create listing |
| PATCH | `/api/listings/:id` | Yes | Update listing (owner only) |
| DELETE | `/api/listings/:id` | Yes | Delete listing (owner only) |
| POST | `/api/upload` | Yes | Upload images (multipart form field `images`); returns `{ urls }` |
| GET | `/api/ratings/seller/:userId` | No | Ratings for seller |
| GET | `/api/ratings/product/:productId` | No | Ratings for product |
| GET | `/api/ratings/average/seller/:userId` | No | Average seller rating |
| GET | `/api/ratings/check/seller` | No | Query: fromUserId, toUserId |
| GET | `/api/ratings/check/product` | No | Query: fromUserId, productId |
| POST | `/api/ratings` | Yes | Create seller or product rating |

## Categories

`Electronics`, `Fashion`, `Furniture`, `Sports`, `Entertainment`, `Books`

## Notes

- IDs are MongoDB ObjectIds returned as strings in JSON.
- User responses never include `passwordHash`.
- **Image upload:** `POST /api/upload` accepts `multipart/form-data` with field `images` (multiple files). Allowed types: JPEG, PNG, WebP, GIF. Max 10MB per file, up to 10 files. Returns `{ urls: string[] }`. Files are stored in `UPLOAD_DIR` and served at `/uploads/:filename`. Listing creation accepts an `images` array of URLs (from this endpoint or base64 data URLs).
