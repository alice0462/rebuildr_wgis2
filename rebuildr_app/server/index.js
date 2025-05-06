const express = require('express');
const { spawn } = require('child_process');

const app = express();
const port = 5000;

app.use(express.json());

app.get('/predict-tea', (req, res) => {
    // Spawn a child process to run the Python script
    const pythonProcess = spawn('python', ['./scripts/predict.py']);

    let output = '';
    let errorOutput = '';

    // Capture the Python script's stdout
    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // Capture the Python script's stderr
    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    // Handle the process exit
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                // Parse the JSON output from the Python script
                const result = JSON.parse(output);
                res.status(200).json({
                    will_drink_tea: result.will_drink_tea,
                    probability: result.probability
                });
            } catch (err) {
                console.error('Error parsing Python output:', err);
                res.status(500).json({ error: 'Failed to parse prediction' });
            }
        } else {
            console.error('Python script error:', errorOutput);
            res.status(500).json({ error: 'Python script failed', details: errorOutput });
        }
    });
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});