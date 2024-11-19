const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const { NetlifyKV } = require('@netlify/blobs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const store = new NetlifyKV('movies');

app.get('/api/movies', async (req, res) => {
  console.log('GET /api/movies appelé');
  try {
    const movies = await store.get('all') || [];
    console.log('Films récupérés:', movies);
    res.json(movies);
  } catch (error) {
    console.error('Erreur lors de la récupération des films:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des films' });
  }
});

app.post('/api/movies', async (req, res) => {
  console.log('POST /api/movies appelé');
  try {
    const newMovie = req.body;
    newMovie.id = Date.now();
    let movies = await store.get('all') || [];
    movies.push(newMovie);
    await store.set('all', movies);
    console.log('Nouveau film ajouté:', newMovie);
    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du film:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'ajout du film' });
  }
});

app.delete('/api/movies/:id', async (req, res) => {
  console.log('DELETE /api/movies/:id appelé');
  try {
    const id = parseInt(req.params.id);
    let movies = await store.get('all') || [];
    movies = movies.filter(movie => movie.id !== id);
    await store.set('all', movies);
    console.log('Film supprimé, id:', id);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du film:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du film' });
  }
});

module.exports.handler = serverless(app);
