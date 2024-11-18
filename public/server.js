const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Connexion à la base de données
const db = new sqlite3.Database('./movies.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the movies database.');
});

// Création de la table movies si elle n'existe pas
db.run(`CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  releaseYear INTEGER,
  thumbnailUrl TEXT,
  videoUrl TEXT
)`);

// Route pour obtenir tous les films
app.get('/movies', (req, res) => {
  db.all("SELECT * FROM movies", [], (err, rows) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    res.json({
      "message":"success",
      "data":rows
    });
  });
});

// Route pour ajouter un nouveau film
app.post('/movies', (req, res) => {
  const { title, duration, description, genre, releaseYear, thumbnailUrl, videoUrl } = req.body;
  db.run(`INSERT INTO movies (title, duration, description, genre, releaseYear, thumbnailUrl, videoUrl) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          [title, duration, description, genre, releaseYear, thumbnailUrl, videoUrl], 
          function(err) {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.json({
      "message": "success",
      "data": { id: this.lastID },
      "id" : this.lastID
    });
  });
});

// Route pour supprimer un film
app.delete('/movies/:id', (req, res) => {
  db.run(`DELETE FROM movies WHERE id = ?`, req.params.id, function(err) {
    if (err) {
      res.status(400).json({"error": err.message});
      return;
    }
    res.json({"message":"deleted", changes: this.changes});
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});