const express = require('express');
const cors = require('cors');
const XMLHandler = require('./handlers/XMLHandler.js');

const app = express();
const port = 3000;
const route = "/xmlRequest"
const MAX_WAIT_TIME = 3000;


function runServer() {

    // Enable CORS for all routes and origins
    app.use(cors());
    
    app.get(route, (req, res) => {
        const startTime = Date.now(); // Record the start time of the request

        const checkForUpdates = () => {
            // Check if the data has been updated
            if (XMLHandler.getLastUpdated() > Number(req.query.lastPolled)) {
                res.send(XMLHandler.getXML());

            } else if (Date.now() - startTime > MAX_WAIT_TIME) {
                res.status(204).end(); // No Content
            } else {
                setTimeout(checkForUpdates, 2000); // Check every 2 seconds
            }
        };

        checkForUpdates();
    });

    // Start the server
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}${route}`);
    });
}

//runServer();

module.exports = runServer;