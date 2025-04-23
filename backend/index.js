// index.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config(); // Load environment variables from .env

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST endpoint for inference (existing)
app.post('/upload', upload.array('images'), async (req, res) => {
    try {
        const results = [];
        // In your index.js, within the /upload endpoint:
        for (const file of req.files) {
            const formData = new FormData();
            // Updated field name: 'file' instead of 'images'
            formData.append('file', file.buffer, file.originalname);

            const fluxApiUrl = process.env.FLUX_API_URL;
            const falApiKey = process.env.FAL_API_KEY;

            const response = await axios.post(fluxApiUrl, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${falApiKey}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Origin': 'https://fal.ai'
                  },                  
            });

            results.push({
                filename: file.originalname,
                fluxResponse: response.data,
            });
        }

        res.json({ status: 'success', data: results });
    } catch (err) {
        console.error('Error processing files:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// New POST endpoint for training (example)
app.post('/train', upload.array('trainingImages'), async (req, res) => {
    try {
        // Collect training files
        const formData = new FormData();
        // Use a key expected by the training API; check docs—here we assume it's 'trainingImages'
        req.files.forEach((file) => {
            formData.append('trainingImages', file.buffer, file.originalname);
        });

        // Append additional training parameters if required, e.g.:
        formData.append('epochs', 5);
        formData.append('learningRate', 0.001);

        // Use the training endpoint (this is hypothetical; verify with docs)
        const trainingApiUrl = process.env.TRAINING_API_URL || 'https://fal.ai/models/fal-ai/flux/dev/train';
        const falApiKey = process.env.FAL_API_KEY;

        const response = await axios.post(trainingApiUrl, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${falApiKey}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
        });

        // The training endpoint might return a job ID to track progress
        res.json({ status: 'success', data: response.data });
    } catch (err) {
        console.error('Error training model:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
