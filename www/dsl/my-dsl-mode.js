define("ace/mode/my-dsl", function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var MyDslHighlightRules = require("ace/mode/my-dsl_highlight_rules").MyDslHighlightRules;

    var Mode = function() {
        this.HighlightRules = MyDslHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function() {
        // Define additional mode settings or behavior here
    }).call(Mode.prototype);

    exports.Mode = Mode;
});