## Pana Lisa Website

Landing page for Pana Lisa social media services.

## Shared reviews system

This project now includes a small Express + SQLite backend so testimonials are shared across all visitors.

### Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000`.

Reviews are stored in `data/reviews.db` and served through:
- `GET /api/reviews`
- `POST /api/reviews`
