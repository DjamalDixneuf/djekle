const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getStore } = require('@netlify/blobs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let store;

async function initializeStore() {
  try {
    store = getStore({
      name: 'movies',
      siteID: process.env.NETLIFY_BLOBS_SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    console.log('Netlify Blobs store initialized successfully');
  } catch (error) {
    console.error('Error initializing Netlify Blobs store:', error);
  }
}

app.use(async (req, res, next) => {
  if (!store) {
    await initializeStore();
  }
  next();
});

app.get('/.netlify/functions/api/movies', async (req, res) => {
  console.log('GET /movies appelé');
  try {
    if (!store) {
      throw new Error('Netlify Blobs store not initialized');
    }
    const movies = await store.get('all') || [];
    res.json(movies);
  } catch (error) {
    console.error('Error reading movies:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.post('/.netlify/functions/api/movies', async (req, res) => {
  console.log('POST /movies appelé');
  try {
    if (!store) {
      throw new Error('Netlify Blobs store not initialized');
    }
    const newMovie = req.body;
    newMovie.id = Date.now();
    let movies = await store.get('all') || [];
    movies.push(newMovie);
    await store.set('all', movies);
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.delete('/.netlify/functions/api/movies/:id', async (req, res) => {
  console.log('DELETE /movies/:id appelé');
  try {
    if (!store) {
      throw new Error('Netlify Blobs store not initialized');
    }
    const id = parseInt(req.params.id);
    let movies = await store.get('all') || [];
    movies = movies.filter(movie => movie.id !== id);
    await store.set('all', movies);
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
