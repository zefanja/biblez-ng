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
            {name: "moduleManager", kind: "biblez.moduleManager", onBack: "handleBack", onInstalled: "handleInstalledModule"},
            {name: "bcSelector", kind: "biblez.bcSelector", onSelect: "handlePassageSelect", onBack: "handleBack"},
            {name: "moduleManagerDesktop", kind: "biblez.moduleManagerDesktop", onBack: "handleBack", onInstalled: "handleInstalledModule"},
            {name: "settings", kind: "biblez.settings", onBack: "handleBack", onChange: "handleSettings"},
            {name: "notes", kind: "biblez.notes", onBack: "handleBack", onChange: "handleNote"},
            {name: "dataView", kind: "biblez.dataView", onBack: "handleBack", onVerse: "handleVerse"},
            {name: "about", kind: "biblez.about", onBack: "handleBack"}
        ]}
    ],

    rendered: function () {
        this.inherited(arguments);
        //this.$.panel.setIndex(1);
    },

    handlePanels: function (inSender, inEvent) {
        if(inEvent.toIndex === 1 && enyo.platform.firefoxOS) {
            this.$.moduleManager.start();
        }
        return true;

    },

    handleBack: function (inSender, inEvent) {
        this.$.panel.setIndex(0);
        return true;
    },

    handleInstalledModule: function (inSender, inEvent) {
        this.$.main.getInstalledModules();
        return true;
    },

    openModuleManager: function (inSender, inEvent) {
        if(!enyo.platform.firefoxOS)
            this.$.panel.setIndex(3);
        else {
            this.$.panel.setIndex(1);
            this.$.moduleManager.start();
        }

        return true;
    },

    openSelector: function (inSender, inEvent) {
        this.$.panel.setIndex(2);
        this.$.bcSelector.setPanel(0);
        return true;
    },

    handleChangeModule: function (inSender, inEvent) {
        this.$.bcSelector.setModule(inEvent.module);
        return true;
    },

    handlePassageSelect: function (inSender, inEvent) {
        this.$.panel.setIndex(0);
        delete inEvent.originator;
        this.$.main.setPassage(inEvent);
    },

    openPreferences: function (inSender, inEvent) {
        this.$.settings.setSettings();
        this.$.panel.setIndex(4);
    },

    handleSettings: function (inSender, inEvent) {
        this.$.main.handleSettings(inSender, inEvent);
    },

    openNotes: function (inSender, inEvent) {
        this.$.notes.setOsisRef(inEvent.osisRef);
        this.$.notes.setNoteId(inEvent.noteId);
        this.$.panel.setIndex(5);
    },

    handleNote: function (inSender, inEvent) {
        this.$.main.handleNote(inSender, inEvent);
        return true;
    },

    openDataView: function (inSender, inEvent) {
        this.$.dataView.updateSection(inEvent.section);
        this.$.panel.setIndex(6);
    },

    handleVerse: function (inSender, inEvent) {
        this.$.main.handlePassage(inEvent.osisRef);
        this.$.panel.setIndex(0);
        return true;
    },

    openAbout: function (inSender, inEvent) {
        this.$.panel.setIndex(7);
    }
});

window.screen.onmozorientationchange = function () {
    enyo.Signals.send("onOrientationChange");
};
//enyo.dispatcher.listen(window, "beforeunload");
