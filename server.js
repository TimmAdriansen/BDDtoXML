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

    //route
    /*app.get(route, (req, res) => {
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
      <Website>
          <Browser_Window name="page1">
              <Text>Example page 1</Text>
              <Button url="page2">Go</Button>
              <Calendar date="10/10/2000"></Calendar>
              <Checkbox boolean="false"></Checkbox>
              <Dropdown_Button></Dropdown_Button>
              <Dropdown_List></Dropdown_List>
              <Grid></Grid>
              <Label></Label>
              <Link url="page2">another page</Link>
              <List_Box></List_Box>
              <Menu>
                  <Menu_Item>Example item</Menu_Item>
              </Menu>
              <Message_Box></Message_Box>
              <Text>test!</Text>
              <Text_Field id="inputField">input text here</Text_Field>
          </Browser_Window>
          <Browser_Window name="page2">
              <Text>Example page 2</Text>
              <Button url="page1">Go back</Button>
              <Button id="showDialog">Show</Button>
              <Window_Dialog id="showDialog"></Window_Dialog>
          </Browser_Window>
      </Website>`)
      //res.json({ message: 'Hello from server!!!!' });
    });*/

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