enyo.kind({
    name: "biblez.main",
    kind: "FittableRows",
    fit: true,
    events: {
        onOpenModuleManager: "",
        onModuleChanged: "",
        onOpenBC: ""
    },
    published: {
        passage: ""
    },
    components:[
        //{kind: "Signals", onSwordReady: "getBible"},
        {name: "messagePopup", kind: "onyx.Popup", centered: true, floating: true, classes: "message-popup"},
        {kind: "onyx.MoreToolbar", components: [
            {kind: "onyx.MenuDecorator", onSelect: "moduleSelected", components: [
                {kind: "onyx.IconButton", src: "assets/modules.png"},
                {kind: "onyx.Menu", name: "moduleMenu"}
            ]},
            {kind: "onyx.Button", name: "btnPassage", ontap: "doOpenBC"}
            /*{kind: "onyx.InputDecorator", components: [
                {kind: "onyx.Input", placeholder: "Enter a passage...", onchange: "handlePassage", name: "passageInput", value: "Matt 1"}
            ]}*/
        ]},
        {kind: "enyo.Scroller", touch: true, fit: true, classes: "background", components: [
            {kind: "onyx.Spinner", name: "spinner", classes: "onyx-light"},
            {name: "main", classes: "nice-padding", allowHtml: true}
        ]},
        {kind: "onyx.MoreToolbar", components: [
            {kind: "onyx.IconButton", src: "assets/add.png", ontap: "doOpenModuleManager"},
            {kind: "onyx.Button", content: "Delete all Modules", ontap: "clearDB"}
            //{kind: "onyx.Button", content: "Install ESV", esv: true, ontap: "handleInstallTap"},
            //{kind: "Input", type: "file", onchange: "handleInstallTap"}
        ]}
    ],

    currentModule: null,
    currentPassage: "Matt 1",
    modules: [],

    create: function () {
        this.inherited(arguments);
        this.$.spinner.stop();
        this.getInstalledModules();
    },

    rendered: function () {
        this.inherited(arguments);
    },

    getInstalledModules: function (inSender, inEvent) {
        sword.moduleMgr.getModules(enyo.bind(this, function(inError, inModules) {
            if (!inError) {
                if(inModules.length !== 0) {
                    this.modules = inModules;
                    this.renderModuleMenu(this.modules);
                } else {
                    this.$.main.setContent($L("You have no modules installed. Tap on the '+' to install one!"));
                }
            } else {
                this.handleError(inError);
            }
        }));
    },

    renderModuleMenu: function (inModules) {
        if(!inModules)
            inModules = this.modules;
        var lastModule = api.get("lastModule");
        this.$.moduleMenu.destroyClientControls();
        var mods = [];
        this.modules.forEach(enyo.bind(this, function (mod, idx) {
            if ((lastModule && lastModule === mod.modKey)) {
                //mods.push({content: mod.config.moduleKey, index: idx, active: true, style: "background-color: lightblue"});
                mods.push({active: true, components: [
                    {content: mod.config.moduleKey, index: idx},
                    {kind: "onyx.IconButton", src: "assets/checkmark.png", style: "float: right;"}
                ]});
                this.currentModule = mod;
            } else
                mods.push({content: mod.config.moduleKey, index: idx});
        }));
        if(this.currentModule === null) {
            this.currentModule = this.modules[0];
            mods[0]["active"] = true;
        }
        this.$.moduleMenu.createComponents(mods, {owner: this.$.moduleMenu});
        this.$.moduleMenu.render();

        this.doModuleChanged({module: this.currentModule});
        this.handlePassage();
    },

    moduleSelected: function (inSender, inEvent) {
        //console.log(inEvent.originator.index);
        if (!isNaN(inEvent.originator.index)) {
            this.currentModule = this.modules[inEvent.originator.index];
            api.set("lastModule", this.currentModule.modKey);
            this.renderModuleMenu();
            //this.doModuleChanged({module: this.currentModule});
            //this.handlePassage();
        }
    },

    handleInstallTap: function (inSender, inEvent) {
        this.$.spinner.start();
        self = this;
        self.$.main.setContent("Installing Module...");
        var blob = "ESV.zip";
        if (!inSender.esv)
            blob = inEvent.target.files[0];
        sword.installMgr.installModule(blob, function (inError, inId) {
            //console.log(inError, inId);
            if(!inError)
                sword.moduleMgr.getModule(inId, function (inError, inModule) {
                    //console.log(inError, inModule);
                    self.currentModule = inModule;
                    self.$.spinner.stop();
                    if(!inError) {
                        self.$.main.setContent(enyo.json.stringify(inModule.config));
                        self.$.moduleLabel.setContent(inModule.config.moduleKey);
                    } else
                        this.handleError(inError);
                });
            else
                this.handleError(inError);
        });
    },

    clearDB: function () {
        sword.dataMgr.clearDatabase();
    },

    passageChanged: function (inSender, inEvent) {
        this.currentPassage = inEvent.book.abbrev + " " + inEvent.chapter;
        this.handlePassage(inEvent.osis);
    },

    handlePassage: function (passage) {
        //console.log("PASSAGE", inSender.getValue());
        if(!passage)
            passage = this.currentPassage;
        this.$.btnPassage.setContent(this.currentPassage);
        this.currentModule.renderText(passage, {oneVersePerLine: true}, enyo.bind(this, function (inError, inText) {
            console.log(inError);
            if(!inError)
                this.$.main.setContent(inText);
            else
                this.handleError(inError);
        }));
    },

    handleError: function (inMessage) {
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});
