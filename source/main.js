enyo.kind({
    name: "biblez.main",
    kind: "FittableRows",
    fit: true,
    events: {
        onOpenModuleManager: "",
        onOpenPreferences: "",
        onModuleChanged: "",
        onOpenBC: "",
        onOpenNotes: "",
        onOpenDataView: ""
    },
    published: {
        passage: ""
    },
    components:[
        {kind: "Signals", onOrientationChange: "handleOrientation"},
        {kind: "biblez.versePopup", name: "versePopup", onBookmark: "handleBookmark", onHighlight: "handleHighlight", onNoteTap: "handleNoteTap"},
        {name: "fontMenu", kind: "biblez.fontMenu", onFontSize: "handleFontSize", onFont: "handleFont"},
        {name: "notePopup", kind: "biblez.notePopup", onEdit: "handleNoteTap"},
        //{kind: "Signals", onbeforeunload: "handleUnload"},
        {name: "messagePopup", kind: "onyx.Popup", centered: true, floating: true, classes: "message-popup"},
        {name: "bcPopup", classes: "biblez-bc-popup", kind: "onyx.Popup", modal: true, floating: true, components: [
            {kind: "biblez.bcSelector", name: "bcSelector", onSelect: "passageChanged", onBack: "closePopup"}
        ]},
        {kind: "onyx.MoreToolbar", showing: false, name: "topTB", components: [
            {name: "moduleSelector", kind: "onyx.MenuDecorator", onSelect: "moduleSelected", components: [
                {kind: "onyx.Button", name: "btnModules", classes: "tb-button", style: "background-color: #934A15;"},
                {kind: "onyx.Menu", name: "moduleMenu"}
            ]},
            {kind: "onyx.Button", name: "btnPassage", classes: "tb-button", ontap: "handleBcSelector"},
            //{fit: true},
            {name: "actionSelector", kind: "onyx.MenuDecorator", onSelect: "actionSelected", components: [
                {kind: "onyx.IconButton", src: "assets/menu.png"},
                {kind: "onyx.Menu", name: "actionMenu", style: "width: 200px;", components: [
                    {action: "bookmarks", components: [
                        {kind: "onyx.IconButton", src: "assets/bookmarks.png"},
                        {content: $L("Bookmarks"), classes: "menu-label"}
                    ]},
                    {action: "notes", components: [
                        {kind: "onyx.IconButton", src: "assets/notes.png"},
                        {content: $L("Notes"), classes: "menu-label"}
                    ]},
                    {action: "highlights", components: [
                        {kind: "onyx.IconButton", src: "assets/highlights.png"},
                        {content: $L("Highlights"), classes: "menu-label"}
                    ]},
                    {classes: "onyx-menu-divider"},
                    {action: "moduleManager", components: [
                        {kind: "onyx.IconButton", src: "assets/add.png"},
                        {content: $L("Module Manager"), classes: "menu-label"}
                    ]},
                    {action: "preferences", components: [
                        {kind: "onyx.IconButton", src: "assets/settings.png"},
                        {content: $L("Preferences"), classes: "menu-label"}
                    ]}
                ]}
            ]},
            {name: "btFont", kind: "onyx.IconButton", src: "assets/font.png", ontap: "handleFontMenu", style:"position:absolute; right:0;"},
            //{name: "btnPrefs", kind:"onyx.IconButton", src: "assets/settings.png", ontap: "handlePrefs"},
            //{name: "plus", kind: "onyx.IconButton", src: "assets/add.png", style:"position:absolute;right:0;", ontap: "doOpenModuleManager"},
            /*{kind: "onyx.InputDecorator", components: [
                {kind: "onyx.Input", placeholder: "Enter a passage...", onchange: "handlePassage", name: "passageInput", value: "Matt 1"}
            ]}*/
        ]},
        {name: "mainPanel", kind: "Panels", fit: true, animate: false, ondragfinish: "handleChangeChapter", onTransitionStart: "handlePanelIndex", arrangerKind: "LeftRightArranger", margin: 0, classes: "background", components: [
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
            {name: "firstStart", classes: "center", style: "margin-top: 100px;", components: [
                {content: $L("You have no modules installed. Open the Module Manager to install one."), style: "font-weight: bold; margin-bottom: 20px;"},
                {kind: "onyx.Button", classes: "onyx-affirmative", content: $L("Open Module Manager"), ontap: "doOpenModuleManager"}
            ]}
        ]},
    ],

    currentModule: null,
    currentPassage: {
        osis: "Matt.1",
        label: "Matt 1"
    },
    userData: {},
    modules: [],
    panelIndex: 2,
    settings: {id: "settings"},

    create: function () {
        this.inherited(arguments);
        this.$.spinner.stop();
        this.startUp();
        this.$.mainPanel.setIndexDirect(2);
    },

    rendered: function () {
        this.inherited(arguments);
    },

    startUp: function () {
        api.get("settings", enyo.bind(this, function(inError, inSettings) {
            if(!inError) {
                this.settings = (inSettings) ? inSettings: this.settings;
                this.getInstalledModules();
                if(this.settings.fontSize) {
                    this.$.fontMenu.setFontSize(this.settings.fontSize);
                    this.$.main.applyStyle("font-size", this.settings.fontSize + "em");
                }
                if(this.settings.font) {
                    this.$.fontMenu.setFont(this.settings.font);
                    if(this.settings.font !== "default")
                        this.$.main.applyStyle("font-family", this.settings.font);
                }
            } else {
                this.handleError("Couldn't load settings!");
            }
        }));
    },

    handleSettings: function (inSender, inEvent) {
        api.get("settings", enyo.bind(this, function(inError, inSettings) {
            if(!inError) {
                this.settings = (inSettings) ? inSettings: this.settings;
                if(inEvent.setting === "linebreak")
                    this.handlePassage();
            } else {
                this.handleError("Couldn't load settings!");
            }
        }));
    },

    getInstalledModules: function (inSender, inEvent) {
        sword.moduleMgr.getModules(enyo.bind(this, function(inError, inModules) {
            if (!inError) {
                if(inModules.length !== 0) {
                    this.$.mainPanel.setIndex(2);
                    this.$.mainPanel.draggable = true;
                    this.$.topTB.show();
                    this.modules = inModules;
                    this.renderModuleMenu(this.modules);
                } else {
                    this.$.topTB.hide();
                    this.$.mainPanel.draggable = false;
                    this.$.mainPanel.setIndex(5);
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
            //BibleZ currently supports only Book.Chapter Osis passages in the mainView
            if(passage.split(".").length > 2) {
                passage = passage.slice(0, passage.lastIndexOf("."));
            }

            this.currentPassage.osis = passage.replace(" ", ".");
            this.currentPassage.label = passage.replace(".", " ");
        }

        //Persist current passage
        this.settings["lastRead"] = this.currentPassage;
        this.handleUnload();

        this.$.btnPassage.setContent(this.currentPassage.label);
        this.currentModule.renderText(this.currentPassage.osis, {oneVersePerLine: this.settings.linebreak ? this.settings.linebreak : false}, enyo.bind(this, function (inError, inText) {
            this.$.spinner.stop();
            if(!inError) {
                this.$.verseScroller.scrollToTop();
                this.$.main.setContent(inText);
                this.handleUserData(this.currentPassage.osis);
            } else
                this.handleError(inError.message);
        }));
    },

    handleUserData: function (inOsis) {
        var vmax = this.currentModule.getVersesInChapter(inOsis),
            hlKeys = [],
            noteKeys = [];
        api.getUserData(inOsis, vmax, enyo.bind(this, function (inError, inUserData) {
            if(!inError) {
                this.userData = inUserData;
                //console.log(this.userData);
                Object.keys(inUserData).forEach(function (key) {
                    if(inUserData[key].bookmarkId && !enyo.dom.byId("img"+key)) {
                        enyo.dom.byId(key).insertAdjacentHTML("beforeend", " <img id='img" + key + "' src='assets/bookmark.png' />");
                    }
                    if(inUserData[key].highlightId) {
                        hlKeys.push(inUserData[key].highlightId);
                    }
                    if(inUserData[key].noteId) {
                        noteKeys.push(inUserData[key].noteId);
                    }
                });
                if (hlKeys.length !== 0) {
                    api.getHighlights(hlKeys, enyo.bind(this, function (inError, inHighlights) {
                        if(!inError) {
                            inHighlights.forEach(enyo.bind(this, function (hl) {
                                enyo.dom.byId(hl.osisRef).style.backgroundColor = hl.color;
                            }));
                        } else
                            this.handleError(inError);
                    }));
                }
                if (noteKeys.length !== 0) {
                    api.getNotes(noteKeys, enyo.bind(this, function (inError, inNotes) {
                        if(!inError) {
                            inNotes.forEach(enyo.bind(this, function (note) {
                                if(!enyo.dom.byId("note"+note.osisRef))
                                    enyo.dom.byId(note.osisRef).insertAdjacentHTML("beforeend", " <a href=?type=note&osisRef=" + note.osisRef + "&id=" + note.id + " id='note" + note.osisRef + "'><img src='assets/note.png' /></a>");
                            }));
                        } else
                            this.handleError(inError);
                    }));
                }
            }
        }));

    },

    handleBookmark: function (inSender, inEvent) {
        if(inEvent.action === "remove") {
            var oldBmImg = enyo.dom.byId("img"+inEvent.osisRef);
            oldBmImg.parentNode.removeChild(oldBmImg);
        }
        this.handleUserData(this.currentPassage.osis);
    },

    handleHighlight: function (inSender, inEvent) {
        if(inEvent.action === "remove") {
            enyo.dom.byId(inEvent.osisRef).style.backgroundColor = "transparent";
        }
        this.handleUserData(this.currentPassage.osis);
    },

    handleNoteTap: function (inSender, inEvent) {
        //console.log(inEvent);
        if (this.userData[inEvent.osisRef] && this.userData[inEvent.osisRef].noteId !== undefined)
            inEvent["noteId"] = this.userData[inEvent.osisRef].noteId;
        this.doOpenNotes(inEvent);
    },

    handleNote: function (inSender, inEvent) {
        //console.log("handleNote", inEvent);
        if(inEvent.action === "remove") {
            var oldNoteImg = enyo.dom.byId("note"+inEvent.osisRef);
            oldNoteImg.parentNode.removeChild(oldNoteImg);
        }
        this.handleUserData(this.currentPassage.osis);
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

    handleFontMenu: function (inSender, inEvent) {
        this.$.fontMenu.showAtEvent(inEvent);
    },

    handleFont: function (inSender, inEvent) {
        this.$.main.applyStyle("font-family", inEvent.font);
        api.putSetting("font", inEvent.font);
    },

    handleFontSize: function (inSender, inEvent) {
        if(inEvent.font !== "default")
            this.$.main.applyStyle("font-size", inEvent.fontSize + "em");
        else
            this.$.main.applyStyle("font-size", null);
        api.putSetting("fontSize", inEvent.fontSize);
    },

    handleChangeChapter: function (inSender, inEvent) {
        if(this.$.mainPanel.getIndex() !== 5) {
            if(this.currentModule) {
                if(this.panelIndex === 1) {
                    this.handlePassage(sword.verseKey.previous(this.currentPassage.osis, this.currentModule.config.Versification).osis);
                } else if(this.panelIndex === 3) {
                    this.handlePassage(sword.verseKey.next(this.currentPassage.osis, this.currentModule.config.Versification).osis);
                }
            }
            this.$.mainPanel.setIndexDirect(2);
        }
    },

    handleVerseTap: function (inSender, inEvent) {
        inEvent.preventDefault();
        var attributes = {};
        //console.log(inEvent);
        if(inEvent.target.href || inEvent.target.parentNode.href) {
            var url = inEvent.target.href || inEvent.target.parentNode.href;
            url.split("?")[1].split("&").forEach(function(item) {
                item = item.split("=");
                attributes[item[0]] = item[1];
            });
        }
        if(attributes.type === "verseNum") {
            this.$.versePopup.setOsisRef(attributes.osisRef);
            if(this.userData.hasOwnProperty(attributes.osisRef)) {
                if (this.userData[attributes.osisRef].bookmarkId) {
                    this.$.versePopup.setBmExists(true);
                    this.$.versePopup.setBmId(this.userData[attributes.osisRef].bookmarkId);
                } else
                    this.$.versePopup.setBmExists(false);
                if (this.userData[attributes.osisRef].highlightId) {
                    this.$.versePopup.setHlExists(true);
                    this.$.versePopup.setHlId(this.userData[attributes.osisRef].highlightId);
                } else
                    this.$.versePopup.setHlExists(false);
                if (this.userData[attributes.osisRef].noteId) {
                    this.$.versePopup.setNoteExists(true);
                    this.$.versePopup.setNoteId(this.userData[attributes.osisRef].noteId);
                } else {
                    this.$.versePopup.setNoteExists(false);
                    this.$.versePopup.setNoteId(null);
                }
            } else {
                this.$.versePopup.setBmExists(false);
                this.$.versePopup.setHlExists(false);
                this.$.versePopup.setNoteExists(false);
                this.$.versePopup.setNoteId(null);
            }
            this.$.versePopup.setLabels();
            this.$.versePopup.showAtEvent(inEvent);
        } else if (attributes.type === "note") {
            api.getNote(parseInt(attributes.id, 10), enyo.bind(this, function (inError, inNote) {
                if(!inError) {
                    this.$.notePopup.setText(inNote.text);
                    this.$.notePopup.setOsisRef(inNote.osisRef);
                    this.$.notePopup.showAtEvent(inEvent);
                } else
                    this.handleError(inError);
            }));
        }
        return true;
    },

    /*Action Menu*/
    actionSelected: function (inSender, inEvent) {
        if(inEvent.originator.action === "moduleManager")
            this.doOpenModuleManager();
        else if(inEvent.originator.action === "preferences")
            this.doOpenPreferences();
        else
            this.doOpenDataView({section: inEvent.originator.action});
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
