enyo.kind({
    name: "biblez.settings",
    kind: "enyo.FittableRows",
    fit: true,
    events: {
        onBack: "",
        onChange: ""
    },
    components: [
        {name: "messagePopup", kind: "onyx.Popup", scrim: true, centered: true, floating: true, classes: "message-popup"},
        {kind: "onyx.MoreToolbar", components: [
            {kind: "onyx.IconButton", src: "assets/back.png", ontap: "handleBack"},
            {content: $L("Preferences")},
        ]},
        {kind: "enyo.Scroller", touch: true, fit: true, components: [
            {classes: "settings-container", components: [
                {name: "container", kind: "onyx.Groupbox", components: [
                    {kind: "onyx.GroupboxHeader", content: $L("General")},
                    {kind: "enyo.FittableColumns", classes: "settings-row", components: [
                        {content: $L("Enable Linebreak"), classes: "settings-item", fit: true},
                        {name: "tbLinebreak", key: "linebreak", kind: "onyx.ToggleButton", onChange: "handleSettings"}
                    ]},
                    {kind: "enyo.FittableColumns", classes: "settings-row", components: [
                        {content: $L("Enable Headings"), classes: "settings-item", fit: true},
                        {name: "tbHeadings", key: "headings", kind: "onyx.ToggleButton", onChange: "handleSettings"}
                    ]},
                    {kind: "enyo.FittableColumns", classes: "settings-row", components: [
                        {content: $L("Enable Footnotes"), classes: "settings-item", fit: true},
                        {name: "tbFootnote", key: "footnotes", kind: "onyx.ToggleButton", onChange: "handleSettings"}
                    ]},
                    {kind: "enyo.FittableColumns", classes: "settings-row", components: [
                        {content: $L("Enable Cross-References"), classes: "settings-item", fit: true},
                        {name: "tbCrossRef", key: "crossReferences", kind: "onyx.ToggleButton", onChange: "handleSettings"}
                    ]},
                    {kind: "enyo.FittableColumns", classes: "settings-row", components: [
                        {content: $L("Enable Words of Christ in Red"), classes: "settings-item", fit: true},
                        {name: "tbWoc", key: "woc", kind: "onyx.ToggleButton", onChange: "handleSettings"}
                    ]},
                    {kind: "enyo.FittableColumns", classes: "settings-row", components: [
                        {content: $L("Enable Introductions"), classes: "settings-item", fit: true},
                        {name: "tbIntro", key: "introductions", kind: "onyx.ToggleButton", onChange: "handleSettings"}
                    ]}
                ]},
                /*{tag: "br"},
                {kind: "onyx.Groupbox", components: [
                    {kind: "onyx.GroupboxHeader", content: $L("Be careful!")},
                    {kind: "enyo.FittableRows", classes: "settings-row", components: [
                        {kind: "onyx.Button", content: "Delete all modules!", classes: "onyx-negative", style: "margin: 3px;", ontap: "deleteModules"},
                        {kind: "onyx.Button", content: "Delete all app data!", classes: "onyx-negative", style: "margin: 3px;", ontap: "deleteDatabases"}
                    ]}
                ]}*/
            ]}

        ]}
    ],

    rendered: function () {
        this.inherited(arguments);
        this.$.container.resized();
    },

    handleBack: function() {
        this.doBack();
    },

    setSettings: function () {
        api.get("settings", enyo.bind(this, function(inError, inSettings) {
            if(!inError) {
                if(inSettings) {
                    this.$.tbLinebreak.value = inSettings.hasOwnProperty("linebreak") ? inSettings.linebreak : false;
                    this.$.tbLinebreak.updateVisualState();
                    this.$.tbHeadings.value = inSettings.hasOwnProperty("headings") ? inSettings.headings : true;
                    this.$.tbHeadings.updateVisualState();
                    this.$.tbFootnote.value = inSettings.hasOwnProperty("footnotes") ? inSettings.footnotes : false;
                    this.$.tbFootnote.updateVisualState();
                    this.$.tbCrossRef.value = inSettings.hasOwnProperty("crossReferences") ? inSettings.crossReferences : false;
                    this.$.tbCrossRef.updateVisualState();
                    this.$.tbIntro.value = inSettings.hasOwnProperty("introductions") ? inSettings.introductions : false;
                    this.$.tbIntro.updateVisualState();
                    this.$.tbWoc.value = inSettings.hasOwnProperty("woc") ? inSettings.woc : false;
                    this.$.tbWoc.updateVisualState();
                }
            }
        }));

    },

    handleSettings: function (inSender, inEvent) {
        api.putSetting(inSender.key, inSender.getValue(), enyo.bind(this, function (inError, inId) {
            if(!inError)
                this.doChange({setting: inSender.key, value: inSender.getValue()});
        }));
    },

    deleteModules: function () {
        sword.dataMgr.clearDatabase();
    },

    deleteDatabases: function () {
        api.deleteDatabases();
    },

    handleError: function (inMessage) {
        if (inMessage.message)
            inMessage = inMessage.message;
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});