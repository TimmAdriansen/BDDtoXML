prePostWords = {
    article: [
        "",
        "the",
        "all the",
        "I",
    ],
    negation: [
        "",
        "do not",
        "does not"
    ]
};

whenWords = {
    article: [
        "",
        "I",
        "the"
    ],
    negation: [
        "",
        "do not",
        "does not"
    ]
};

prep = [
    "on",
    "of",
    "in",
    "from",
    "to",
    "into",
    "for",
    "with",
    "out",
    "off",
    "on the row"
];

const WidgetHandler = require("./WidgetHandler.js");
const widgets = WidgetHandler.widgets;
const widgetNames = Object.keys(widgets);


const prePostArticlesPattern = prePostWords.article.map(a => a).join("|");
const prePostNegationsPattern = prePostWords.negation.map(n => n).join("|");
const prePostPattern = `^(${prePostArticlesPattern}) ?(${prePostNegationsPattern}) ?`;

const whenArticlesPattern = whenWords.article.map(a => a).join("|");
const whenNegationPattern = whenWords.negation.map(n => n).join("|");
const whenWordsPattern = `(${whenArticlesPattern}) ?(${whenNegationPattern}) ?`;

const prepPattern = prep.join("|");

const widgetsPattern = Object.keys(widgets).join("|");
const widgetAndWidgetIDPattern = `(${widgetsPattern})\\s+"[^"]+"`;
const actionsPattern = [].concat(...Object.values(widgets).map(w => w.actions)).join("|");
const statesPattern = [].concat(...Object.values(widgets).map(w => w.states)).join("|");
const propertiesPattern = [].concat(...Object.values(WidgetHandler.widgets).map(w => w.properties)).join("|");
let conditions = [];

class DslSpecificationHandler {

    static scenarioKeywords = [
        "Given",
        "When",
        "Then",
        "And"
    ];

    static resetConditions() {
        conditions = [];
    }

    static testGiven(content, currentPage) {
        //console.log(content)
        //conditions = [];
        const declarativeEntityStatePhrase = `${prePostPattern}((${widgetsPattern}) ".+?" (is|are)( not)? (${statesPattern}))$`;
        const declarativeEntityPropertyStatePhrase = `^(${prePostPattern}) ?(${propertiesPattern}) ".+?" (${prepPattern}) (the )?(${widgetsPattern}) ".+?" (is(?: not)?|are(?: not)?) ".+?"$`;
        //const declarativeEntityPropertyStatePhraseNoPropertyID = `^(${prePostPattern}) ?(${propertiesPattern})( ".*?")? (${prepPattern}) (the )?(${widgetsPattern}) ".*?" (is(?: not)?|are(?: not)?) ".*?"$`;
        const declarativeEntityPropertyStatePhraseNoPropertyID = `^(${prePostPattern}) ?(${propertiesPattern})( ".*?")? (${prepPattern}) (the )?(${widgetsPattern}) ".*?" (is(?: not)?|are(?: not)?) (".*?"|${statesPattern})$`;


        const declarativeEntityStatePhraseRegex = new RegExp(declarativeEntityStatePhrase);
        const declarativeEntityPropertyStatePhraseRegex = new RegExp(declarativeEntityPropertyStatePhraseNoPropertyID);

        let widgets = []
        //let attribute = null;

        if (!declarativeEntityStatePhraseRegex.test(content) && !declarativeEntityPropertyStatePhraseRegex.test(content)) {
            return "Content is invalid";
        }

        const pattern = new RegExp(`\\b(${widgetsPattern})\\s+"([^"]+)"`, "g");

        let matches;

        while ((matches = pattern.exec(content)) !== null) {
            // Extract the widget name and ID from the matches
            let widget = matches[1]; // The widget name
            let id = matches[2]; // The widget ID, extracted including quotes

            let widgetObject = { widget: widget, id: id, actions: [], properties: [] };

            widgets.push(widgetObject);
        }

        if (widgets.length == 0) {
            return "Widget not found";
        }

        let container = getContainer(widgets);
        let containerID = container.containerID;
        let widget;

        if (!container.widget) {
            widget = widgets[0];
        } else if (container.widget.widgets.length != 0) {
            widget = container.widget.widgets[0];
        } else {
            widget = container.widget;
        }

        let { /*actions,*/ states, properties, regex } = WidgetHandler.widgets[widget.widget];

        let possibleAttributes = [/*...actions,*/ ...states, ...properties];

        let state = getAttribute(content, states)
        let property = getAttribute(content, properties);

        //attribute = getAttribute(content, possibleAttributes)

        if (state === null && property === null) {
            return "No matching state or property found in content for the identified widget.";
        }

        if (state === null && getValuesAfterKeywords(content) === null) {
            return "No matching state or value found in content for the identified widget.";
        }



        let getChangeableInitWidgets = WidgetHandler.getChangeableInitWidgets();

        //we dont need to set the value of textfields (only the getChangeableInitWidgets) - what we need to figure out is how to make a DLIST with options.
        if (property) {
            let propertyID = getPropertyID(content, property);
            if (property === "option") {
                //ask is a state present? because then we dont need value -> option "a" is selected vs option "b" is "true"
                if (state) {
                    widget.properties.push({ [property]: propertyID });
                } else {
                    let value = getValuesAfterKeywords(content);
                    if (regex != null) {
                        if (!regex.test(value)) {
                            return "Value " + value + " does not fit the widget " + widget.widget;
                        }
                        widget.properties.push({ [property]: propertyID });
                    } else {
                        return "not implemented yet"
                    }
                }
            } else {
                if (state) {
                    //widget.properties.push({ [property]: propertyID });
                } else {
                    let value = getValuesAfterKeywords(content);
                    if (regex != null) {
                        if (!regex.test(value)) {
                            return "Value " + value + " does not fit the widget " + widget.widget;
                        }
                        widget.properties.push({ [property]: value });
                    } else {
                        return "not implemented yet"
                    }
                }
            }
        }

        /*if (properties.includes(attribute) && getChangeableInitWidgets.includes(widget.widget)) {
            //console.log(content);
            widget.properties.push({ [attribute]: getValuesAfterKeywords(content) });
            //console.log(getPropertyID(content, attribute));
            //console.log(getValue(content));
            //widget.actions.push({ type: "set" + attribute, params: { value: getValue(content) }, negated: containsWordNot(content), conditions: conditions })
        }*/

        let existingConditionId = getIdFromConditions(widget.id);
        let id = existingConditionId !== null ? existingConditionId : currentPage + ":" + containerID + widget.id;

        //look into this solution
        if (property && !state) {
            conditions.push({ type: property + "Is", params: { widget: widget.widget, id: id, value: getValuesAfterKeywords(content) }, negated: containsWordNot(content) })
        } /*else if (property && state) {
            conditions.push({ type: property + "Is", params: { widget: widget.widget, id: id, value: state }, negated: containsWordNot(content) })
        }*/ 
        else {
            conditions.push({ type: state, params: { widget: widget.widget, id: id }, negated: containsWordNot(content) })
        }

        //console.log(widget);
        if (container.widget) {
            return container.widget;
        }
        return widget;


        /*let widget = getWidget(content);

        if (widget === null) {
            return "Widget not found";
        }

        let regexPattern = new RegExp(`${widget}\\s+"(.*?)"`);
        let match = content.match(regexPattern);

        if (match && match[1]) {
            // match[1] contains the widget ID, including cases where it spans multiple words
            let widgetID = match[1];
            widget = [{ widget: widget, id: widgetID }];
        } else {
            // Handle the case where no ID is found following the widget
            return "Widget ID not found";
        }

        let { actions, states, properties } = WidgetHandler.widgets[widget[0].widget];

        let possibleAttributes = [...actions, ...states, ...properties];

        let attribute = getAttribute(content, possibleAttributes);

        if (attribute === null) {
            return "No matching state or property found in content for the identified widget.";
        }

        //console.log(widget)
        ///console.log(attribute)

        return widget;*/
    }

    static testWhen(content, currentPage) {
        //console.log(content)
        //const verbAction = `^${whenWordsPattern}(${actionsPattern})(?:\\s+(${prepPattern}(?:\\s+the)?|the))?\\s*-?\\s*(\\w+)?(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s+(${prepPattern})\\s+(${widgetsPattern})\\s+"[^"]*"\\s+(${prepPattern})(?:\\s+the)?\\s*(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*$`;
        //const DeclarativeEntityAction = `^${whenWordsPattern}(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*(${actionsPattern})(?:\\s+(${prepPattern}))?(?:\\s+the)?(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*$`;

        //let actionRef = `^${whenWordsPattern}(${actionsPattern})(?:\\s+on)?\\s*(?:(?:${propertiesPattern})\\s+"[^"]+?")?\\s*(?:${prepPattern})?\\s*(?:(?:the|on)\\s+(${widgetsPattern})\\s+"[^"]+?")?(?:\\s+and)?\\s*(?:"[^"]*?")?(?:\\s+on)?\\s*(?:"[^"]+?"\\s*-\s*"[^"]+?")?(?:\\s+(?:for the|the|on))?\\s*(?:(${widgetsPattern})\\s+"[^"]+?")?(?:\\s+(on|off|in))?\\s+(${widgetsPattern})\\s+"[^"]+"(?:\\s+(on|off|in))?(?:\\s+(of|for|for the|of the))?\\s*(?:${prepPattern})?\\s*(?:(${widgetsPattern})\\s+"[^"]+")?$`
        let actionRef = `^${whenWordsPattern}(${actionsPattern})(?:\\s+(?:on|the))?\\s*(?:(?:${propertiesPattern})\\s+"[^"]+?")?\\s*(?:${prepPattern})?\\s*(?:(?:the|on)\\s+(${widgetsPattern})\\s+"[^"]+?")?(?:\\s+and)?\\s*(?:"[^"]*?")?(?:\\s+on)?\\s*(?:"[^"]+?"\\s*-\s*"[^"]+?")?(?:\\s+(?:for the|the|on))?\\s*(?:(${widgetsPattern})\\s+"[^"]+?")?(?:\\s+(on|off|in))?\\s+(${widgetsPattern})\\s+"[^"]+"(?:\\s+(on|off|in))?(?:\\s+(of|for|for the|of the))?\\s*(?:${prepPattern})?\\s*(?:(${widgetsPattern})\\s+"[^"]+")?$`


        //let newVerbAction = `^${actionRef}(?:\\s+and)?\\s*.*?\\s*(?:on)?\\s*(?:(.+?)-(.+?))?\\s*(?:(?:for the|the|on))?\\s*(?:(?:(${widgetsPattern})\\s+(.+?))?)\\s*(?:(on|off|in))?\\s*(${widgetsPattern})\\s+(.+?)\\s*(?:(on|off|in))?\\s*(?:(?:of|for|for the|of the))?\\s*(?:${prepPattern})?\\s*(?:(?:(${widgetsPattern})\\s+(.+?)))?$`
        //newVerbAction = `^${actionRef}(?:\\s+and)?\\s*(?:"[^"]*?"\\s*)?(?:on)?\\s*(?:(.+?)-(.+?))?\\s*(?:(?:for the|the|on)\\s+)?(${widgetsPattern}\\s+"[^"]+?")?(?:\\s+(on|off|in))?\\s*(${widgetsPattern}\\s+"[^"]+?")(?:\\s+(on|off|in))?\\s*(?:(?:of|for|for the|of the)\\s+)?(?:${prepPattern}\\s+)?(${widgetsPattern}\\s+"[^"]+?")?$`


        const actionRefRegex = new RegExp(actionRef);

        let widgets = []
        let container = null;
        let widget = null;
        let attribute = null;

        if (actionRefRegex.test(content)) {
            /*let words = content.split(/\s+/);

            words.forEach((word, index) => {
                if (getWidget(word) != null) {
                    let widgetID = words[index + 1];
                    //console.log(`Widget: ${word}, ID: ${widgetID}`);
                    widgets.push({ widget: word, id: widgetID });
                }
            });

            if (widgets.length == 0) {
                return "Widget not found";
            }*/

            //const pattern = new RegExp(`\\b(${widgetsPattern})\\s+"\([^"]+\)"`, "g");
            const pattern = new RegExp(`\\b(${widgetsPattern})\\s+"([^"]+)"`, "g");


            let matches;

            while ((matches = pattern.exec(content)) !== null) {
                // Extract the widget name and ID from the matches
                let widget = matches[1]; // The widget name
                let id = matches[2]; // The widget ID, extracted including quotes

                widgets.push({ widget: widget, id: id, actions: [], properties: [] });
            }

            //console.log(widgets);

            if (widgets.length == 0) {
                return "Widget not found";
            }

            container = getContainer(widgets);
            let containerID = container.containerID;

            if (!container.widget) {
                widget = widgets[0];
            } else if (container.widget.widgets.length != 0) {
                widget = container.widget.widgets[0];
            } else {
                widget = container.widget;
            }



            let { actions, /*states,*/ properties } = WidgetHandler.widgets[widget.widget];

            //let possibleAttributes = [...actions, /*...states,*/ ...properties];

            let action = getAttribute(content, actions)
            let property = getAttribute(content, properties);

            //attribute = getAttribute(content, possibleAttributes)

            if (action === null && property === null) {
                return "No matching action or property found in content for the identified widget.";
            }

            //possibleAttributes = [...properties];

            //attribute = getAttribute(content, possibleAttributes)
            //console.log(content)
            //console.log(possibleAttributes)
            //console.log(attribute)



            if (property) {
                //console.log(attribute);
                /*console.log(content);
                console.log(attribute);
                console.log(containsWordNot(content));
                console.log(widgets[0].widget)
                console.log(widgets[0].id)*/

                //possibleAttributes = [...actions, ...states, ...properties];

                //let attribute2 = getAttribute(content, possibleAttributes)
                //console.log(attribute2)

                let propertyID = getPropertyID(content, property);
                if (property === "option") {
                    widget.properties.push({ [property]: propertyID });
                } else {
                    //not sure if needed but here is the space for it!
                }

                conditions.push({ type: action, params: { widget: widget.widget, id: currentPage + ":" + containerID + widget.id, type: property, typeId: propertyID}, negated: containsWordNot(content) })
            } else {
                //possibleAttributes = [...actions, ...states, ...properties];

                //attribute = getAttribute(content, possibleAttributes)

                /*console.log(content);
                console.log(attribute);
                console.log(containsWordNot(content));
                console.log(widgets[0].widget)
                console.log(widgets[0].id)*/
                conditions.push({ type: action, params: { widget: widget.widget, id: currentPage + ":" + containerID + widget.id }, negated: containsWordNot(content) })
            }
        }
        else {
            return "Content is invalid";
        }
        //console.log(widgets);
        if (container.widget) {
            return container.widget;
        }
        return widget;
    }

    static testThen(content, currentPage) {
        //console.log(content)
        const declarativeEntityStatePhrase = `${prePostPattern}((${widgetsPattern}) ".+?" (is|are)( not)? (${statesPattern}))$`;
        const declarativeEntityPropertyStatePhrase = `^(${prePostPattern}) ?(${propertiesPattern}) ".+?" (${prepPattern}) (the )?(${widgetsPattern}) ".+?" (is(?: not)?|are(?: not)?) ".+?"$`;
        const declarativeEntityPropertyStatePhraseNoPropertyID = `^(${prePostPattern}) ?(${propertiesPattern})( ".*?")? (${prepPattern}) (the )?(${widgetsPattern}) ".*?" (is(?: not)?|are(?: not)?) (".*?"|${statesPattern})$`;



        const declarativeEntityStatePhraseRegex = new RegExp(declarativeEntityStatePhrase);
        const declarativeEntityPropertyStatePhraseRegex = new RegExp(declarativeEntityPropertyStatePhraseNoPropertyID);

        let widgets = []
        let attribute = null;

        if (!declarativeEntityStatePhraseRegex.test(content) && !declarativeEntityPropertyStatePhraseRegex.test(content)) {
            return "Content is invalid";
        }

        const pattern = new RegExp(`\\b(${widgetsPattern})\\s+"([^"]+)"`, "g");

        let matches;
        let currentID;

        while ((matches = pattern.exec(content)) !== null) {
            // Extract the widget name and ID from the matches
            let widget = matches[1]; // The widget name
            let id = matches[2]; // The widget ID, extracted including quotes
            currentID = id;
            widgets.push({ widget: widget, id: id, actions: [], properties: [] });
        }

        //console.log(currentID);
        //console.log(lastWhenWidgetID);

        if (widgets.length == 0) {
            return "Widget not found";
        }

        let container = getContainer(widgets);
        let widget;

        if (!container.widget) {
            widget = widgets[0];
        } else if (container.widget.widgets.length != 0) {
            widget = container.widget.widgets[0];
        } else {
            widget = container.widget;
        }

        let { actions, states, properties, regex } = WidgetHandler.widgets[widget.widget];

        let possibleAttributes = [...actions, ...states, ...properties];

        attribute = getAttribute(content, possibleAttributes)

        if (attribute === null) {
            return "No matching state or property found in content for the identified widget.";
        }

        if (properties.includes(attribute)) {
            let value = getValuesAfterKeywords(content);
            if (regex != null) {
                if (!regex.test(value)) {
                    return "Value " + value + " does not fit the widget " + widget.widget;
                }
            }
        }
        /*
        if (containsWordNot(content)) {
            console.log("is not");
        } else {
            console.log("is");
        }

        console.log(attribute);*/
        if (properties.includes(attribute)) {
            //console.log(getPropertyID(content, attribute));
            //console.log(getValue(content));
            widget.actions.push({ type: "SET_VARIABLE:" + attribute, params: { value: getValuesAfterKeywords(content) }, negated: containsWordNot(content), conditions: conditions })
        } else {
            widget.actions.push({ type: attribute, params: {}, negated: containsWordNot(content), conditions: conditions })
        }
        /*console.log(widgets[0].widget);
        console.log(widgets[0].id);*/

        //console.log(widgets[0].actions)
        //console.log(widgets);
        if (container.widget) {
            return container.widget;
        }
        return widget;
    }
}

function getWidget(content) {
    for (let widgetName of widgetNames) {
        let regex = new RegExp(`\\b${widgetName}\\b`);

        if (regex.test(content)) {
            return widgetName;
        }
    }
    return null;
}

//rewrite this if we have more than one attribute that fits (example: text of Text is set)
function getAttribute(content, possibleAttributes) {
    for (let attribute of possibleAttributes) {
        let regex = new RegExp(`\\b${attribute}\\b`);

        if (regex.test(content)) {
            return attribute;
        }
    }
    return null;
}

/*function getAttribute(content, possibleAttributes) {
    for (let attribute of possibleAttributes) {
        // Create a regex that finds the attribute followed by any whitespace and then the next word
        let regex = new RegExp(`\\b${attribute}\\b\\s+(\\w+)`);

        // Test the content against the regex and capture the following word
        let match = content.match(regex);
        if (match) {
            return { attribute: attribute, nextWord: match[1] };
        }
    }
    return null;
}*/

function containsWordNot(inputString) {
    // Remove all occurrences of "..." (with any characters inside) from the input string
    const sanitizedString = inputString.replace(/"[^"]*"/g, '');

    // Check if the remaining string contains the word "not" as a whole word
    return /\bnot\b/i.test(sanitizedString);
}

function getValue(inputString) {
    // Regular expression to find all instances of words within quotes
    const regex = /"([^"]+)"/g;
    let match;
    let lastQuotedWord = null;

    // Loop through all matches in the string
    while ((match = regex.exec(inputString)) !== null) {
        lastQuotedWord = match[1]; // match[1] captures the group within the quotes
    }

    return lastQuotedWord;
}

function getValuesAfterKeywords(inputString) {
    // Regular expression to find instances of "is", "are", or "not" followed by a quoted word
    const regex = /\b(?:is|are|not)\s+"([^"]+)"/;
    let match = regex.exec(inputString);

    // If a match is found, return the quoted word
    if (match) {
        return match[1]; // match[1] captures the group within the quotes
    }

    return null;
}

function getPropertyID(inputString, keyword) {
    // Create a regex that finds the specified keyword followed by whitespace and then a word enclosed in quotes
    const regex = new RegExp(`\\b${keyword}\\b\\s+"(\\w+)"`, 'i');
    //console.log(keyword)
    //console.log(inputString);

    // Find the match in the string
    const match = inputString.match(regex);

    // If a match is found, return the word after the keyword, stripping the quotes
    if (match) {
        return match[1];  // match[1] captures the word inside the quotes after the keyword
    } else {
        return null; // Return null if no keyword or quoted word is found
    }
}

function getContainer(widgets) {
    let isContainerPresent = widgets.some(widget =>
        widget.widget === 'FieldSet' ||
        //widget.widget === 'Menu' ||
        //widget.widget === 'ListBox' ||
        //widget.widget === 'DropdownList' ||
        widget.widget === 'ModalWindow' ||
        widget.widget === 'WindowDialog'
    );

    let widget = null;
    let containerID = "";

    if (isContainerPresent) {
        let containerWidget;
        widgets.forEach(container => {
            if (['FieldSet', /*'Menu', 'ListBox', 'DropdownList',*/ 'ModalWindow', 'WindowDialog'].includes(container.widget)) {
                if (!containerWidget) {
                    // Filter out the current container from its own widgets list
                    let newWidgets = widgets.filter(widget => widget.id !== container.id);

                    container.widgets = newWidgets;
                    containerWidget = container;
                } else {
                    containerWidget = null;
                    return;
                }
            }
        });
        if (!containerWidget) {
            return "A container cannot contain another container"
        }
        widget = containerWidget;
        containerID = containerWidget.id + ":";
    }

    return { widget: widget, containerID: containerID };
}

function getIdFromConditions(idToCheck) {
    for (const condition of conditions) {
        // Split the id in the condition
        const conditionIdParts = condition.params.id.split(':');
        // Get the last part of the id
        const conditionLastPart = conditionIdParts[conditionIdParts.length - 1];
        // Check if the last part matches the idToCheck
        if (conditionLastPart === idToCheck) {
            // Return the entire id if it matches
            return condition.params.id;
        }
    }
    // Return null if no match is found
    return null;
}



module.exports = DslSpecificationHandler;