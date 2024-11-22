const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('jekledb');
  cachedDb = db;
  return db;
}

app.get('/.netlify/functions/api/movies', async (req, res) => {
  console.log('GET /movies appelé');
  try {
    const db = await connectToDatabase();
    const movies = await db.collection('movies').find({}).toArray();
    res.json(movies);
  } catch (error) {
    console.error('Error reading movies:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.post('/.netlify/functions/api/movies', async (req, res) => {
  console.log('POST /movies appelé');
  try {
    const db = await connectToDatabase();
    const newMovie = req.body;
    const result = await db.collection('movies').insertOne(newMovie);
    res.status(201).json({ ...newMovie, _id: result.insertedId });
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.delete('/.netlify/functions/api/movies/:id', async (req, res) => {
  console.log('DELETE /movies/:id appelé');
  try {
    const db = await connectToDatabase();
    const id = req.params.id;
    const result = await db.collection('movies').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Film non trouvé" });
    }
    res.status(200).json({ message: "Film supprimé avec succès" });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports.handler = serverless(app);
