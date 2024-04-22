class WidgetHandler {

    static commonActions = ['move'];
    static commonStates = ['displayed', 'shown', 'available', 'enabled', 'disabled'];

    static widgets = {
        Field: { actions: [...this.commonActions], states: [...this.commonStates], properties: [] },
        FieldSet: { actions: [...this.commonActions], states: [...this.commonStates], properties: [] },
        Text: { actions: [...this.commonActions], states: [...this.commonStates], properties: ['text'] },
        Label: { actions: [...this.commonActions], states: [...this.commonStates], properties: ['text'] },
        ProgressBar: { actions: [...this.commonActions], states: [...this.commonStates], properties: ['value'] },
        Tooltip: { actions: [...this.commonActions], states: [...this.commonStates], properties: [] },
        CheckBox: { actions: [...this.commonActions, 'check', 'pick', 'select', 'choose', 'uncheck'], states: [...this.commonStates, 'checked', 'unchecked', 'picked', 'selected', 'chosen'], properties: ['option', 'options'] },
        ListBox: { actions: [...this.commonActions, 'pick', 'select', 'choose'], states: [...this.commonStates, 'picked', 'selected', 'chosen'], properties: ['option', 'options'] },
        RadioButton: { actions: [...this.commonActions, 'pick', 'select', 'choose'], states: [...this.commonStates, 'picked', 'selected', 'chosen'], properties: ['option'] },
        Button: { actions: [...this.commonActions, 'click', 'submit'], states: [...this.commonStates, 'clicked', 'submitted'], properties: ['value'] },
        Calendar: { actions: [...this.commonActions, 'select', 'choose', 'pick', 'set'], states: [...this.commonStates, 'selected', 'chosen', 'picked', 'set'], properties: ['date'] },
        TimePicker: { actions: [...this.commonActions, 'select', 'choose', 'pick', 'set'], states: [...this.commonStates, 'selected', 'chosen', 'picked', 'set'], properties: ['time'] },
        Link: { actions: [...this.commonActions, 'select', 'choose', 'click'], states: [...this.commonStates, 'selected', 'chosen', 'clicked'], properties: ['option'] },
        DropdownList: { actions: [...this.commonActions, 'select', 'choose', 'pick'], states: [...this.commonStates, 'selected', 'chosen', 'picked'], properties: ['option'] },
        Menu: { actions: [...this.commonActions, 'click', 'select'], states: [...this.commonStates, 'clicked', 'selected'], properties: ['option'] },
        MenuItem: { actions: [...this.commonActions, 'click', 'select'], states: [...this.commonStates, 'clicked', 'selected'], properties: ['option'] },
        Grid: { actions: [...this.commonActions, 'click', 'select', 'type', 'compare'], states: [...this.commonStates, 'clicked', 'selected', 'typed', 'compared'], properties: ['table', 'column', 'line', 'cell'] },
        TextField: { actions: [...this.commonActions, 'type', 'set', 'fill'], states: [...this.commonStates, 'typed', 'set', 'filled'], properties: ['text', 'value'] },
        TextArea: { actions: [...this.commonActions, 'type', 'set', 'fill'], states: [...this.commonStates, 'typed', 'set', 'filled'], properties: ['text', 'value'] },
        BrowserWindow: { actions: [...this.commonActions, 'go'], states: [...this.commonStates], properties: ['page', 'title'] },
        Autocomplete: { actions: [...this.commonActions, 'type and choose', 'type and select'], states: [...this.commonStates, 'set', 'filled'], properties: ['value'] },
        Tree: { actions: [...this.commonActions, 'click', 'select'], states: [...this.commonStates, 'clicked', 'selected'], properties: ['line', 'tree'] },
        WindowDialog: { actions: [...this.commonActions, 'confirm', 'cancel', 'close'], states: [...this.commonStates, 'confirmed', 'canceled', 'closed'], properties: ['content'] },
        ModalWindow: { actions: [...this.commonActions, 'confirm', 'cancel', 'close'], states: [...this.commonStates, 'confirmed', 'canceled', 'closed'], properties: ['content'] },
        Accordion: { actions: [...this.commonActions, 'click', 'show', 'hide'], states: [...this.commonStates, 'clicked', 'shown', 'hidden'], properties: ['item'] },
        TabBar: { actions: [...this.commonActions, 'click', 'select'], states: [...this.commonStates, 'clicked', 'selected'], properties: ['tab'] },
        Notification: { actions: [...this.commonActions, 'click', 'open', 'close'], states: [...this.commonStates, 'clicked', 'open', 'closed'], properties: ['message'] },
        NumericStepper: { actions: [...this.commonActions, 'type', 'set', 'fill', 'increase', 'decrease'], states: [...this.commonStates, 'typed', 'set', 'filled', 'increased', 'decreased'], properties: ['value'] },
        ToggleButton: { actions: [...this.commonActions, 'switch on', 'switch off'], states: [...this.commonStates, 'switched'], properties: [] },
        Breadcrumb: { actions: [...this.commonActions, 'select', 'choose', 'click'], states: [...this.commonStates, 'selected', 'chosen', 'clicked'], properties: ['option'] },
        Icon: { actions: [...this.commonActions, 'click'], states: [...this.commonStates, 'clicked'], properties: [] },
        Image: { actions: [...this.commonActions, 'click'], states: [...this.commonStates, 'clicked'], properties: [] },
        ImageCarousel: { actions: [...this.commonActions, 'select', 'choose', 'click', 'scroll'], states: [...this.commonStates, 'selected', 'chosen', 'clicked', 'scrolled'], properties: ['image'] },
        Pagination: { actions: [...this.commonActions, 'go'], states: [...this.commonStates], properties: ['page'] },
        SearchBox: { actions: [...this.commonActions, 'type', 'set', 'fill'], states: [...this.commonStates, 'typed', 'set', 'filled'], properties: ['value'] },
        Slider: { actions: [...this.commonActions, 'set', 'adjust'], states: [...this.commonStates, 'set', 'adjusted'], properties: ['value'] },
        Scrollbar: { actions: [...this.commonActions, 'scroll to the right', 'scroll to the left', 'scroll up', 'scroll down'], states: [...this.commonStates, 'scrolled to the right', 'scrolled to the left', 'scrolled up', 'scrolled down'], properties: ['page'] },
        Splitter: { actions: [...this.commonActions, 'drag to the right', 'drag to the left', 'drag up', 'drag down'], states: [...this.commonStates, 'dragged to the right', 'dragged to the left', 'dragged up', 'dragged down'], properties: [] },
        TagCloud: { actions: [...this.commonActions, 'select', 'choose', 'pick', 'click'], states: [...this.commonStates, 'selected', 'chosen', 'picked', 'clicked'], properties: ['word'] },
        Map: { actions: [...this.commonActions, 'zoom in', 'zoom out', 'switch'], states: [...this.commonStates, 'zoomed', 'switched'], properties: ['satelite imagery', 'street', 'map'] },
        VideoPlayer: { actions: [...this.commonActions, 'play', 'pause', 'fast forward', 'rewind', 'toggle full screen', 'exit full screen', 'turn the volume up', 'turn the volume down'], states: [...this.commonStates, 'played', 'paused', 'fast forwarded', 'rewound', 'toggled', 'exited', 'turned up', 'turned down'], properties: ['full screen', 'volume', 'video'] },
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
        return ["Text", "Label", "xd"];
    }
}

module.exports = WidgetHandler;