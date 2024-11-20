const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getStore } = require('@netlify/blobs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const store = getStore('movies');

app.get('/.netlify/functions/api/movies', async (req, res) => {
  console.log('GET /movies appelé');
  try {
    const movies = await store.get('all') || [];
    res.json(movies);
  } catch (error) {
    console.error('Error reading movies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/.netlify/functions/api/movies', async (req, res) => {
  console.log('POST /movies appelé');
  try {
    const newMovie = req.body;
    newMovie.id = Date.now();
    let movies = await store.get('all') || [];
    movies.push(newMovie);
    await store.set('all', movies);
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/.netlify/functions/api/movies/:id', async (req, res) => {
  console.log('DELETE /movies/:id appelé');
  try {
    const id = parseInt(req.params.id);
    let movies = await store.get('all') || [];
    movies = movies.filter(movie => movie.id !== id);
    await store.set('all', movies);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports.handler = serverless(app);
