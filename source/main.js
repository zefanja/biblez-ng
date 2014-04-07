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
        {name: "bcPopup", classes: "biblez-bc-popup", kind: "onyx.Popup", modal: true, floating: true, components: [
            {kind: "biblez.bcSelector", name: "bcSelector", onSelect: "passageChanged", onBack: "closePopup"}
        ]},
        {kind: "onyx.Toolbar", showing: false, classes: "main-toolbar", noStretch: true, name: "topTB", layoutKind: "FittableColumnsLayout", components: [
            {name: "moduleSelector", kind: "onyx.MenuDecorator", onSelect: "moduleSelected", components: [
                {kind: "onyx.Button", name: "btnModules", classes: "tb-button", style: "background-color: #934A15;"},
                {kind: "onyx.Menu", maxHeight: "300", name: "moduleMenu"}
            ]},
            {kind: "onyx.Button", name: "btnPassage", classes: "tb-button", ontap: "handleBcSelector"},
            {name: "historySelector", kind: "onyx.MenuDecorator", onSelect: "historySelected", components: [
                //Clock Icon by Thomas Le Bas from The Noun Project
                {kind: "onyx.IconButton", name: "btnHistory", src: "assets/history.png"},
                {kind: "onyx.Menu", maxHeight: "300", name: "historyMenu"}
            ]},
            {fit: true},
            {name: "actionSelector", kind: "onyx.MenuDecorator", onSelect: "actionSelected", components: [
                {kind: "onyx.IconButton", src: "assets/menu.png"},
                {kind: "onyx.Menu", name: "actionMenu", maxHeight: "300", style: "width: 200px;", components: [
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
            {name: "verseList", kind: "VerseList", touch: true, thumb: false, touchOverscroll: false, count: 0, onSetupItem: "setVerses", onScrollStop: "handleScrolling", components: [
                {name: "text", allowHtml: true, style: "display: inline;"}
            ]}
            /*{},
            {kind: "FittableColumns", noStretch: true, components: [
                {fit: true},
                {content: "< Previous", classes: "chapter-nav chapter-nav-left"}
            ]},*/
            /*{name: "verseScroller", kind: "enyo.Scroller", onScrollStop: "handleScrolling", thumb: false, touch: true, touchOverscroll: false, fit: true, components: [
                //{classes: "center", components: [{kind: "onyx.Spinner", name: "spinner", classes: "onyx-light center"}]},
                //{name: "main", classes: "verse-view", allowHtml: true, onclick: "handleVerseTap"}
            ]},*/
            /*{kind: "FittableColumns", noStretch: true, components: [
                {content: "Next >", classes: "chapter-nav chapter-nav-right"},
                {fit: true}
            ]},
            {}*/
        ]},
    ],

    currentModule: null,
    currentPassage: {
        osis: "Matt.1",
        label: "Matt 1"
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
    passagePos: {
        top: null,
        middle: null,
        bottom: null
    },

    create: function () {
        this.inherited(arguments);
        //this.$.spinner.stop();
        this.startUp();

        //this.$.mainPanel.setIndexDirect(2);
    },

    startUp: function () {
        api.get("settings", enyo.bind(this, function(inError, inSettings) {
            if(!inError) {
                this.settings = (inSettings) ? inSettings: this.settings;
                //console.log(this.settings);
                this.getInstalledModules();
                if(this.settings.fontSize) {
                    this.$.fontMenu.setFontSize(this.settings.fontSize);
                    this.$.verseScroller.applyStyle("font-size", this.settings.fontSize + "em");
                }
                if(this.settings.font) {
                    this.$.fontMenu.setFont(this.settings.font);
                    if(this.settings.font !== "default")
                        this.$.verseScroller.applyStyle("font-family", this.settings.font);
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
                if(inEvent.setting === "linebreak" || inEvent.setting === "footnotes" || inEvent.setting === "headings" || inEvent.setting === "crossReferences" || inEvent.setting === "introductions" || inEvent.setting === "woc")
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
                    this.$.mainPanel.selectPanelByName("verseScroller");
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
                this.reflow();
            } else {
                this.handleError(inError);
            }
        }));
    },

    renderModuleMenu: function (inModules) {
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
            mods[0]["components"] = [
                {content: this.currentModule.modKey, index: 0},
                {kind: "onyx.IconButton", src: "assets/checkmark.png", style: "float: right;"}
            ];
            this.$.btnModules.setContent(this.currentModule.modKey);
            this.settings["lastModule"] = this.currentModule.modKey;
        }
        this.$.moduleMenu.createComponents(mods, {owner: this.$.moduleMenu});
        this.$.moduleMenu.render();

        this.doModuleChanged({module: this.currentModule});
        if(enyo.platform.firefox || enyo.platform.androidFirefox)
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
            //api.putSetting("lastModule", this.currentModule.modKey);
            this.renderModuleMenu();
        }
    },

    passageChanged: function (inSender, inEvent) {
        this.$.bcPopup.hide();
        delete inEvent.originator;
        delete inEvent.delegate;
        delete inEvent.type;
        this.currentPassage = inEvent;
        console.log(this.currentPassage);
        //this.currentPassage.verseNumber = inEvent.verseNumber;
        this.handlePassage();
        return true;
    },

    handlePassage: function (passage) {
        //console.log("PASSAGE", passage, this.currentPassage);
        //this.$.main.setContent("");
        //this.$.spinner.start();
        var verseNumber = 0; //this.currentPassage.verseNumber ? this.currentPassage.verseNumber : 0;

        if (typeof passage === "string") {
            //BibleZ currently supports only Book.Chapter Osis passages in the mainView
            if(passage.split(".").length > 2) {
                verseNumber = parseInt(passage.slice(passage.lastIndexOf(".")+1, passage.length), 10);
                passage = passage.slice(0, passage.lastIndexOf("."));
            } else
                verseNumber = 0;

            this.currentPassage.osis = passage.replace(" ", ".");
            this.currentPassage.label = passage.replace(".", " ");
        }

        //Persist current passage
        this.addToHistory(this.currentPassage.osis);
        this.settings["lastRead"] = this.currentPassage;
        api.put(this.settings);

        this.$.btnPassage.setContent(this.currentPassage.label);
        //Adjust the TB Icons
        this.$.topTB.resized();

        this.loadText(this.currentPassage.osis, enyo.bind(this, function (inError, inResult) {
            if(!inError) {
                this.footnotes = inResult.footnotes;
                /*this.$.verseScroller.destroyClientControls();
                this.$.verseScroller.createComponent({classes: "verse-view", allowHtml: true, onclick: "handleVerseTap", content: "<h1>" + this.currentPassage.book + " " + this.currentPassage.chapter + "</h1>" + inResult.text}, {owner: this}).render();
                if (verseNumber < 2)
                    this.$.verseScroller.scrollToTop();
                else {
                    var e = enyo.dom.byId(this.currentPassage.osis+"."+verseNumber);
                    this.$.verseScroller.scrollToNode(e);
                    e.style.backgroundColor = "rgba(210,105,30,0.25)";
                    //e.className = e.className + " active-verse";
                } */
                this.verses = inResult.verses;
                this.$.verseList.setCount(this.verses.length);
                this.$.verseList.refresh();
                this.$.verseList.scrollToStart();
                this.handleUserData(this.currentPassage.osis);
                this.renderHistory();
            } else {
                if(inError.code && inError.code === 123) {
                    //handle old internal module format
                }
                this.handleError(inError.message);
            }
        }));

        //Set passage positions
        this.passagePos.middle = this.currentPassage.osis;
        this.passagePos.top = sword.verseKey.previous(this.currentPassage.osis, this.currentModule.config.Versification).osis;
        this.passagePos.bottom = sword.verseKey.next(this.currentPassage.osis, this.currentModule.config.Versification).osis;

    },

    setVerses: function (inSender, inEvent) {
        var index = inEvent.index;
        //console.log(inEvent, index);
        this.$.text.setContent(this.verses[index].text);
        return true;
    },

    renderHistory: function (inSender, inEvent) {
        this.$.historyMenu.destroyClientControls();
        var hisItems = [];
        this.history.forEach(enyo.bind(this, function (item, idx) {
            hisItems.push({content: api.formatOsis(item.osisRef), index: idx, osisRef: item.osisRef});
        }));
        this.$.historyMenu.createComponents(hisItems, {owner: this.$.historyMenu});
        this.$.historyMenu.render();
    },

    historySelected: function (inSender, inEvent) {
        if (!isNaN(inEvent.originator.index)) {
            this.handlePassage(this.history[inEvent.originator.index].osisRef);
        }
    },

    addToHistory: function (inOsis) {
        if (this.history.length > 15) {
            this.history.splice(16,this.history.length-15);
        }
        for (var l=0;l<this.history.length;l++) {
            if(this.history[l].osisRef === inOsis) {
                this.history.splice(l,1);
            }
        }
        this.history.unshift({osisRef: inOsis});
        this.settings["history"] = this.history;
        //api.putSetting("history", this.history);
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
        if(enyo.platform.firefox || enyo.platform.androidFirefox) {
            this.$.bcPopup.showAtEvent(inEvent);
        } else
            this.doOpenBC();
    },

    closePopup: function (inSender, inEvent) {
        this.$.bcPopup.hide();
    },

    handleFontMenu: function (inSender, inEvent) {
        this.$.fontMenu.show();
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
        return true;
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
        return true;
    },

    //handling infinite scrolling
    handleScrolling: function (inSender, inEvent) {
        var cHeight = inEvent.scrollBounds.clientHeight,
            top = inEvent.scrollBounds.top,
            height = inEvent.scrollBounds.height,
            yDir = inEvent.scrollBounds.yDir;

        //console.log(cHeight, top, height, yDir);

        if(!this.reachedBottom && cHeight + top > height - 200/* && yDir === 1*/) {
            this.reachedBottom = true;
            //console.log("BOTTOM");
            this.addText(true, enyo.bind(this, function () {
                this.reachedBottom = false;
            }));
        } else if (!this.reachedTop && top < 30/* && yDir === -1*/) {
            this.reachedTop = true;
            //console.log("TOP");
            this.addText(false, enyo.bind(this, function () {
                this.reachedTop = false;
            }));
        }

    },

    addText: function(inBottom, inCallback) {
        if(!this.currentModule) {
            inCallback();
            return;
        }
        if(inBottom) {
            //Load next verses
            this.passagePos.top = this.passagePos.middle;
            this.passagePos.middle = this.passagePos.bottom;
            this.currentPassage = sword.verseKey.next(this.passagePos.middle, this.currentModule.config.Versification);
            this.passagePos.bottom = this.currentPassage.osis;
            this.loadText(this.passagePos.bottom, enyo.bind(this, function (inError, inResult) {
                if(!inError) {
                    this.verses.push({text: "<h3>" + this.currentPassage.osis + "</h3>"});
                    this.verses.push.apply(this.verses, inResult.verses);
                    this.$.verseList.setCount(this.verses.length);
                    this.$.verseList.refresh();
                } else {
                    this.handleError(inError.message);
                }
                inCallback();
            }));
        } else {
            this.passagePos.bottom = this.passagePos.middle;
            this.passagePos.middle = this.passagePos.top;
            this.currentPassage = sword.verseKey.previous(this.passagePos.middle, this.currentModule.config.Versification);
            this.passagePos.top = this.currentPassage.osis;
            this.loadText(this.passagePos.top, enyo.bind(this, function (inError, inResult) {
                if(!inError) {
                    var l = inResult.verses.length;
                    inResult.verses.push.apply(inResult.verses, this.verses);
                    this.verses = inResult.verses;
                    this.verses.unshift({text: "<h3>" + this.currentPassage.osis + "</h3>"});
                    this.$.verseList.setCount(this.verses.length);
                    this.$.verseList.refresh();
                    this.$.verseList.scrollToRow(l+1);
                } else {
                    this.handleError(inError.message);
                }
                inCallback();
            }));
        }
    },

    loadText: function (inOsis, inCallback) {
        //console.log(inOsis, this.passagePos);
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

    handleError: function (inMessage) {
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});
