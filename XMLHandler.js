import * as fs from 'fs'

export class XMLHandler {

    pageArray;

    constructor() {
        this.pageArray = [];
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

    addPage(pageString) {
        if(this.pageArray.includes(pageString)) return;
        let xmlContent = '<page ='+pageString+'></page>';
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