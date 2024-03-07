define("ace/mode/my-dsl_highlight_rules", function (require, exports, module) {
	var oop = require("ace/lib/oop");
	var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

	var MyDslHighlightRules = function () {
		var keywords = "I|all|and|are|declarative|do|does|entity|for|from|imperative|in|into|is|linearly|means|model|not|of|off|on|out|row|the|to|using|which|with";
		var scenarioKeywords = "Given|When|Then|And"
		var widgets = "Field|FieldSet|Text|Label|ProgressBar|Tooltip|CheckBox|ListBox|RadioButton|Button|Calendar|TimePicker|Link|DropdownList|Menu|MenuItem|Grid|TextField|TextArea|BrowserWindow|Autocomplete|Tree|WindowDialog|ModalWindow|Accordion|TabBar|Notification|NumericStepper|ToggleButton|Breadcrumb|Icon|Image|ImageCarousel|Pagination|SearchBox|Slider|Scrollbar|Splitter|TagCloud|Map|VideoPlayer";
		var actions = "move|check|pick|select|choose|uncheck|click|submit|type|compare|go|type and choose|type and select|confirm|cancel|close|show|hide|switch on|switch off|scroll|drag to the right|drag to the left|drag up|drag down|zoom in|zoom out|switch|play|pause|fast forward|rewind|toggle full screen|exit full screen|turn the volume up|turn the volume down";
		var states = "displayed|shown|available|enabled|disabled|checked|unchecked|picked|selected|chosen|clicked|submitted|set|typed|compared|filled|confirmed|canceled|closed|hidden|increased|decreased|switched|scrolled|dragged to the right|dragged to the left|dragged up|dragged down|zoomed"
		var properties = "option|options|value|date|time|table|column|line|cell|text|page|title|tree|content|item|tab|message|image|word|satelite imagery|street|map|full screen|volume|video";
		this.$rules = {
			"start": [
				{ token: "comment", regex: "\\/\\/.*$" },
				{ token: "comment", regex: "\\/\\*", next: "comment" },
				{ token: "string", regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]' },
				{ token: "string", regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']" },
				{ token: "constant.numeric", regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b" },
				{ token: "lparen", regex: "[\\[{]" },
				{ token: "rparen", regex: "[\\]}]" },
				{ token: "string", regex: "^Scenario:.*$" },
				{ token: "scenario", regex: "\\b(?:" + scenarioKeywords + ")\\b" },
				{ token: "widget", regex: "\\b(?:" + widgets + ")\\b" },
				{ token: "action", regex: "\\b(?:" + actions + ")\\b" },
				{ token: "state", regex: "\\b(?:" + states + ")\\b" },
				{ token: "property", regex: "\\b(?:" + properties + ")\\b" },
				{ token: "keyword", regex: "\\b(?:" + keywords + ")\\b" }
			],
			"comment": [
				{ token: "comment", regex: ".*?\\*\\/", next: "start" },
				{ token: "comment", regex: ".+" }
			]
		};
	};

	oop.inherits(MyDslHighlightRules, TextHighlightRules);

	exports.MyDslHighlightRules = MyDslHighlightRules;
});