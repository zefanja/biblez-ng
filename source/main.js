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
        {kind: "Signals", onOrientationChange: "handleOrientation"},
        {kind: "Signals", onbeforeunload: "handleUnload"},
        {name: "messagePopup", kind: "onyx.Popup", centered: true, floating: true, classes: "message-popup"},
        {kind: "onyx.MoreToolbar", name: "topTB", components: [
            {kind: "onyx.MenuDecorator", onSelect: "moduleSelected", components: [
                {kind: "onyx.IconButton", src: "assets/modules.png"},
                {kind: "onyx.Menu", name: "moduleMenu"}
            ]},
            {kind: "onyx.Button", name: "btnPassage", ontap: "doOpenBC"},
            {fit: true},
            {kind: "onyx.IconButton", src: "assets/add.png", ontap: "doOpenModuleManager"}
            /*{kind: "onyx.InputDecorator", components: [
                {kind: "onyx.Input", placeholder: "Enter a passage...", onchange: "handlePassage", name: "passageInput", value: "Matt 1"}
            ]}*/
        ]},
        {name: "mainPanel", kind: "Panels", fit: true, ondragfinish: "handleChangeChapter", onTransitionStart: "handlePanelIndex", arrangerKind: "LeftRightArranger", margin: 0, classes: "background", components: [
            {},
            {kind: "FittableColumns", noStretch: true, components: [
                {fit: true},
                {content: "< Previous", classes: "chapter-nav chapter-nav-left"}
            ]},
            {name: "verseScroller", kind: "enyo.Scroller", touch: true, fit: true, components: [
                {classes: "center", components: [{kind: "onyx.Spinner", name: "spinner", classes: "onyx-light center"}]},
                {name: "main", classes: "nice-padding", allowHtml: true}
            ]},
            {kind: "FittableColumns", noStretch: true, components: [
                {content: "Next >", classes: "chapter-nav chapter-nav-right"},
                {fit: true}
            ]},
            {},
        ]},
        /*{kind: "onyx.MoreToolbar", components: [
            {kind: "onyx.IconButton", src: "assets/add.png", ontap: "doOpenModuleManager"}
            //{kind: "onyx.Button", content: "Install ESV", esv: true, ontap: "handleInstallTap"},
            //{kind: "Input", type: "file", onchange: "handleInstallTap"}
        ]}*/
    ],

    currentModule: null,
    currentPassage: "Matt 1",
    modules: [],
    panelIndex: 2,
    settings: {id: "settings"},

    create: function () {
        this.inherited(arguments);
        this.$.spinner.stop();
        api.get("settings", enyo.bind(this, function(inError, inSettings) {
            //console.log("create", inSettings, this.settings, inError);
            if(!inError) {
                this.settings = (inSettings) ? inSettings: this.settings;
                this.getInstalledModules();
            } else {
                this.handleError("Couldn't load settings!");
            }
        }));
        this.$.mainPanel.setIndexDirect(2);
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
        if(this.settings)
            var lastModule = this.settings.lastModule;
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

        //Load the verses
        if(this.settings)
            this.currentPassage = (this.settings.lastRead) ? this.settings.lastRead : this.currentPassage;
        this.handlePassage();
    },

    moduleSelected: function (inSender, inEvent) {
        //console.log(inEvent.originator.index, this.settings);
        if (!isNaN(inEvent.originator.index)) {
            this.currentModule = this.modules[inEvent.originator.index];
            this.settings["lastModule"] = this.currentModule.modKey;
            console.log(this.settings);
            this.handleUnload();
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

    passageChanged: function (inSender, inEvent) {
        this.currentPassage = inEvent.book.abbrev + " " + inEvent.chapter;
        this.handlePassage(inEvent.osis);
    },

    handlePassage: function (passage) {
        //console.log("PASSAGE", inSender.getValue());
        this.$.main.setContent("");
        this.$.spinner.start();

        this.currentPassage = (!passage) ? this.currentPassage : passage;
        console.log(this.currentPassage);

        //Persist current passage
        this.settings["lastRead"] = this.currentPassage;
        this.handleUnload();

        this.$.btnPassage.setContent(this.currentPassage.replace(".", " "));
        this.currentModule.renderText(this.currentPassage, {oneVersePerLine: true}, enyo.bind(this, function (inError, inText) {
            this.$.spinner.stop();
            if(!inError) {
                this.$.verseScroller.scrollToTop();
                this.$.main.setContent(inText);
            } else
                this.handleError(inError.message);
        }));
    },

    handleChangeChapter: function (inSender, inEvent) {
        if(this.currentModule) {
            if(this.panelIndex === 1) {
                this.handlePassage(sword.verseKey.previous(this.currentPassage, this.currentModule.config.Versification).osis);
            } else if(this.panelIndex === 3) {
                this.handlePassage(sword.verseKey.next(this.currentPassage, this.currentModule.config.Versification).osis);
            }
        }
        this.$.mainPanel.setIndexDirect(2);
    },

    handlePanelIndex: function (inSender, inEvent) {
        this.panelIndex = inEvent.toIndex;
    },

    handleOrientation: function (inSender, inEvent) {
        var orientation = screen.mozOrientation;
        if (orientation === "portrait-primary" || orientation === "portrait-secondary" ) {
            this.$.topTB.show();
        }
        else if (orientation === "landscape-primary" || orientation === "landscape-secondary" ) {
            this.$.topTB.hide();
        }
    },

    handleUnload: function (inSender, inEvent) {
        console.log("unload", this.settings);
        api.put(this.settings);
    },

    handleError: function (inMessage) {
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});
