const fs = require('fs');

class XMLHandler {

    static pages;

    static lastUpdated;

    static setLastUpdated() {
        this.lastUpdated = Date.now();
    }

    static getLastUpdated() {
        return this.lastUpdated;
    }

    static getXML() {
        /*let XMLString = "";
        this.pageArray.forEach(function(item, index) {
            XMLString += item;
        });
        return this.getWebpagesJson();*/
        //console.log(this.pages)
        return this.pages;
    }

    static updateXML(newPages) {
        this.pages = newPages;
        this.setLastUpdated();
    }

    myFunction() {
        console.log('Function called from another file.');
        let xmlContent = `<note>
            <to>User</to>
            <from>JavaScript</from>
            <heading>Reminder</heading>
            <body>This is a test XML file.</body>
            </note>`;

        // Write to an XML file
        fs.writeFile('example.xml', xmlContent, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("XML file has been saved.");
            }
        });
    }

    static addPage(pageString) {
        if (this.pageArray.includes(pageString)) return;
        let xmlContent = '<page =' + pageString + '></page>';
        this.pageArray.push(xmlContent);
    }

    addButton() {

    }

    addComboBox() {

    }

    addTextField() {

    }

    addLabel() {

    }

    addCheckbox() {

    }

    addAlert() {

    }

    static getWebpagesJson() {
        const webpagesJson = {
          "pages": [
            {
              "title": "Main",
              "sections": [
                {
                  "type": "header",
                  "content": "Welcome to Our Main Page"
                },
                {
                  "type": "navigation",
                  "widgets": [
                    {
                      "type": "button",
                      "label": "Home",
                      "action": "navigate",
                      "target": "/"
                    },
                    {
                      "type": "button",
                      "label": "About Us",
                      "action": "navigate",
                      "target": "/about"
                    }
                  ]
                },
                {
                  "type": "searchSection",
                  "widgets": [
                    {
                      "type": "searchBar",
                      "placeholder": "Search here...",
                      "searchButtonLabel": "Search",
                      "action": "search"
                    }
                  ]
                },
                {
                  "type": "content",
                  "widgets": [
                    {
                      "type": "text",
                      "content": "Here is some introductory text about the main page."
                    }
                  ]
                }
              ]
            },
            {
              "title": "Contact",
              "sections": [
                {
                  "type": "header",
                  "content": "Get in Touch"
                },
                {
                  "type": "form",
                  "widgets": [
                    {
                      "type": "textInput",
                      "label": "Your Name",
                      "placeholder": "John Doe"
                    },
                    {
                      "type": "emailInput",
                      "label": "Your Email",
                      "placeholder": "john.doe@example.com"
                    },
                    {
                      "type": "submitButton",
                      "label": "Submit",
                      "action": "submitForm"
                    }
                  ]
                },
                {
                  "type": "footer",
                  "content": "Thank you for visiting our contact page. We will get back to you soon!"
                }
              ]
            }
          ]
        };
        
        return JSON.stringify(webpagesJson, null, 2);
      }


}

module.exports = XMLHandler;