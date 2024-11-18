const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

let movies = [];

app.get('/api/movies', (req, res) => {
  res.json(movies);
});

app.post('/api/movies', (req, res) => {
  const newMovie = req.body;
  newMovie.id = Date.now(); // Génère un ID unique
  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.delete('/api/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  movies = movies.filter(movie => movie.id !== id);
  res.status(204).send();
});

module.exports.handler = serverless(app);
