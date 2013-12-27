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
                this.doChange({setting: "linebreak", value: true});
        }));
    },

    handleError: function (inMessage) {
        if (inMessage.message)
            inMessage = inMessage.message;
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});