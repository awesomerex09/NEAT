const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const PROFILES_PATH = path.join(__dirname, '../data/user_profiles.json');
const SCHEDULES_PATH = path.join(__dirname, '../data/workout_schedules.json');

// Get all user profiles
app.get('/api/profiles', (req, res) => {
    try {
        const data = fs.readFileSync(PROFILES_PATH, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read user profiles.' });
    }
});

// Update user profiles
app.post('/api/profiles', (req, res) => {
    try {
        fs.writeFileSync(PROFILES_PATH, JSON.stringify(req.body, null, 2));
        res.json({ message: 'Profiles updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to write user profiles.' });
    }
});

// Get all schedules
app.get('/api/schedules', (req, res) => {
    try {
        const data = fs.readFileSync(SCHEDULES_PATH, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read workout schedules.' });
    }
});

// Update schedules
app.post('/api/schedules', (req, res) => {
    try {
        fs.writeFileSync(SCHEDULES_PATH, JSON.stringify(req.body, null, 2));
        res.json({ message: 'Schedules updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to write workout schedules.' });
    }
});

app.listen(PORT, () => {
    console.log(`Coach Backend Server running on http://localhost:${PORT}`);
});
