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

        let attribute = getAttribute(content,possibleAttributes)

        if (attribute === null) {
            return "No matching state or property found in content for the identified widget.";
        }

        //console.log(widget)
        ///console.log(attribute)

        return null;
    }

    static testWhen(content) {
        //const declarativeEntityAction = `^${whenWordsPattern}\\s*${widgetAndWidgetIDPattern}\\s+${actionsPattern}(\\s+${prepPattern})?(\\s+the)?\\s+${widgetAndWidgetIDPattern}$`;
        let actionRef = `^${whenWordsPattern}(${actionsPattern})( on)?(?:\\s+(${propertiesPattern})\\s+".+?")?(?:\\s+(on|in|from|to|into|for))?\\s*(?:(the|on)\\s+(${widgetsPattern})\\s+".+?")?`;
        let action = `${actionRef}(?:\\s+and)?\\s*(?:.+?)?(?:\\s+on)?(?:\\s+(.+?)-(.+?))?(?:\\s+(for the|the|on))?\\s*(?:(${widgetsPattern})\\s+".+?")?\\s*$`;
        //let action = `${actionRef}(?:\\s+and)?\\s*(?:.+?)?(?:\\s+on)?(?:\\s+(.+?)-(.+?))?(?:\\s+(for the|the|on))?\\s*(?:(${widgetsPattern})\\s+".+?")?(?:\\s+(on|off|in))?\\s*$`;

        let verbAction = `^${whenWordsPattern}(${actionsPattern})(?:\\s+(${prepPattern}(?:\\s+the)?|the))?\\s*-?\\s*(\\w+)?(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s+(${prepPattern})\\s+(${widgetsPattern})\\s+"[^"]*"\\s+(${prepPattern})(?:\\s+the)?\\s*(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*$`;
        let DeclarativeEntityAction = `^${whenWordsPattern}(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*$`;
        DeclarativeEntityAction = `^${whenWordsPattern}(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*(${actionsPattern})\\s*$`;
        DeclarativeEntityAction = `^${whenWordsPattern}(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*(${actionsPattern})(?:\\s+(${prepPattern}))?\\s*$`;
        DeclarativeEntityAction = `^${whenWordsPattern}(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*(${actionsPattern})(?:\\s+(${prepPattern}))?(?:\\s+the)?\\s*$`;
        DeclarativeEntityAction = `^${whenWordsPattern}(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*(${actionsPattern})(?:\\s+(${prepPattern}))?(?:\\s+the)?(?:\\s+(${widgetsPattern})\\s+"[^"]*")?\\s*$`;





        /*const declarativeEntityRefPattern = `(${widgetsPattern})\\s+"[^"]+"`;
        const verbAction = `(${actionsPattern})\\s+(${prepPattern}\\s+the|the|${prepPattern})?\\s*(${declarativeEntityRefPattern})?\\s+(${prepPattern})\\s+(${declarativeEntityRefPattern})\\s+(${prepPattern}\\s+(the\\s+)?(${declarativeEntityRefPattern})?)?`;
        const verbActionRegex = new RegExp(verbAction);*/
        const verbActionRegex = new RegExp(verbAction);
        const DeclarativeEntityActionRegex = new RegExp(DeclarativeEntityAction);
        if (!verbActionRegex.test(content) && !DeclarativeEntityActionRegex.test(content)) {
            return "Content is invalid";
        }
    }

    static testThen(content) {
        console.log("Then here")
        console.log(content)
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