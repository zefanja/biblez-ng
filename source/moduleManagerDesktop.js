enyo.kind({
    name: "biblez.moduleManagerDesktop",
    kind: "enyo.FittableRows",
    fit: true,
    events: {
        onBack: "",
        onInstalled: ""
    },
    components: [
        {name: "messagePopup", kind: "onyx.Popup", scrim: true, centered: true, floating: true, classes: "message-popup"},
        {name: "scrim", kind: "onyx.Scrim", classes: "onyx-scrim-translucent"},
        {kind: "onyx.MoreToolbar", components: [
            {kind: "onyx.IconButton", src: "assets/back.png", ontap: "handleBack"},
            {content: $L("Module Manager")}
            //{kind: "onyx.IconButton", src: "assets/delete.png", ontap: "clearDB"}
        ]},
        {classes: "center", components: [
            {content: $L("Download a zipped module from one of the following repositories:")},
            {allowHtml: true, content: "<ul><li><a target='_blank' href='http://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles'>CrossWire Main</a></li>" +
                                        "<li><a target='_blank' href='http://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles&av=true'>CrossWire av11n</a></li>" +
                                        "<li><a target='_blank' href='http://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles&beta=true'>CrossWire Beta</a></li></ul>"
            },
            {content: $L("To install the module, select the module file!")},
            {kind: "onyx.Input", type: "file", id: "files", name: "files[]", onchange: "installModule"},
            {tag: "br"},
            {kind: "onyx.Spinner", name: "spinner", showing: false, classes: "onyx-light center"}
        ]}
    ],

    lang: [],
    started: false,
    repos: [],
    modules: [],
    langModules: [],
    currentModule: null,

    handleBack: function() {
        this.doBack();
    },

    installModule: function (inSender, inEvent) {
        this.$.spinner.start();
        sword.installMgr.installModule(inEvent.target.files[0], enyo.bind(this, function (inError, inModule) {
            if (!inError) {
                this.doInstalled();
                this.$.spinner.stop();
                this.handleError("Installed Module!");
            } else {
                this.handleError((inError.message) ? inError.message : inError);
            }
        }));
    },

    clearDB: function () {
        sword.dataMgr.clearDatabase();
    },

    handleError: function (inMessage) {
        if (inMessage.message)
            inMessage = inMessage.message;
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});