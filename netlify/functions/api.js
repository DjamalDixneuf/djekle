const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory storage
let movies = [];

app.get('/', (req, res) => {
  res.json({ message: "API is working" });
});

app.get('/movies', (req, res) => {
  console.log('GET /movies appelé');
  console.log('Films récupérés:', movies);
  res.json(movies);
});

app.post('/movies', (req, res) => {
  console.log('POST /movies appelé');
  const newMovie = req.body;
  newMovie.id = Date.now();
  movies.push(newMovie);
  console.log('Nouveau film ajouté:', newMovie);
  res.status(201).json(newMovie);
});

app.delete('/movies/:id', (req, res) => {
  console.log('DELETE /movies/:id appelé');
  const id = parseInt(req.params.id);
  movies = movies.filter(movie => movie.id !== id);
  console.log('Film supprimé, id:', id);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports.handler = serverless(app);
