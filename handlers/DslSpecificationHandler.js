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

class DslSpecificationHandler {

    static scenarioKeywords = [
        "Given",
        "When",
        "Then",
        "And"
    ];

    static testGiven(content) {
        const declarativeEntityStatePhrase = `${prePostPattern}((${widgetsPattern}) ".+?" (is|are)( not)? (${statesPattern}))$`;
        const declarativeEntityPropertyStatePhrase = `^(${prePostPattern}) ?(${propertiesPattern}) ".+?" (${prepPattern}) (the )?(${widgetsPattern}) ".+?" (is(?: not)?|are(?: not)?) ".+?"$`;

        const declarativeEntityStatePhraseRegex = new RegExp(declarativeEntityStatePhrase);
        const declarativeEntityPropertyStatePhraseRegex = new RegExp(declarativeEntityPropertyStatePhrase);
        if (!declarativeEntityStatePhraseRegex.test(content) && !declarativeEntityPropertyStatePhraseRegex.test(content)) {
            return "Content is invalid";
        }

        let widget = getWidget(content);

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

        return widget;
    }

    static testWhen(content) {
        //const verbAction = `^${whenWordsPattern}(${actionsPattern})(?:\\s+(${prepPattern}(?:\\s+the)?|the))?\\s*-?\\s*(\\w+)?(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s+(${prepPattern})\\s+(${widgetsPattern})\\s+"[^"]*"\\s+(${prepPattern})(?:\\s+the)?\\s*(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*$`;
        //const DeclarativeEntityAction = `^${whenWordsPattern}(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*(${actionsPattern})(?:\\s+(${prepPattern}))?(?:\\s+the)?(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*$`;

        let actionRef = `^${whenWordsPattern}(${actionsPattern})(?:\\s+on)?\\s*(?:(?:${propertiesPattern})\\s+"[^"]+?")?\\s*(?:${prepPattern})?\\s*(?:(?:the|on)\\s+(${widgetsPattern})\\s+"[^"]+?")?(?:\\s+and)?\\s*(?:"[^"]*?")?(?:\\s+on)?\\s*(?:"[^"]+?"\\s*-\s*"[^"]+?")?(?:\\s+(?:for the|the|on))?\\s*(?:(${widgetsPattern})\\s+"[^"]+?")?(?:\\s+(on|off|in))?\\s+(${widgetsPattern})\\s+"[^"]+"(?:\\s+(on|off|in))?(?:\\s+(of|for|for the|of the))?\\s*(?:${prepPattern})?\\s*(?:(${widgetsPattern})\\s+"[^"]+")?$`

        //let newVerbAction = `^${actionRef}(?:\\s+and)?\\s*.*?\\s*(?:on)?\\s*(?:(.+?)-(.+?))?\\s*(?:(?:for the|the|on))?\\s*(?:(?:(${widgetsPattern})\\s+(.+?))?)\\s*(?:(on|off|in))?\\s*(${widgetsPattern})\\s+(.+?)\\s*(?:(on|off|in))?\\s*(?:(?:of|for|for the|of the))?\\s*(?:${prepPattern})?\\s*(?:(?:(${widgetsPattern})\\s+(.+?)))?$`
        //newVerbAction = `^${actionRef}(?:\\s+and)?\\s*(?:"[^"]*?"\\s*)?(?:on)?\\s*(?:(.+?)-(.+?))?\\s*(?:(?:for the|the|on)\\s+)?(${widgetsPattern}\\s+"[^"]+?")?(?:\\s+(on|off|in))?\\s*(${widgetsPattern}\\s+"[^"]+?")(?:\\s+(on|off|in))?\\s*(?:(?:of|for|for the|of the)\\s+)?(?:${prepPattern}\\s+)?(${widgetsPattern}\\s+"[^"]+?")?$`


        const actionRefRegex = new RegExp(actionRef);

        let widgets = []
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

                widgets.push({ widget: widget, id: id });
            }

            if (widgets.length == 0) {
                return "Widget not found";
            }

            let { actions, states, properties } = WidgetHandler.widgets[widgets[0].widget];

            let possibleAttributes = [...actions, ...states, ...properties];

            attribute = getAttribute(content, possibleAttributes)

            //console.log(attribute);

            if (attribute === null) {
                return "No matching state or property found in content for the identified widget.";
            }

        }
        else {
            return "Content is invalid";
        }

        return widgets;
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

function getAttribute(content, possibleAttributes) {
    for (let attribute of possibleAttributes) {
        let regex = new RegExp(`\\b${attribute}\\b`);

        if (regex.test(content)) {
            return attribute;
        }
    }
    return null;
}



module.exports = DslSpecificationHandler;