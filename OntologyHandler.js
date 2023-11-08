import fs from 'fs'
import * as xml2js from 'xml2js'

export class OntologyHandler {

    ontologyPath = "";

    constructor(ontologyPath) {
        this.ontologyPath = ontologyPath;
        //console.log(this.ontologyPath);
    }

    getUIElements(behaviour) {
        let UIList = [];

        const owlFileContent = fs.readFileSync(this.ontologyPath, 'utf-8');

        xml2js.parseString(owlFileContent, (err, result) => {
            if (err) {
                console.error('Error parsing OWL file:', err);
                return;
            }

            const objectPropertyRanges = extractObjectPropertyRanges(result);

            for (let objectPropertyRange in objectPropertyRanges[0]) {
                for (let x in objectPropertyRanges[0][objectPropertyRange]) {
                    if (x === 'ObjectProperty') {
                        continue;
                    }
                    if (objectPropertyRanges[0][objectPropertyRange][x][0].DataProperty !== undefined) {
                        if (objectPropertyRanges[0][objectPropertyRange][x][0].DataProperty[0].$.IRI === behaviour) {
                            UIList.push(objectPropertyRanges[0][objectPropertyRange][x][0].Datatype[0].$.IRI)
                        }
                    }
                    else if (objectPropertyRanges[0][objectPropertyRange][x][0].ObjectProperty !== undefined) {
                        if (objectPropertyRanges[0][objectPropertyRange][x][0].ObjectProperty[0].$.IRI === behaviour) {
                            UIList.push(objectPropertyRanges[0][objectPropertyRange][x][0].Class[0].$.IRI)
                        }
                    }
                }
            }
        });

        function extractObjectPropertyRanges(owlData) {

            const objectPropertyRanges = [];

            // Define a recursive function to traverse the OWL data
            function traverse(node) {
                for (const key in node) {
                    if (node.hasOwnProperty(key)) {
                        if (key === 'ObjectPropertyRange') {
                            // If the current node is 'objectPropertyRange', add it to the result array
                            objectPropertyRanges.push(node[key]);
                        } else if (typeof node[key] === 'object') {
                            // If the current property is an object, recursively traverse it
                            traverse(node[key]);
                        }
                    }
                }
            }

            // Start the traversal from the root of the OWL data
            traverse(owlData);

            return objectPropertyRanges;
        }

        return UIList;
    }

}