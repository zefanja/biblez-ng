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
        onOpenDataView: "",
        onOpenAbout: ""
    },
    published: {
        passage: ""
    },
    components:[
        //{kind: "Signals", onOrientationChange: "handleOrientation"},
        {kind: "biblez.versePopup", name: "versePopup", onBookmark: "handleBookmark", onHighlight: "handleHighlight", onNoteTap: "handleNoteTap"},
        {name: "fontMenu", kind: "biblez.fontMenu", onFontSize: "handleFontSize", onFont: "handleFont"},
        {name: "notePopup", kind: "biblez.notePopup", onEdit: "handleNoteTap"},
        {name: "footnotePopup", kind: "biblez.footnotePopup"},
        {name: "messagePopup", kind: "onyx.Popup", centered: true, floating: true, classes: "message-popup"},
        {name: "bcPopup", classes: "biblez-bc-popup", kind: "onyx.Popup", modal: true, floating: true},
        {name: "stuffPopup", classes: "biblez-notes-popup onyx-light", kind: "onyx.Popup", scrim: true, autoDismiss: false, modal: true, floating: true, centered: true},
        {kind: "enyo.FittableColumns", fit: true, name: "mainView", components: [
            {kind: "enyo.FittableRows", fit: true, components: [
                {kind: "onyx.Toolbar", showing: false, classes: "main-toolbar", noStretch: true, name: "topTB", layoutKind: "FittableColumnsLayout", components: [
                    {name: "moduleSelector", kind: "onyx.MenuDecorator", onSelect: "moduleSelected", components: [
                        {kind: "onyx.Button", name: "btnModules", classes: "tb-button", style: "background-color: #934A15;"},
                        {kind: "onyx.Menu", maxHeight: "300", name: "moduleMenu", style: "width: 250px;"}
                    ]},
                    {kind: "onyx.Button", name: "btnPassage", classes: "tb-button", ontap: "handleBcSelector"},
                    {name: "historySelector", kind: "onyx.MenuDecorator", onSelect: "historySelected", components: [
                        //Clock Icon by Thomas Le Bas from The Noun Project
                        {kind: "onyx.IconButton", name: "btnHistory", src: "assets/history.png"},
                        {kind: "onyx.Menu", maxHeight: "300", name: "historyMenu"}
                    ]},
                    {fit: true},
                    {classes: "toolbar-spinner", name: "tbSpinner", showing: false},
                    {name: "actionSelector", kind: "onyx.MenuDecorator", onSelect: "actionSelected", components: [
                        {kind: "onyx.IconButton", src: "assets/menu.png"},
                        {kind: "onyx.Menu", name: "actionMenu", maxHeight: "400", style: "width: 200px;", components: [
                            {action: "bookmarks", classes: "menu-item", components: [
                                {kind: "onyx.IconButton", src: "assets/bookmarks.png"},
                                {content: $L("Bookmarks"), classes: "menu-label"}
                            ]},
                            {action: "notes", classes: "menu-item", components: [
                                {kind: "onyx.IconButton", src: "assets/notes.png"},
                                {content: $L("Notes"), classes: "menu-label"}
                            ]},
                            {action: "highlights", classes: "menu-item", components: [
                                {kind: "onyx.IconButton", src: "assets/highlights.png"},
                                {content: $L("Highlights"), classes: "menu-label"}
                            ]},
                            {classes: "onyx-menu-divider"},
                            {action: "moduleManager", classes: "menu-item", components: [
                                {kind: "onyx.IconButton", src: "assets/add.png"},
                                {content: $L("Module Manager"), classes: "menu-label"}
                            ]},
                            {action: "preferences", classes: "menu-item", components: [
                                {kind: "onyx.IconButton", src: "assets/settings.png"},
                                {content: $L("Preferences"), classes: "menu-label"}
                            ]},
                            {action: "font", classes: "menu-item", components: [
                                {kind: "onyx.IconButton", src: "assets/font.png"},
                                {content: $L("Font"), classes: "menu-label"}
                            ]},
                            {action: "about", classes: "menu-item", components: [
                                {kind: "onyx.IconButton", src: "assets/info.png"},
                                {content: $L("About"), classes: "menu-label"}
                            ]}
                        ]}
                    ]},
                    //{name: "btFont", kind: "onyx.IconButton", src: "assets/font.png", ontap: "handleFontMenu"}
                ]},
                {name: "mainPanel", kind: "Panels", draggable: false, /*index: 2, */fit: true, ondragfinish: "handleChangeChapter", onTransitionStart: "handlePanelIndex", arrangerKind: "LeftRightArranger", margin: 0, classes: "background", components: [
                    {name: "verseList", kind: "VerseList", thumb: false, touchOverscroll: false, count: 0, onSetupItem: "setVerses", onScroll: "handleOnScroll", classes: "enyo-selectable", components: [
                        {name: "text", allowHtml: true, style: "display: inline;", ontap: "handleVerseTap", onclick: "handleVerseTap"},
                        {name: "imgBm", tag: "img", style: "display: inline;", showing: false, src: "assets/bookmark.png"},
                        {name: "imgNote", content: "", allowHtml: true, style: "display: inline; margin: 0 3px;", showing: false, ontap: "handleVerseTap", onclick: "handleVerseTap"}
                    ]}
                ]}
            ]},
            {name: "sidebar", content: "", classes: "sidebar", showing: false, style: "width: 320px;"}
        ]}
    ],

    currentModule: null,
    passage: {
        osisRef: "Matt.1",
        label: "Matt 1",
        chapter: 1
    },
    userData: {},
    modules: [],
    history: [],
    panelIndex: 2,
    settings: {id: "settings"},
    footnotes: {},
    verses: [],
    reachedTop: false,
    reachedBottom: false,
    offset: 0,
    rowSize: 0,
    hasVerseNumber: 0,
    timer: null,

    create: function () {
        this.inherited(arguments);
        this.startUp();

        //improve scrolling performance on Android
        if(this.$.verseList.getStrategy().get("kind") === "TranslateScrollStrategy")
            this.$.verseList.getStrategy().set("translateOptimized", true);

    },

    startUp: function () {
        api.get("settings", enyo.bind(this, function(inError, inSettings) {
            if(!inError) {
                this.settings = (inSettings) ? inSettings: this.settings;
                //console.log(this.settings);
                this.getInstalledModules();
                if(this.settings.fontSize) {
                    this.$.fontMenu.setFontSize(this.settings.fontSize);
                    this.$.verseList.applyStyle("font-size", this.settings.fontSize + "em");
                }
                if(this.settings.font) {
                    this.$.fontMenu.setFont(this.settings.font);
                    if(this.settings.font !== "default")
                        this.$.verseList.applyStyle("font-family", this.settings.font);
                }
                if(this.settings.history)
                    this.history = this.settings.history;
            } else {
                //console.log(inError);
                this.handleError("Couldn't load settings!");
            }
        }));
    },

    handleSettings: function (inSender, inEvent) {
        api.get("settings", enyo.bind(this, function(inError, inSettings) {
            if(!inError) {
                this.settings = (inSettings) ? inSettings: this.settings;
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
                    this.$.mainPanel.selectPanelByName("verseList");
                    this.$.mainPanel.draggable = true;
                    this.$.topTB.show();
                    this.modules = inModules;
                    this.renderModuleMenu(this.modules);
                    if(this.$.firstStart) {
                        this.$.firstStart.destroy();
                        this.$.endPlaceholder.destroy();
                    }
                } else {
                    this.$.topTB.hide();
                    this.$.mainPanel.draggable = false;
                    this.$.mainPanel.createComponent({name: "firstStart", classes: "center", style: "margin-top: 20px;", components: [
                                                            {tag: "img", src: "assets/biblez128.png", style: "margin: 20px;"},
                                                            {content: $L("You have no modules installed. Open the Module Manager to install one."), style: "font-weight: bold; margin-bottom: 20px;"},
                                                            {kind: "onyx.Button", classes: "onyx-affirmative", content: $L("Open Module Manager"), ontap: "doOpenModuleManager"}
                                                        ]}, {owner: this}).render();
                    this.$.mainPanel.createComponent({name: "endPlaceholder"}, {owner: this}).render();
                    this.$.mainPanel.selectPanelByName("firstStart");
                    this.$.mainPanel.resized();
                }
                this.resized();
            } else {
                this.handleError(inError);
            }
        }));
    },

    renderModuleMenu: function (inModules, inRenderAgain) {
        var lastModule = null;
        if(!inModules)
            inModules = this.modules;
        if(this.settings.lastModule)
            lastModule = this.settings.lastModule;


        this.$.moduleMenu.destroyClientControls();
        var mods = [];
        this.currentModule = null;

        this.modules.forEach(enyo.bind(this, function (mod, idx) {
            if ((lastModule && lastModule === mod.modKey)) {
                this.$.btnModules.setContent(lastModule);
                mods.push({classes: "menu-modules-item", index: idx, active: true, components: [
                    {kind: "onyx.IconButton", src: "assets/checkmark.png", style: "float: right;"},
                    {content: mod.config.moduleKey, index: idx},
                    {tag: "br"},
                    {content: mod.config.description, classes: "menu-module-title", index: idx}

                ]});
                this.currentModule = mod;
            } else
                mods.push({classes: "menu-modules-item", index: idx, components: [
                    {content: mod.config.moduleKey, index: idx},
                    {tag: "br"},
                    {content: mod.config.description, classes: "menu-module-title", index: idx}
                ]});
        }));
        if(this.currentModule === null) {
            this.currentModule = this.modules[0];
            mods[0]["active"] = true;
            mods[0]["components"] = [
                {kind: "onyx.IconButton", src: "assets/checkmark.png", style: "float: right;"},
                {content: this.currentModule.modKey, index: 0},
                {tag: "br"},
                {content: this.currentModule.config.description, classes: "menu-module-title", index: 0}
            ];
            mods[0]["classes"] = "menu-modules-item";
            mods[0]["index"] = 0;
            this.$.btnModules.setContent(this.currentModule.modKey);
            this.settings["lastModule"] = this.currentModule.modKey;
        }

        this.$.moduleMenu.createComponents(mods, {owner: this.$.moduleMenu});
        this.$.moduleMenu.render();
        this.doModuleChanged({module: this.currentModule});

        //Load the verses
        if(this.passage === this.settings.lastRead || !this.settings.lastRead) {
            api.put(this.settings);
            this.handlePassage(this.passage);
        }
        if(this.settings)
            this.setPassage((this.settings.lastRead) ? this.settings.lastRead : this.passage);

    },

    moduleSelected: function (inSender, inEvent) {
        //console.log(inEvent.originator.index, inEvent);
        if (!isNaN(inEvent.originator.index)) {
            this.currentModule = this.modules[inEvent.originator.index];
            this.settings["lastModule"] = this.currentModule.modKey;
            //api.putSetting("lastModule", this.currentModule.modKey);
            this.renderModuleMenu();
        }
    },

    handleModuleTree: function (inSender, inEvent) {
        this.currentModule = inEvent.module;
        this.settings["lastModule"] = this.currentModule.modKey;
        this.renderModuleMenu(null, false);
    },

    passageChanged: function (inSender, inEvent) {
        //console.log("passageChanged: ", inEvent);
        if(this.$.bcSelector)
            this.$.bcPopup.destroyClientControls();
        this.$.bcPopup.hide();
        if (!inEvent.offsetRef) {
            delete inEvent.originator;
            delete inEvent.delegate;
            delete inEvent.type;
            this.passage = inEvent;
        } else {
            if (inEvent.offsetRef.hasOwnProperty("osisRef"))
                this.passage = inEvent.offsetRef;
            else {
                inOsis = (inEvent.offsetRef.split(".").length > 2) ? inEvent.offsetRef.slice(0, inEvent.offsetRef.lastIndexOf(".")): inEvent.offsetRef;
                this.passage = {
                    osisRef: inOsis,
                    label: inOsis.replace(".", " "),
                    chapter: parseInt(inOsis.split(".")[1], 10)
                };
            }

        }

        //Persist current passage
        if ((this.settings.lastRead && this.passage.osisRef !== this.settings.lastRead.osisRef) || !this.settings.lastRead) {
            this.addToHistory(this.passage);
            this.renderHistory();
            this.settings["lastRead"] = this.passage;
            api.put(this.settings);
            this.$.btnPassage.setContent((this.passage.label) ? this.passage.label : api.formatOsis(this.passage.osisRef));
            //Adjust the TB Icons
            this.$.topTB.resized();
        }

        //console.log(!this.reachedBottom && !this.reachedTop && !inEvent.offsetRef, this.reachedBottom, this.reachedTop, inEvent.offsetRef)
        if (!this.reachedBottom && !this.reachedTop && !inEvent.offsetRef) {
            this.handlePassage(this.passage);
        }

        return true;
    },

    handlePassage: function (inOsis, inEvent) {
        //console.log("handlePassage", inOsis, inEvent, this.passage);
        this.verses = [];
        this.$.verseList.setCount(this.verses.length);
        this.$.verseList.refresh();

        var verseNumber = this.passage.verseNumber ? this.passage.verseNumber : 0;

        if (typeof inOsis === "string" || (inEvent && inEvent.osisRef && !inEvent.label && !inEvent.chapter)) {
            //BibleZ currently supports only Book.Chapter Osis passages in the mainView
            inOsis = (inEvent && inEvent.osisRef) ? inEvent.osisRef : inOsis;
            if(inOsis.split(".").length > 2) {
                verseNumber = parseInt(inOsis.slice(inOsis.lastIndexOf(".")+1, inOsis.length), 10);
                inOsis = inOsis.slice(0, inOsis.lastIndexOf("."));
            } else
                verseNumber = 0;

            this.passage = {
                osisRef: inOsis,
                label: inOsis.replace(".", " "),
                chapter: parseInt(inOsis.split(".")[1], 10)
            };
            this.settings["lastRead"] = this.passage;
            api.put(this.settings);
        }

        this.$.btnPassage.setContent((this.passage.label) ? this.passage.label : api.formatOsis(this.passage.osisRef));
        this.loadText(this.passage.osisRef, enyo.bind(this, function (inError, inResult) {
            if(!inError) {
                this.footnotes = inResult.footnotes;
                this.verses = inResult.verses;
                var caps = "";
                if(inResult.rtol) {
                    this.$.verseList.applyStyle("text-align", "right");
                    caps = "<br><div class='caps-rtol'>" + this.passage.chapter + "</div>";
                } else {
                    this.$.verseList.applyStyle("text-align", "left");
                    caps = "<br><div class='caps'>" + this.passage.chapter + "</div>";
                }
                this.handleUserData(this.passage.osisRef);
                this.verses.unshift({osisRef: this.passage.osisRef, text: caps});
                this.$.verseList.setCount(this.verses.length);
                this.$.verseList.refresh();
                if (verseNumber === 0) {
                    this.$.verseList.scrollToStart();
                    this.hasVerseNumber = 0;
                } else {
                    this.$.verseList.scrollToRow(verseNumber+1);
                    this.hasVerseNumber = verseNumber+1;
                }
            } else {
                this.handleError(inError.message);
            }
        }));

        //Render History Menu
        this.renderHistory();
        return true;
    },

    setVerses: function (inSender, inEvent) {
        var index = inEvent.index;
        var item = this.verses[index];
        this.$.text.setContent(item.text);
        //Bookmarks
        if(item.bookmark)
            this.$.imgBm.show();
        else
            this.$.imgBm.hide();
        //Notes
        if(item.note) {
            this.$.imgNote.setContent("<a href='?type=note&osisRef=" + item.osisRef + "&noteId=" + item.noteId + "'><img src='assets/note.png'></a>");
            this.$.imgNote.show();
        } else
            this.$.imgNote.hide();
        //Highlights
        if(item.highlight)
            this.$.text.applyStyle("background-color", item.color);
        else
            this.$.text.applyStyle("background-color", "none");

        return true;
    },

    renderHistory: function (inSender, inEvent) {
        this.$.historyMenu.destroyClientControls();
        var hisItems = [];
        this.history.forEach(enyo.bind(this, function (item, idx) {
            if(item.osisRef)
                hisItems.push({content: api.formatOsis(item.osisRef), index: idx, osisRef: item.osisRef});
        }));
        this.$.historyMenu.createComponents(hisItems, {owner: this.$.historyMenu});
        this.$.historyMenu.render();
    },

    historySelected: function (inSender, inEvent) {
        if (!isNaN(inEvent.originator.index)) {
            this.setPassage(this.history[inEvent.originator.index]);
        }
    },

    addToHistory: function (inPassage) {
        if (this.history.length > 15) {
            this.history.splice(16,this.history.length-15);
        }
        for (var l=0;l<this.history.length;l++) {
            if(this.history[l].osisRef === inPassage.osisRef) {
                this.history.splice(l,1);
            }
        }
        this.history.unshift(inPassage);
        this.settings["history"] = this.history;
        //api.putSetting("history", this.history);
    },

    handleUserData: function (inOsis) {
        var vmax = this.currentModule.getVersesInChapter(inOsis),
            hlKeys = [],
            noteKeys = [];
        api.getUserData(inOsis, vmax, enyo.bind(this, function (inError, inUserData) {
            if(!inError) {
                this.userData = api.extend(this.userData, inUserData);
                //console.log(this.userData, this.verses);
                Object.keys(inUserData).forEach(enyo.bind(this, function (key) {
                    if(inUserData[key].bookmarkId) {
                        this.updateVerses(key, {bookmark: true});
                    }
                    if(inUserData[key].highlightId) {
                        hlKeys.push(inUserData[key].highlightId);
                    }
                    if(inUserData[key].noteId) {
                        noteKeys.push(inUserData[key].noteId);
                    }

                }));
                if (hlKeys.length !== 0) {
                    api.getHighlights(hlKeys, enyo.bind(this, function (inError, inHighlights) {
                        if(!inError) {
                            inHighlights.forEach(enyo.bind(this, function (hl) {
                                this.updateVerses(hl.osisRef, {highlight: true, color: hl.color});
                                //enyo.dom.byId(hl.osisRef).style.backgroundColor = hl.color;
                            }));
                        } else
                            this.handleError(inError);

                    }));
                }
                if (noteKeys.length !== 0) {
                    api.getNotes(noteKeys, enyo.bind(this, function (inError, inNotes) {
                        if(!inError) {
                            inNotes.forEach(enyo.bind(this, function (note) {
                                this.updateVerses(note.osisRef, {note: true, type: "note", osisRef: note.osisRef, noteId: note.id});
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
            this.updateVerses(inEvent.osisRef, {bookmark: false});
        } else {
            this.updateVerses(inEvent.osisRef, {bookmark: true});
        }
        this.handleUserData(inEvent.osisRef);
        if(this.$.dataView) {
            //Update personal data in the sidebar
            this.$.dataView.updateSection();
        }
    },

    handleHighlight: function (inSender, inEvent) {
        if(inEvent.action === "remove") {
            this.updateVerses(inEvent.osisRef, {highlight: false});
        } else {
            //this.updateVerses(inEvent.osisRef, {highlight: true, color: inEvent.color});
        }
        this.handleUserData(inEvent.osisRef);
        if(this.$.dataView) {
            //Update personal data in the sidebar
            this.$.dataView.updateSection();
        }
    },

    handleNoteTap: function (inSender, inEvent) {
        if (this.userData[inEvent.osisRef] && this.userData[inEvent.osisRef].noteId !== undefined)
            inEvent["noteId"] = this.userData[inEvent.osisRef].noteId;
        if(!enyo.Panels.isScreenNarrow()) {
            if(!this.$.notes) this.$.stuffPopup.createComponent({name: "notes", kind: "biblez.notes", onBack: "closePopup", onChange: "handleNote"}, {owner: this}).render();
            this.$.notes.setOsisRef(inEvent.osisRef);
            this.$.notes.setNoteId(inEvent.noteId);
            this.$.stuffPopup.show();
        } else
            this.doOpenNotes(inEvent);
        this.$.notePopup.hide();
    },

    handleNote: function (inSender, inEvent) {
        if(inEvent.action === "remove") {
            this.updateVerses(inEvent.osisRef, {note: false});
        }
        this.handleUserData(inEvent.osisRef);
        if(this.$.dataView) {
            //Update personal data in the sidebar
            this.$.dataView.updateSection();
        }
    },

    handleBcSelector: function (inSender, inEvent) {
        if(!enyo.Panels.isScreenNarrow()) {
            if(!this.$.bcSelector) this.$.bcPopup.createComponent({kind: "biblez.bcSelector", name: "bcSelector", onSelect: "passageChanged", onBack: "closePopup"}, {owner: this}).render();
            this.$.bcSelector.setModule(this.currentModule);
            this.$.bcPopup.showAtEvent(inEvent);
        } else
            this.doOpenBC();
    },

    closePopup: function (inSender, inEvent) {
        if(this.$.bcSelector)
            this.$.bcPopup.destroyClientControls();
        this.$.bcPopup.hide();
        if(this.$.notes)
            this.$.stuffPopup.destroyClientControls();
        this.$.stuffPopup.hide();
    },

    handleFontMenu: function (inSender, inEvent) {
        this.$.fontMenu.show();
    },

    handleFont: function (inSender, inEvent) {
        this.$.verseList.applyStyle("font-family", inEvent.font);
        this.$.verseList.reset(this.offset);
        api.putSetting("font", inEvent.font);
    },

    handleFontSize: function (inSender, inEvent) {
        if(inEvent.font !== "default")
            this.$.verseList.applyStyle("font-size", inEvent.fontSize + "em");
        else
            this.$.verseList.applyStyle("font-size", null);
        this.$.verseList.reset(this.offset);
        api.putSetting("fontSize", inEvent.fontSize);
    },

    handleChangeChapter: function (inSender, inEvent) {
        if(this.$.mainPanel.getIndex() !== 5) {
            if(this.currentModule) {
                if(this.panelIndex === 1) {
                    this.handlePassage(sword.verseKey.previous(this.passage.osisRef, this.currentModule.config.Versification).osisRef);
                } else if(this.panelIndex === 3) {
                    this.handlePassage(sword.verseKey.next(this.passage.osisRef, this.currentModule.config.Versification).osisRef);
                }
            }
            this.$.mainPanel.setIndexDirect(2);
        }
        return true;
    },

    handleVerseTap: function (inSender, inEvent) {
        inEvent.preventDefault();
        var attributes = {};
        if(inEvent.target.href || inEvent.target.parentNode.href) {
            var url = inEvent.target.href || inEvent.target.parentNode.href;
            url.split("?")[1].split("&").forEach(function(item) {
                item = item.split("=");
                attributes[item[0]] = item[1];
            });
        }
        //console.log(attributes);
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
            api.getNote(parseInt(attributes.noteId, 10), enyo.bind(this, function (inError, inNote) {
                if(!inError) {
                    this.$.notePopup.setText(inNote.text);
                    this.$.notePopup.setOsisRef(inNote.osisRef);
                    this.$.notePopup.showAtEvent(inEvent);
                } else
                    this.handleError(inError);
            }));
        } else if (attributes.type === "footnote") {
            this.footnotes[attributes.osisRef].forEach(enyo.bind(this, function(item) {
                if(item.n === attributes.n)
                    this.$.footnotePopup.setText(item.note);
                else if (!isNaN(item.n) && item.n === parseInt(attributes.n, 10))
                    this.$.footnotePopup.setText(item.note);
            }));
            this.$.footnotePopup.showAtEvent(inEvent);
        } else if (attributes.type === "crossReference") {
            this.$.footnotePopup.setText("");
            this.$.footnotePopup.showAtEvent(inEvent);
            this.$.footnotePopup.handleSpinner(true);
            this.currentModule.renderText(attributes.osisRef, {oneVersePerLine: false, footnotes: false, headings: false},
                enyo.bind(this, function (inError, inResult) {
                    if(!inError) {
                        this.$.footnotePopup.hide();
                        this.$.footnotePopup.setText(inResult.text);
                        this.$.footnotePopup.handleSpinner(false);
                        this.$.footnotePopup.showAtEvent(inEvent);
                    } else {
                        this.$.footnotePopup.hide();
                        this.handleError(inError.message);
                    }
                })
            );
        }

        return false;
    },

    handleOnScroll: function (inSender, inEvent) {
        enyo.job("handleScrolling", this.bindSafely(function () {
            this.handleScrolling(inSender, inEvent);
        }), 100);
    },

    //handling infinite scrolling
    handleScrolling: function (inSender, inEvent) {
        if(this.verses.length !== 0) {
            var b = inEvent.scrollBounds;
            var cHeight = b.clientHeight,
                top = b.top,
                height = b.height,
                yDir = b.yDir;

            if(b && b.top > 0) {
                this.rowSize = Math.round(b.height / this.verses.length); // this.$.verseList.getRowSize();
                this.offset = Math.round(b.top / this.rowSize);
                if (this.verses[this.offset] && this.verses[this.offset].osisRef) {
                    this.setPassage({offsetRef: this.verses[this.offset].osisRef});
                }
            }

            //console.log(cHeight, top, height, yDir);

            if(!this.reachedBottom && cHeight + top > height - 200/* && yDir === 1*/) {
                this.reachedBottom = true;
                enyo.job("updateBottom", this.bindSafely(function () {
                    this.reachedBottom = false;
                }), 2000);
                this.addText(true, enyo.bind(this, function () {
                    this.reachedBottom = false;
                }));
            } else if (!this.reachedTop && top < 30/* && yDir === -1*/) {
                this.reachedTop = true;
                enyo.job("updateTop", this.bindSafely(function () {
                    this.reachedTop = false;
                }), 2000);
                this.addText(false, enyo.bind(this, function () {
                    this.reachedTop = false;
                }));
            }
        }
        return true;
    },

    addText: function(inBottom, inCallback) {
        if(!this.currentModule || this.verses.length === 0) {
            inCallback();
            return;
        }
        if(inBottom === true) {
            //Load next verses
            var n = this.verses[this.verses.length-1].osisRef.slice(0,this.verses[this.verses.length-1].osisRef.lastIndexOf("."));
            if (n === "Rev.22") {
                inCallback();
                return;
            }
            var next = sword.verseKey.next(n, this.currentModule.config.Versification);
            this.loadText(next.osisRef, enyo.bind(this, function (inError, inResult) {
                if(!inError) {
                    var caps = "";
                    if(inResult.rtol) {
                        this.$.verseList.applyStyle("text-align", "right");
                        caps = "<br><div class='caps-rtol'>" + next.chapter + "</div>";
                    } else
                        caps = "<br><div class='caps'>" + next.chapter + "</div>";
                    this.verses.push({osisRef: next.osisRef, text: caps});
                    this.verses.push.apply(this.verses, inResult.verses);
                    if(inResult.hasOwnProperty("footnotes"))
                        this.footnotes = api.extend(this.footnotes, inResult.footnotes);
                    this.$.verseList.setCount(this.verses.length);
                    this.$.verseList.refresh();
                    this.handleUserData(next.osisRef);
                } else {
                    this.handleError(inError.message);
                }
                inCallback();
            }));
        } else {
            var p = this.verses[1].osisRef.slice(0,this.verses[1].osisRef.lastIndexOf("."));
            if (p === "Gen.1") {
                inCallback();
                return;
            }
            var previous = sword.verseKey.previous(p, this.currentModule.config.Versification);
            //console.log("Previous:", previous);
            this.loadText(previous.osisRef, enyo.bind(this, function (inError, inResult) {
                if(!inError) {
                    if(inResult.hasOwnProperty("footnotes"))
                        this.footnotes = api.extend(this.footnotes, inResult.footnotes);
                    var l = inResult.verses.length;
                    inResult.verses.push.apply(inResult.verses, this.verses);
                    this.verses = inResult.verses;
                    var caps = "";
                    if(inResult.rtol) {
                        this.$.verseList.applyStyle("text-align", "right");
                        caps = "<br><div class='caps-rtol'>" + previous.chapter + "</div>";
                    } else
                        caps = "<br><div class='caps'>" + previous.chapter + "</div>";
                    this.verses.unshift({osisRef: previous.osisRef, text: caps});
                    this.$.verseList.setCount(this.verses.length);
                    this.$.verseList.refresh();
                    if (this.hasVerseNumber === 0)
                        this.$.verseList.scrollToRow(l+1);
                    else {
                        this.$.verseList.scrollToRow(l+this.hasVerseNumber);
                        this.hasVerseNumber = 0;
                    }
                    this.handleUserData(previous.osisRef);
                } else {
                    this.handleError(inError.message);
                }
                inCallback();
            }));
        }
    },

    loadText: function (inOsis, inCallback) {
        //console.log("LOADTEXT", inOsis);
        this.$.tbSpinner.show();
        this.$.topTB.resized();
        this.currentModule.renderText(inOsis,
            {
                oneVersePerLine: this.settings.linebreak ? true : false,
                footnotes: this.settings.footnotes ? true : false,
                crossReferences: this.settings.crossReferences ? true : false,
                intro: this.settings.introductions ? true : false,
                headings: this.settings.hasOwnProperty("headings") ? this.settings.headings : true,
                wordsOfChristInRed: this.settings.woc ? true : false,
                array: true
            },
            enyo.bind(this, function (inError, inResult) {
                //console.log(inError, inResult);
                inCallback(inError, inResult);
                this.$.tbSpinner.hide();
                this.$.topTB.resized();
            })
        );
    },

    /*Action Menu*/
    actionSelected: function (inSender, inEvent) {
        if(inEvent.originator.action === "moduleManager")
            this.doOpenModuleManager();
        else if(inEvent.originator.action === "preferences")
            this.doOpenPreferences();
        else if(inEvent.originator.action === "about")
            this.doOpenAbout();
        else if(inEvent.originator.action === "font")
            this.handleFontMenu();
        else {
            if(enyo.Panels.isScreenNarrow())
                this.doOpenDataView({section: inEvent.originator.action});
            else {
                this.$.sidebar.show();
                this.$.mainView.resized();
                this.$.verseList.reset(this.offset);
                if(!this.$.dataView) {
                    this.$.sidebar.createComponent({name: "dataView", kind: "biblez.dataView", onBack: "handleBack", onVerse: "handlePassage"}, {owner: this}).render();
                    this.$.dataView.showHideButton();
                }
                this.$.dataView.updateSection(inEvent.originator.action);
            }
        }
    },

    handleBack: function (inSender, inEvent) {
        this.$.sidebar.destroyClientControls();
        this.$.sidebar.hide();
        this.$.mainView.resized();
        this.$.verseList.reset(this.offset);
        return true;
    },

    handlePanelIndex: function (inSender, inEvent) {
        this.panelIndex = inEvent.toIndex;
    },

    /* HELPERS */
    updateVerses: function (inOsis, inObject) {
        this.verses.forEach(enyo.bind(this, function (item, idx) {
            if (item.osisRef === inOsis) {
                this.verses[idx] = api.extend(item, inObject);
                this.$.verseList.renderRow(idx);
            }
        }));
        //console.log("UPDATED:", this.verses);
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

    resizeHandler: function () {
        this.inherited(arguments);
        if(enyo.Panels.isScreenNarrow()) {
            this.$.sidebar.destroyClientControls();
            this.$.sidebar.hide();
        }
    },

    handleError: function (inMessage) {
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});

