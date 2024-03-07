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

        let { actions, states, properties } = WidgetHandler.widgets[widget];

        let possibleAttributes = [...actions, ...states, ...properties];

        let attribute = getAttribute(content, possibleAttributes);

        if (attribute === null) {
            return "No matching state or property found in content for the identified widget.";
        }

        //console.log(widget)
        ///console.log(attribute)

        return null;
    }

    static testWhen(content) {
        const verbAction = `^${whenWordsPattern}(${actionsPattern})(?:\\s+(${prepPattern}(?:\\s+the)?|the))?\\s*-?\\s*(\\w+)?(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s+(${prepPattern})\\s+(${widgetsPattern})\\s+"[^"]*"\\s+(${prepPattern})(?:\\s+the)?\\s*(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*$`;
        const DeclarativeEntityAction = `^${whenWordsPattern}(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*(${actionsPattern})(?:\\s+(${prepPattern}))?(?:\\s+the)?(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*$`;

        const verbActionRegex = new RegExp(verbAction);
        const DeclarativeEntityActionRegex = new RegExp(DeclarativeEntityAction);

        let widgets = []
        let attribute = null;

        if (verbActionRegex.test(content)) {
            let words = content.split(/\s+/);

            words.forEach((word, index) => {
                if (getWidget(word) != null) {
                    console.log(`Word ${index + 1}: ${word}`);
                    widgets.push(word);
                }
            });

            let { actions, states, properties } = WidgetHandler.widgets[widgets[0]];

            let possibleAttributes = [...actions, ...states, ...properties];

            attribute = getAttribute(content, possibleAttributes)

            console.log(attribute);

            if (attribute === null) {
                return "No matching state or property found in content for the identified widget.";
            }

        } else if (DeclarativeEntityActionRegex.test(content)) {
            let words = content.split(/\s+/);

            words.forEach((word, index) => {
                if (getWidget(word) != null) {
                    console.log(`Word ${index + 1}: ${word}`);
                    widgets.push(word);
                }
            });

            let { actions, states, properties } = WidgetHandler.widgets[widgets[0]];

            let possibleAttributes = [...actions, ...states, ...properties];

            attribute = getAttribute(content, possibleAttributes)

            console.log(attribute);

            if (attribute === null) {
                return "No matching state or property found in content for the identified widget.";
            }
        }
        else {
            return "Content is invalid";
        }

        return null;
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