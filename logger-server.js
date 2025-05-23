// logger-server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000; // Port the logging server will listen on

// Middleware to parse JSON bodies.
// Increased limit to handle potentially larger log entries if needed in the future.
app.use(express.json({ limit: '1mb' }));

const logsDir = path.join(__dirname, 'user_logs');
const logFile = path.join(logsDir, 'activity.log');

// Ensure the user_logs directory exists
if (!fs.existsSync(logsDir)) {
    try {
        fs.mkdirSync(logsDir, { recursive: true });
        console.log(`Created directory: ${logsDir}`);
    } catch (err) {
        console.error(`Error creating logs directory ${logsDir}:`, err);
        process.exit(1); // Exit if we can't create the log directory
    }
}

app.post('/log', (req, res) => {
    const logEntry = req.body;

    if (!logEntry || typeof logEntry !== 'object' || Object.keys(logEntry).length === 0) {
        console.warn('Received empty or invalid log entry.');
        return res.status(400).send('Bad Request: Log entry is empty or invalid.');
    }

    // Add a server-side timestamp for when the log was received
    logEntry.serverReceivedTimestamp = new Date().toISOString();

    const logString = JSON.stringify(logEntry) + '\n'; // Add a newline for each log

    fs.appendFile(logFile, logString, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
            // Don't send error details to the client for security, but log it
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).send('Log received');
    });
});

// Basic route to check if the server is running
app.get('/', (req, res) => {
    res.send('Logging server is running. Send POST requests to /log to record activity.');
});

app.listen(port, () => {
    console.log(`Logging server listening on http://localhost:${port}`);
    console.log(`Logs will be saved to: ${logFile}`);
});
