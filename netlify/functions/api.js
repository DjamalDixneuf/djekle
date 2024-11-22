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
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de film invalide" });
    }

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

// New routes for movie requests

app.get('/.netlify/functions/api/movie-requests', async (req, res) => {
  console.log('GET /movie-requests appelé');
  try {
    const db = await connectToDatabase();
    const requests = await db.collection('movieRequests').find({}).toArray();
    res.json(requests);
  } catch (error) {
    console.error('Error reading movie requests:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.post('/.netlify/functions/api/movie-requests', async (req, res) => {
  console.log('POST /movie-requests appelé');
  try {
    const db = await connectToDatabase();
    const newRequest = req.body;
    const result = await db.collection('movieRequests').insertOne(newRequest);
    res.status(201).json({ ...newRequest, _id: result.insertedId });
  } catch (error) {
    console.error('Error adding movie request:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.post('/.netlify/functions/api/movie-requests/:id/approve', async (req, res) => {
  console.log('POST /movie-requests/:id/approve appelé');
  try {
    const db = await connectToDatabase();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de demande invalide" });
    }

    const request = await db.collection('movieRequests').findOne({ _id: new ObjectId(id) });
    
    if (!request) {
      return res.status(404).json({ error: "Demande non trouvée" });
    }

    // Add the approved movie to the movies collection
    await db.collection('movies').insertOne({
      title: request.title,
      imdbLink: request.imdbLink,
      // Add other necessary fields
    });

    // Remove the request from movieRequests collection
    await db.collection('movieRequests').deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: "Demande approuvée et film ajouté avec succès" });
  } catch (error) {
    console.error('Error approving movie request:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.post('/.netlify/functions/api/movie-requests/:id/reject', async (req, res) => {
  console.log('POST /movie-requests/:id/reject appelé');
  try {
    const db = await connectToDatabase();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de demande invalide" });
    }

    const result = await db.collection('movieRequests').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Demande non trouvée" });
    }

    res.status(200).json({ message: "Demande rejetée avec succès" });
  } catch (error) {
    console.error('Error rejecting movie request:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports.handler = serverless(app);
