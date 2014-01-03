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
                {kind: "onyx.Groupbox", components: [
                    {kind: "onyx.GroupboxHeader", content: $L("General")},
                    {kind: "enyo.FittableColumns", classes: "settings-row", components: [
                        {content: $L("Enable Linebreak"), classes: "settings-item", fit: true},
                        {name: "tbLinebreak", kind: "onyx.ToggleButton", onChange: "toggleLinebreak"}
                    ]}
                ]},
                {tag: "br"},
                {kind: "onyx.Groupbox", components: [
                    {kind: "onyx.GroupboxHeader", content: $L("Be careful!")},
                    {kind: "enyo.FittableRows", classes: "settings-row", components: [
                        {kind: "onyx.Button", content: "Delete all modules!", classes: "onyx-negative", style: "margin: 3px;", ontap: "deleteModules"},
                        {kind: "onyx.Button", content: "Delete all app data!", classes: "onyx-negative", style: "margin: 3px;", ontap: "deleteDatabases"}
                    ]}
                ]},
            ]}

        ]}
    ],

    handleBack: function() {
        this.doBack();
    },

    setSettings: function () {
        api.get("settings", enyo.bind(this, function(inError, inSettings) {
            if(!inError) {
                if(inSettings) {
                    this.$.tbLinebreak.value = inSettings.linebreak ? true : false;
                    this.$.tbLinebreak.updateVisualState();
                }
            }
        }));

    },

    toggleLinebreak: function (inSender, inEvent) {
        api.putSetting("linebreak", inSender.getValue(), enyo.bind(this, function (inError, inId) {
            if(!inError)
                this.doChange({setting: "linebreak", value: inSender.getValue()});
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