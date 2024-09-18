class WidgetHandler {

    static commonActions = ['move'];
    static commonStates = [/*'displayed', 'shown', 'available',*/'enabled', 'disabled'];

    // Regex for ints only
    static regexIntNumbers = /^\d+$/;

    // Regex for floats only
    static regexFloatNumbers = /^[+-]?\d+(\.\d+)?$/;

    // Regex for a string (any characters)
    static regexAnyString = /^.*$/;

    // Regex for a date in the format DD-MM-YYYY
    static regexDate = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

    // Regex for a time in 24 hour format
    static regexTime24Hour = /^([01]\d|2[0-3]):([0-5]\d)$/;

    // Regex for boolean
    static regexBoolean = /^(true|false)$/;

    static widgets = {
        Field: { actions: [...this.commonActions], states: [...this.commonStates], properties: [], regex: null},
        FieldSet: { actions: [...this.commonActions], states: [...this.commonStates], properties: [], regex: null},
        Text: { actions: [...this.commonActions], states: [...this.commonStates], properties: ['text'], regex: this.regexAnyString },
        Label: { actions: [...this.commonActions], states: [...this.commonStates], properties: ['text'], regex: this.regexAnyString },
        ProgressBar: { actions: [...this.commonActions], states: [...this.commonStates], properties: ['value'], regex: this.regexIntNumbers },
        Tooltip: { actions: [...this.commonActions], states: [...this.commonStates], properties: [], regex: null},
        CheckBox: { actions: [...this.commonActions, 'check', 'pick', 'select', 'choose', 'uncheck'], states: [...this.commonStates, 'checked', 'unchecked', 'picked', 'selected', 'chosen'], properties: ['option', /*'options'*/], regex: this.regexBoolean},
        ListBox: { actions: [...this.commonActions, 'pick', 'select', 'choose'], states: [...this.commonStates, 'picked', 'selected', 'chosen'], properties: ['option', /*'options'*/], regex: this.regexBoolean},
        RadioButton: { actions: [...this.commonActions, 'pick', 'select', 'choose'], states: [...this.commonStates, 'picked', 'selected', 'chosen'], properties: ['option'], regex: this.regexBoolean},
        Button: { actions: [...this.commonActions, 'click', 'submit'], states: [...this.commonStates, 'clicked', 'submitted'], properties: ['value'], regex: this.regexBoolean},
        Calendar: { actions: [...this.commonActions, 'select', 'choose', 'pick', 'set'], states: [...this.commonStates, 'selected', 'chosen', 'picked', 'set'], properties: ['date'], regex: this.regexDate},
        TimePicker: { actions: [...this.commonActions, 'select', 'choose', 'pick', 'set'], states: [...this.commonStates, 'selected', 'chosen', 'picked', 'set'], properties: ['time'], regex: this.regexTime24Hour },
        Link: { actions: [...this.commonActions, 'select', 'choose', 'click'], states: [...this.commonStates, 'selected', 'chosen', 'clicked'], properties: ['option'], regex: null},
        DropdownList: { actions: [...this.commonActions, 'select', 'choose', 'pick'], states: [...this.commonStates, 'selected', 'chosen', 'picked'], properties: ['option'], regex: this.regexBoolean},
        Menu: { actions: [...this.commonActions, 'click', 'select'], states: [...this.commonStates, 'clicked', 'selected'], properties: ['option'], regex: this.regexBoolean},
        MenuItem: { actions: [...this.commonActions, 'click', 'select'], states: [...this.commonStates, 'clicked', 'selected'], properties: ['option'], regex: this.regexBoolean},
        Grid: { actions: [...this.commonActions, 'click', 'select', 'type', 'compare'], states: [...this.commonStates, 'clicked', 'selected', 'typed', 'compared'], properties: ['table', 'column', 'line', 'cell'], regex: null},
        TextField: { actions: [...this.commonActions, 'type', 'set', 'fill'], states: [...this.commonStates, 'typed', 'set', 'filled'], properties: ['text', 'value'], regex: this.regexAnyString },
        TextArea: { actions: [...this.commonActions, 'type', 'set', 'fill'], states: [...this.commonStates, 'typed', 'set', 'filled'], properties: ['text', 'value'], regex: this.regexAnyString  },
        BrowserWindow: { actions: [...this.commonActions, 'go'], states: [...this.commonStates, 'displayed', 'shown', 'available'], properties: ['page', 'title'], regex: null},
        Autocomplete: { actions: [...this.commonActions, 'type and choose', 'type and select'], states: [...this.commonStates, 'set', 'filled'], properties: ['value'], regex: this.regexAnyString},
        Tree: { actions: [...this.commonActions, 'click', 'select'], states: [...this.commonStates, 'clicked', 'selected'], properties: ['line', 'tree'], regex: null},
        WindowDialog: { actions: [...this.commonActions, 'confirm', 'cancel', 'close'], states: [...this.commonStates, 'confirmed', 'canceled', 'closed', 'displayed', 'shown', 'available'], properties: ['content'], regex: null},
        ModalWindow: { actions: [...this.commonActions, 'confirm', 'cancel', 'close'], states: [...this.commonStates, 'confirmed', 'canceled', 'closed', 'displayed', 'shown', 'available'], properties: ['content'], regex: null},
        Accordion: { actions: [...this.commonActions, 'click', 'show', 'hide'], states: [...this.commonStates, 'clicked', 'shown', 'hidden'], properties: ['item'], regex: null},
        TabBar: { actions: [...this.commonActions, 'click', 'select'], states: [...this.commonStates, 'clicked', 'selected'], properties: ['tab'], regex: null},
        Notification: { actions: [...this.commonActions, 'click', 'open', 'close'], states: [...this.commonStates, 'clicked', 'open', 'closed', 'displayed', 'shown', 'available'], properties: ['message'], regex: null},
        NumericStepper: { actions: [...this.commonActions, 'type', 'set', 'fill', 'increase', 'decrease'], states: [...this.commonStates, 'typed', 'set', 'filled', 'increased', 'decreased'], properties: ['value'], regex: this.regexIntNumbers},
        ToggleButton: { actions: [...this.commonActions, 'switch on', 'switch off'], states: [...this.commonStates, 'switched'], properties: [], regex: this.regexBoolean},
        Breadcrumb: { actions: [...this.commonActions, 'select', 'choose', 'click'], states: [...this.commonStates, 'selected', 'chosen', 'clicked'], properties: ['option'], regex: null},
        Icon: { actions: [...this.commonActions, 'click'], states: [...this.commonStates, 'clicked'], properties: [], regex: null},
        Image: { actions: [...this.commonActions, 'click'], states: [...this.commonStates, 'clicked'], properties: [], regex: null},
        ImageCarousel: { actions: [...this.commonActions, 'select', 'choose', 'click', 'scroll'], states: [...this.commonStates, 'selected', 'chosen', 'clicked', 'scrolled'], properties: ['image'], regex: null},
        Pagination: { actions: [...this.commonActions, 'go'], states: [...this.commonStates], properties: ['page'], regex: null },
        SearchBox: { actions: [...this.commonActions, 'type', 'set', 'fill'], states: [...this.commonStates, 'typed', 'set', 'filled'], properties: ['value'], regex: this.regexAnyString },
        Slider: { actions: [...this.commonActions, 'set', 'adjust'], states: [...this.commonStates, 'set', 'adjusted'], properties: ['value'], regex: this.regexIntNumbers},
        Scrollbar: { actions: [...this.commonActions, 'scroll to the right', 'scroll to the left', 'scroll up', 'scroll down'], states: [...this.commonStates, 'scrolled to the right', 'scrolled to the left', 'scrolled up', 'scrolled down'], properties: ['page'], regex: null},
        Splitter: { actions: [...this.commonActions, 'drag to the right', 'drag to the left', 'drag up', 'drag down'], states: [...this.commonStates, 'dragged to the right', 'dragged to the left', 'dragged up', 'dragged down'], properties: [], regex: null},
        TagCloud: { actions: [...this.commonActions, 'select', 'choose', 'pick', 'click'], states: [...this.commonStates, 'selected', 'chosen', 'picked', 'clicked'], properties: ['word'], regex: this.regexAnyString},
        Map: { actions: [...this.commonActions, 'zoom in', 'zoom out', 'switch'], states: [...this.commonStates, 'zoomed', 'switched'], properties: ['satelite imagery', 'street', 'map'], regex: null},
        VideoPlayer: { actions: [...this.commonActions, 'play', 'pause', 'fast forward', 'rewind', 'toggle full screen', 'exit full screen', 'turn the volume up', 'turn the volume down'], states: [...this.commonStates, 'played', 'paused', 'fast forwarded', 'rewound', 'toggled', 'exited', 'turned up', 'turned down'], properties: ['full screen', 'volume', 'video'], regex: null},
    };


    static lookupByProperty(property) {
        return Object.keys(this.widgets).filter(widget => this.widgets[widget].properties.includes(property));
    }

    static lookupByAction(action) {
        return Object.keys(this.widgets).filter(widget => this.widgets[widget].actions.includes(action));
    }

    static lookupByState(state) {
        return Object.keys(this.widgets).filter(widget => this.widgets[widget].states.includes(state));
    }

    static getChangeableInitWidgets() {
        return ["Text", "Label", "ListBox", "DropdownList", "Menu"];
    }
}

module.exports = WidgetHandler;