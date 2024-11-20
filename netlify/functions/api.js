const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join('/tmp', 'movies.json');

async function readMovies() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Le fichier n'existe pas encore, retourner un tableau vide
      return [];
    }
    throw error;
  }
}

async function writeMovies(movies) {
  await fs.writeFile(DATA_FILE, JSON.stringify(movies, null, 2));
}

app.get('/.netlify/functions/api/movies', async (req, res) => {
  console.log('GET /movies appelé');
  try {
    const movies = await readMovies();
    res.json(movies);
  } catch (error) {
    console.error('Error reading movies:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.post('/.netlify/functions/api/movies', async (req, res) => {
  console.log('POST /movies appelé');
  try {
    const newMovie = req.body;
    newMovie.id = Date.now();
    let movies = await readMovies();
    movies.push(newMovie);
    await writeMovies(movies);
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.delete('/.netlify/functions/api/movies/:id', async (req, res) => {
  console.log('DELETE /movies/:id appelé');
  try {
    const id = parseInt(req.params.id);
    let movies = await readMovies();
    movies = movies.filter(movie => movie.id !== id);
    await writeMovies(movies);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports.handler = serverless(app);
