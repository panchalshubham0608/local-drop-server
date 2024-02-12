require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { configureSocketIO, socketIdWithUsers } = require('./socket');
const cors = require('cors');

const app = express();
app.use(cors());
const httpServer = createServer(app);
configureSocketIO(httpServer);


app.get('/', (req, res) => {
    return res.status(200).json({"message": "Hello World!"});
});

// retrieves list of currently connected devices
app.get('/devices', (req, res) => {
    let devices = [];
    for (const [socketId, username] of Object.entries(socketIdWithUsers)) {
        devices.push({id: socketId, name: username});
    }
    return res.status(200).json({devices});
});

const port = process.env.PORT || 8080;
httpServer.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});

