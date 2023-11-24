const fs = require('fs');

class XMLHandler {

    static pageArray = ['<empty></empty>'];

    static lastUpdated;

    static setLastUpdated() {
        this.lastUpdated = Date.now();
    }

    static getLastUpdated() {
        return this.lastUpdated;
    }

    static getXML() {
        let XMLString = "";
        this.pageArray.forEach(function(item, index) {
            XMLString += item;
        });
        return XMLString;
    }

    static updateXML() {
        this.pageArray = ["test"];
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


}

module.exports = XMLHandler;