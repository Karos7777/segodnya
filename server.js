const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    estimated_time INTEGER,
    status TEXT DEFAULT 'pending',
    start_time DATETIME,
    end_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

// API Routes
app.get('/api/tasks/today', (req, res) => {
  db.all('SELECT * FROM tasks WHERE date(created_at) = date("now")', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/tasks/completed', (req, res) => {
  db.all('SELECT * FROM tasks WHERE status = "completed"', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/tasks/given-up', (req, res) => {
  db.all('SELECT * FROM tasks WHERE status = "given_up"', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, estimated_time } = req.body;
  db.run('INSERT INTO tasks (title, estimated_time) VALUES (?, ?)', 
    [title, estimated_time], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
});

app.put('/api/tasks/:id/start', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE tasks SET start_time = CURRENT_TIMESTAMP WHERE id = ?', 
    [id], 
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
});

app.put('/api/tasks/:id/complete', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE tasks SET status = "completed", end_time = CURRENT_TIMESTAMP WHERE id = ?', 
    [id], 
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
});

app.put('/api/tasks/:id/give-up', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE tasks SET status = "given_up", end_time = CURRENT_TIMESTAMP WHERE id = ?', 
    [id], 
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 