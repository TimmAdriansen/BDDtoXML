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
    subject: [
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


const articlesPattern = prePostWords.article.map(a => a).join("|");
const negationsPattern = prePostWords.negation.map(n => n).join("|");
const prePostPattern = `^(${articlesPattern}) ?(${negationsPattern}) ?`;

const prepPattern = prep.join("|");

const widgetsPattern = Object.keys(widgets).join("|");
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
        const declarativeEntityStatePhrase = `${prePostPattern}((${widgetsPattern}) "\\w+" (is|are)( not)? (${statesPattern}))$`;
        const declarativeEntityPropertyStatePhrase = `^(${prePostPattern}) ?(${propertiesPattern}) "(\\w+)" (${prepPattern}) (the )?(${widgetsPattern}) "(\\w+)" (is(?: not)?|are(?: not)?) "(\\w+)"$`;

        const declarativeEntityStatePhraseRegex = new RegExp(declarativeEntityStatePhrase);
        const declarativeEntityPropertyStatePhraseRegex = new RegExp(declarativeEntityPropertyStatePhrase);
        if (!declarativeEntityStatePhraseRegex.test(content) && !declarativeEntityPropertyStatePhraseRegex.test(content)) {
            return "Content is invalid";
        }

        let widget = getWidget(content);

        if (widget === null) {
            return "Widget not found";
        }

        const { states, properties } = WidgetHandler.widgets[widget];

        const possibleAttributes = [...states, ...properties];

        let attributeFound = possibleAttributes.some(attribute => content.includes(attribute));

        if (!attributeFound) {
            return "No matching state or property found in content for the identified widget.";
        }

        return null;
    }

    static testWhen(content) {
        console.log("When here")
        console.log(content)
    }

    static testThen(content) {
        console.log("Then here")
        console.log(content)
    }
}

function getWidget(content) {
    for (let widgetName of widgetNames) {
        if (content.includes(widgetName)) {
            return widgetName;
        }
    }
    return null;
}



module.exports = DslSpecificationHandler;