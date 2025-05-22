const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/prayfindDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define Schema and Model
const LocationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  googleMapLink: String,
  capacity: Number
});

const Location = mongoose.model('Location', LocationSchema);

// API to add a location
app.post('/api/locations', async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    res.status(201).send('Location saved successfully.');
  } catch (err) {
    res.status(400).send('Failed to save location.');
  }
});

// API to get all locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).send('Error fetching locations.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
