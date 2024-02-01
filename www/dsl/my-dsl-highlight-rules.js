define("ace/mode/my-dsl_highlight_rules", function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var MyDslHighlightRules = function() {
        var keywords = "And|Given|I|Then|When|all|and|are|declarative|do|does|entity|for|from|imperative|in|into|is|linearly|means|model|not|of|off|on|out|row|the|to|using|which|with";
		this.$rules = {
			"start": [
				{token: "comment", regex: "\\/\\/.*$"},
				{token: "comment", regex: "\\/\\*", next : "comment"},
				{token: "string", regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'},
				{token: "string", regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"},
				{token: "constant.numeric", regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"},
				{token: "lparen", regex: "[\\[{]"},
				{token: "rparen", regex: "[\\]}]"},
				{token: "keyword", regex: "\\b(?:" + keywords + ")\\b"}
			],
			"comment": [
				{token: "comment", regex: ".*?\\*\\/", next : "start"},
				{token: "comment", regex: ".+"}
			]
		};
    };

    oop.inherits(MyDslHighlightRules, TextHighlightRules);

    exports.MyDslHighlightRules = MyDslHighlightRules;
});