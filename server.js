const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.REVIEWS_DB_PATH || path.join(__dirname, 'data', 'reviews.db');

const app = express();
app.use(express.json({ limit: '16kb' }));
app.use(express.static(__dirname));

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      timestamp TEXT NOT NULL
    )`
  );
});

const normalizeReview = (review) => {
  if (!review || typeof review !== 'object') return null;

  const name = String(review.name || '').trim();
  const text = String(review.text || '').trim();
  const rating = Math.round(Number(review.rating || 0));

  if (!name || !text || rating < 1 || rating > 5) {
    return null;
  }

  return {
    name,
    text,
    rating
  };
};

app.get('/api/reviews', (_req, res) => {
  db.all(
    'SELECT id, name, text, rating, timestamp FROM reviews ORDER BY datetime(timestamp) DESC, id DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to load reviews.' });
      }

      return res.json({ reviews: rows });
    }
  );
});

app.post('/api/reviews', (req, res) => {
  const review = normalizeReview(req.body);
  if (!review) {
    return res.status(400).json({ error: 'Invalid review payload.' });
  }

  const timestamp = new Date().toISOString();
  db.run(
    'INSERT INTO reviews (name, text, rating, timestamp) VALUES (?, ?, ?, ?)',
    [review.name, review.text, review.rating, timestamp],
    function insertCallback(err) {
      if (err) {
        return res.status(500).json({ error: 'Unable to save review.' });
      }

      return res.status(201).json({
        review: {
          id: this.lastID,
          ...review,
          timestamp
        }
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
