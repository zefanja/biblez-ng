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
        {kind: "biblez.versePopup", name: "versePopup"},
        //{kind: "Signals", onbeforeunload: "handleUnload"},
        {name: "messagePopup", kind: "onyx.Popup", centered: true, floating: true, classes: "message-popup"},
        {kind: "onyx.MoreToolbar", name: "topTB", components: [
            {name: "moduleSelector", kind: "onyx.MenuDecorator", onSelect: "moduleSelected", components: [
                //{kind: "onyx.IconButton", src: "assets/modules.png"},
                {kind: "onyx.Button", name: "btnModules", style: "background-color: #934A15;"},
                {kind: "onyx.Menu", name: "moduleMenu"}
            ]},
            {kind: "onyx.Button", name: "btnPassage", ontap: "handleBcSelector"},
            {fit: true},
            {name: "plus", kind: "onyx.IconButton", src: "assets/add.png", style:"position:absolute;right:0;", ontap: "doOpenModuleManager"},
            {name: "bcPopup", classes: "biblez-bc-popup", kind: "onyx.Popup", modal: true, floating: true, components: [
                {kind: "biblez.bcSelector", name: "bcSelector", onSelect: "passageChanged", onBack: "closePopup"}
            ]}
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
                {name: "main", classes: "verse-view", allowHtml: true, onclick: "handleVerseTap"}
            ]},
            {kind: "FittableColumns", noStretch: true, components: [
                {content: "Next >", classes: "chapter-nav chapter-nav-right"},
                {fit: true}
            ]},
            {},
        ]},
    ],

    currentModule: null,
    currentPassage: {
        osis: "Matt.1",
        label: "Matt 1"
    },
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
                    this.$.moduleSelector.show();
                    this.$.btnPassage.show();
                    this.modules = inModules;
                    this.renderModuleMenu(this.modules);
                } else {
                    this.$.moduleSelector.hide();
                    this.$.btnPassage.hide();
                    this.$.main.setContent("<center>" + $L("You have no modules installed. Tap on the '+' to install one!" + "</center>"));
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
                this.$.btnModules.setContent(lastModule);
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
            this.$.btnModules.setContent(this.currentModule.modKey);
        }
        this.$.moduleMenu.createComponents(mods, {owner: this.$.moduleMenu});
        this.$.moduleMenu.render();

        this.doModuleChanged({module: this.currentModule});
        if(enyo.platform.firefox)
            this.$.bcSelector.setModule(this.currentModule);

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
            this.handleUnload();
            this.renderModuleMenu();
        }
    },

    passageChanged: function (inSender, inEvent) {
        this.$.bcPopup.hide();
        this.currentPassage.osis = inEvent.osis;
        this.currentPassage.label = inEvent.label;
        this.handlePassage();
    },

    handlePassage: function (passage) {
        //console.log("PASSAGE", passage, this.currentPassage);
        this.$.main.setContent("");
        this.$.spinner.start();

        if (typeof passage === "string") {
            this.currentPassage.osis = passage.replace(" ", ".");
            this.currentPassage.label = passage.replace(".", " ");
        }

        //Persist current passage
        this.settings["lastRead"] = this.currentPassage;
        this.handleUnload();

        this.$.btnPassage.setContent(this.currentPassage.label);
        this.currentModule.renderText(this.currentPassage.osis, {oneVersePerLine: true}, enyo.bind(this, function (inError, inText) {
            this.$.spinner.stop();
            if(!inError) {
                this.$.verseScroller.scrollToTop();
                this.$.main.setContent(inText);
            } else
                this.handleError(inError.message);
        }));
        this.handleBookmarks(this.currentPassage.osis);
        //console.log();
        /*api.getAll(function (inError, inAll) {
            console.log(inAll);
        });
        api.getAllBookmarks(function (inError, inBookmarks) {
            console.log(inBookmarks);
        });*/
    },

    handleBookmarks: function (inOsis) {
        this.currentModule.getVersesInChapter(inOsis);

    },

    handleBcSelector: function (inSender, inEvent) {
        if(enyo.platform.firefox) {
            this.$.bcPopup.showAtEvent(inEvent);
            //this.$.bcSelector.setPanel(0);
        } else
            this.doOpenBC();
    },

    closePopup: function (inSender, inEvent) {
        this.$.bcPopup.hide();
    },

    handleChangeChapter: function (inSender, inEvent) {
        if(this.currentModule) {
            if(this.panelIndex === 1) {
                this.handlePassage(sword.verseKey.previous(this.currentPassage.osis, this.currentModule.config.Versification).osis);
            } else if(this.panelIndex === 3) {
                this.handlePassage(sword.verseKey.next(this.currentPassage.osis, this.currentModule.config.Versification).osis);
            }
        }
        this.$.mainPanel.setIndexDirect(2);
    },

    handleVerseTap: function (inSender, inEvent) {
        inEvent.preventDefault();
        var attributes = {};
        if(inEvent.target.href) {
            var url = inEvent.target.href;
            url.split("?")[1].split("&").forEach(function(item) {
                item = item.split("=");
                attributes[item[0]] = item[1];
            });
        }
        if(attributes.type === "verseNum") {
            this.$.versePopup.setOsisRef(attributes.osisRef);
            this.$.versePopup.showAtEvent(inEvent);
        }

        return true;
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
        api.put(this.settings);
    },

    handleError: function (inMessage) {
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});
