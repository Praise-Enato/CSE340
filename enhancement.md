# Wishlist Enhancement Overview

## Feature Summary

- Added a full “Wishlist” experience so authenticated clients can bookmark vehicles for quick access later.
- Supports create/read/delete flows via new model, controller, routes, and EJS views.
- Integrates tightly with existing navigation, inventory detail pages, and account management.

## Database Changes

- Defined a `public.wishlist` table (see `database/db-sql-code.sql`) with foreign keys to `account` and `inventory`, a `created_at` timestamp, and a unique constraint to prevent duplicate saves.
- **Deployment note:** run the new `CREATE TABLE public.wishlist …` statement on your database before starting the server.

## Backend Additions

- `models/wishlist-model.js` encapsulates wishlist persistence with prepared statements (add, remove, list, and lookup helpers).
- `controllers/wishlistController.js` handles list/add/remove actions, coordinates flash messages, and reuses a shared renderer for vehicle detail fallbacks.
- `routes/wishlistRoute.js` wires the wishlist endpoints (`GET /wishlist`, `POST /wishlist/add`, `POST /wishlist/remove`) and protects them with `checkLogin`.
- `utilities/wishlist-validation.js` supplies express-validator rules plus graceful error responses that re-render the originating page with feedback.

## Frontend & UX Updates

- New view `views/account/wishlist.ejs` lists saved vehicles with imagery, pricing, added-on dates, and “View / Remove” controls.
- `views/inventory/detail.ejs` now shows messages, validation errors, and contextual “Add/Remove from Wishlist” buttons for logged-in users (with guest prompt for others).
- Header and account dashboard expose quick navigation to the wishlist.
- Client-side validation provided via `public/js/wishlist.js`, which guards wishlist forms before submission and surfaces inline error hints.
- `views/partials/head.ejs` now supports per-page script injection; detail and wishlist pages load the new wishlist script.

## Error Handling & Validation

- Server-side validation rejects missing/invalid vehicle data and returns users to the correct view with error details.
- Controller logic verifies vehicle existence, handles duplicate saves/removals, and presents user-friendly flash messages.
- Client-side script complements server rules by checking the form data before submission.

## How to Use

1. Ensure you are logged in (register if needed).
2. Browse to any vehicle detail page and click **Add to Wishlist**.
3. Access **Wishlist** from the header or account management page to review saved vehicles.
4. Use **Remove** to drop an item; changes reflect immediately with confirmation messages.

## Testing Suggestions

- Attempt to add the same vehicle twice; the second attempt reports that it is already saved.
- Delete a vehicle from the wishlist, then re-add it from the detail page to confirm both flows.
- Submit the wishlist forms without a vehicle id using dev tools—validation should block the request and display an error.


Wishlist Feature

Added wishlist data layer and controller to persist saved vehicles, deliver list/add/remove flows, and wire routes (models/wishlist-model.js:1, controllers/wishlistController.js:1, routes/wishlistRoute.js:1, server.js:14).
Documented schema change for public.wishlist with foreign keys and unique constraint—run this SQL before using the feature (database/db-sql-code.sql:55).
Enhanced vehicle detail rendering to show wishlist actions, track saved state, and load page scripts; exposed quick navigation links in header and account management (controllers/invController.js:1, views/inventory/detail.ejs:1, views/partials/head.ejs:11, views/partials/header.ejs:10, views/account/management.ejs:20).
Built wishlist dashboard view and client-side guard script for form validation (views/account/wishlist.ejs:1, public/js/wishlist.js:1).
Implemented express-validator pipeline with graceful fallbacks for invalid submissions (utilities/wishlist-validation.js:1).
Recorded deployment notes and usage guidance for graders in the new root doc (enhancement.md:1).
Verification

Tests: not run (no automated suite provided).
Manual Checks

Apply the public.wishlist table SQL from database/db-sql-code.sql, then restart pnpm run dev.
Log in, open any vehicle detail page, add/remove it from the wishlist, and confirm flash notices plus button toggling.
Visit /wishlist, verify saved items render with details, and remove one from both the dashboard and a detail page.
Attempt an invalid submission (e.g., blank inv_id via dev tools) to see validation errors returned in-place.