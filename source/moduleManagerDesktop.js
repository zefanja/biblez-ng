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
        {kind: "enyo.Scroller", fit: true, classes: "center settings-container", components: [
            {content: $L("Download a zipped module from one of the following repositories:")},
            {allowHtml: true, content: "<ul><li><a target='_blank' href='http://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles'>CrossWire Main</a></li>" +
                                        "<li><a target='_blank' href='http://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles&av=true'>CrossWire av11n</a></li>" +
                                        "<li><a target='_blank' href='http://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles&beta=true'>CrossWire Beta</a></li></ul>"
            },
            {content: $L("To install the module, select the module file!")},
            {kind: "onyx.Input", type: "file", id: "files", name: "files[]", onchange: "installModule"},
            {tag: "br"},
            {kind: "onyx.Spinner", name: "spinner", showing: false, classes: "onyx-light center"},
            {tag: "br"},
            {name: "gbModules", showing: false, kind: "onyx.Groupbox", components: [
                {kind: "onyx.GroupboxHeader", content: $L("Installed Modules")},
                {name: "moduleList", kind: "Repeater", count: 0, onSetupItem: "setupModules", components: [
                    {kind: "enyo.FittableColumns", classes: "settings-row item", components: [
                        {name: "moduleName", style: "line-height: 35px;", fit: true},
                        {name: "btRemove", modKey: null, kind: "onyx.Button", content: "Remove", classes: "onyx-negative", ontap: "handleRemove"}
                    ]}
                ]}
            ]},
            {tag: "br"},
            {kind: "onyx.Button", name: "btDeleteAll", content: "Delete all modules!", classes: "onyx-negative", style: "margin: 3px;", ontap: "deleteModules"},
        ]}
    ],

    modules: [],

    rendered: function () {
        this.inherited(arguments);
        this.getModules();
    },

    getModules: function () {
        sword.moduleMgr.getModules(enyo.bind(this, function(inError, inModules) {
            if (!inError) {
                if(inModules.length !== 0) {
                    this.$.gbModules.show();
                    this.$.btDeleteAll.show();
                } else if (inModules.length === 0) {
                    this.$.gbModules.hide();
                    this.$.btDeleteAll.hide();
                }
                this.modules = inModules;
                this.$.moduleList.setCount(this.modules.length);
            } else {
                this.handleError(inError);
            }
        }));
    },

    handleBack: function() {
        this.doBack();
    },

    installModule: function (inSender, inEvent) {
        this.$.spinner.start();
        sword.installMgr.installModule(inEvent.target.files[0], enyo.bind(this, function (inError, inModule) {
            if (!inError) {
                this.doInstalled();
                this.getModules();
                this.$.spinner.stop();
                this.handleError("Installed Module!");
            } else {
                this.handleError((inError.message) ? inError.message : inError);
            }
        }));
    },

    setupModules: function (inSender, inEvent) {
        var index = inEvent.index;
        var item = inEvent.item;
        item.$.moduleName.setContent(this.modules[index].modKey);
        item.$.btRemove.modKey = this.modules[index].modKey;
        return true;
    },

    handleRemove: function (inSender, inEvent) {
        if(inEvent.originator && inEvent.originator.modKey) {
            inEvent.originator.setDisabled(true);
            sword.installMgr.removeModule(inEvent.originator.modKey, enyo.bind(this, function (inError) {
                if(!inError) {
                    this.doInstalled();
                    this.getModules();
                } else {
                    inEvent.originator.setDisabled(false);
                    this.handleError(inError);
                }
            }));
        }
        return true;
    },

    handleError: function (inMessage) {
        if (inMessage.message)
            inMessage = inMessage.message;
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    },

    deleteModules: function () {
        sword.dataMgr.clearDatabase();
    },
});