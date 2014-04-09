enyo.ready(function() {
    if (!window.App) {
        alert('No application build found, please open debug.html.');
    }
    new App().renderInto(document.body);
});

enyo.kind({
    name: "App",
    kind: enyo.FittableRows,
    fit: true,
    components: [
        {name: "panel", kind: "Panels", fit: true, animate: false, classes: "app-panels", arrangerKind: "CardArranger", draggable: false, onTransitionFinish: "handlePanels", components: [
            {name: "main", kind: "biblez.main",
                onOpenModuleManager: "openModuleManager",
                onOpenBC: "openSelector",
                onModuleChanged: "handleChangeModule",
                onOpenPreferences: "openPreferences",
                onOpenNotes: "openNotes",
                onOpenDataView: "openDataView",
                onOpenAbout: "openAbout"
            },
            {name: "bcSelector", kind: "biblez.bcSelector", onSelect: "handlePassageSelect", onBack: "handleBack"},
            /*{name: "moduleManager", kind: "biblez.moduleManager", onBack: "handleBack", onInstalled: "handleInstalledModule"},
            {name: "moduleManagerDesktop", kind: "biblez.moduleManagerDesktop", onBack: "handleBack", onInstalled: "handleInstalledModule"},
            {name: "settings", kind: "biblez.settings", onBack: "handleBack", onChange: "handleSettings"},
            {name: "notes", kind: "biblez.notes", onBack: "handleBack", onChange: "handleNote"},
            {name: "dataView", kind: "biblez.dataView", onBack: "handleBack", onVerse: "handleVerse"},
            {name: "about", kind: "biblez.about", onBack: "handleBack"}*/
        ]}
    ],

    handleBack: function (inSender, inEvent) {
        this.$.panel.selectPanelByName("main");
        if(inSender.name !== "bcSelector" && inSender.name !== "notes" && inSender.name !== "settings")
            enyo.asyncMethod(inSender, "destroy");
        return true;
    },

    handleInstalledModule: function (inSender, inEvent) {
        this.$.main.getInstalledModules();
        return true;
    },

    openModuleManager: function (inSender, inEvent) {
        if(!enyo.platform.firefoxOS) {
            this.$.panel.createComponent({name: "moduleManagerDesktop", kind: "biblez.moduleManagerDesktop", onBack: "handleBack", onInstalled: "handleInstalledModule"}, {owner: this}).render();
            this.$.panel.selectPanelByName("moduleManagerDesktop");
        } else {
            this.$.panel.createComponent({name: "moduleManager", kind: "biblez.moduleManager", onBack: "handleBack", onInstalled: "handleInstalledModule"}, {owner: this}).render();
            this.$.panel.selectPanelByName("moduleManager");
            this.$.moduleManager.start();
        }

        return true;
    },

    openSelector: function (inSender, inEvent) {
        this.$.panel.selectPanelByName("bcSelector");
        this.$.bcSelector.setPanel(0);
        return true;
    },

    handleChangeModule: function (inSender, inEvent) {
        this.$.bcSelector.setModule(inEvent.module);
        return true;
    },

    handlePassageSelect: function (inSender, inEvent) {
        this.$.panel.selectPanelByName("main");
        delete inEvent.originator;
        this.$.main.setPassage(inEvent);
    },

    openPreferences: function (inSender, inEvent) {
        this.$.panel.createComponent({name: "settings", kind: "biblez.settings", onBack: "handleBack", onChange: "handleSettings"}, {owner: this}).render();
        this.$.settings.setSettings();
        this.$.panel.selectPanelByName("settings");
    },

    handleSettings: function (inSender, inEvent) {
        this.$.main.handleSettings(inSender, inEvent);
        enyo.asyncMethod(inSender, "destroy");
        this.$.panel.selectPanelByName("main");
    },

    openNotes: function (inSender, inEvent) {
        this.$.panel.createComponent({name: "notes", kind: "biblez.notes", onBack: "handleBack", onChange: "handleNote"}, {owner: this}).render();
        this.$.notes.setOsisRef(inEvent.osisRef);
        this.$.notes.setNoteId(inEvent.noteId);
        this.$.panel.selectPanelByName("notes");
    },

    handleNote: function (inSender, inEvent) {
        this.$.main.handleNote(inSender, inEvent);
        enyo.asyncMethod(inSender, "destroy");
        this.$.panel.selectPanelByName("main");
        return true;
    },

    openDataView: function (inSender, inEvent) {
        this.$.panel.createComponent({name: "dataView", kind: "biblez.dataView", onBack: "handleBack", onVerse: "handleVerse"}, {owner: this}).render();
        this.$.dataView.updateSection(inEvent.section);
        this.$.panel.selectPanelByName("dataView");
    },

    handleVerse: function (inSender, inEvent) {
        inSender.destroy();
        this.$.main.handlePassage(inEvent.osisRef);
        this.$.panel.selectPanelByName("main");
        return true;
    },

    openAbout: function (inSender, inEvent) {
        this.$.panel.createComponent({name: "about", kind: "biblez.about", onBack: "handleBack"}, {owner: this}).render();
        this.$.panel.selectPanelByName("about");
    }
});

window.screen.onmozorientationchange = function () {
    enyo.Signals.send("onOrientationChange");
};
//enyo.dispatcher.listen(window, "beforeunload");
