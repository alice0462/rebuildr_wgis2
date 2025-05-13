const express = require('express');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',  // Allow only your React app
    methods: ['GET', 'POST', 'OPTIONS'], // Allow specific methods
    allowedHeaders: ['Content-Type'], // Allow specific headers
}));
const PURCHASE_DB_PATH = path.join(__dirname, '../public/data/purchase_db.json');
const PYTHON_SCRIPT_PATH = path.join(__dirname, '../scripts/predictor.py');

app.get('/co2-savings/all', async (req, res) => {
    try{

        const purchaseData = JSON.parse(await fs.readFile(PURCHASE_DB_PATH, 'utf8'));

        /*const userPurchases = purchaseData.filter(
            purchase => purchase.seller_id === userId || purchase.buyer_id === userId
        );*/

        if (purchaseData.length === 0) {
            return res.json([]);
        }
        
        const pythonProcess = spawn('python', [PYTHON_SCRIPT_PATH]);

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdin.write(JSON.stringify(purchaseData));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${stderrData}`);
                return res.status(500).json({ error: 'Failed to calculate CO2 savings' });
            }

            try {
                const result = JSON.parse(stdoutData);
                res.json(result);
            } catch (err) {
                console.error(`Error parsing Python output: ${err.message}`);
                res.status(500).json({ error: 'Invalid response from CO2 savings calculation' });
            }
        });

    } catch (err) {
        console.error(`Server error: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }

});

const port = 8080;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});