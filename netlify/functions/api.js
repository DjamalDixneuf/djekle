const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join('/tmp', 'movies.json');

// Fonction pour lire les films depuis le fichier
function readMovies() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading movies:', error);
  }
  return [];
}

// Fonction pour écrire les films dans le fichier
function writeMovies(movies) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(movies, null, 2));
  } catch (error) {
    console.error('Error writing movies:', error);
  }
}

app.get('/.netlify/functions/api/movies', (req, res) => {
  console.log('GET /movies appelé');
  const movies = readMovies();
  res.json(movies);
});

app.post('/.netlify/functions/api/movies', (req, res) => {
  console.log('POST /movies appelé');
  const newMovie = req.body;
  newMovie.id = Date.now();
  const movies = readMovies();
  movies.push(newMovie);
  writeMovies(movies);
  res.status(201).json(newMovie);
});

app.delete('/.netlify/functions/api/movies/:id', (req, res) => {
  console.log('DELETE /movies/:id appelé');
  const id = parseInt(req.params.id);
  let movies = readMovies();
  movies = movies.filter(movie => movie.id !== id);
  writeMovies(movies);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports.handler = serverless(app);
