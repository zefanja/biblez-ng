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
        {name: "panel", kind: "Panels", fit: true, classes: "app-panels", arrangerKind: "CardArranger", draggable: false, onTransitionFinish: "handlePanels", components: [
            {name: "main", kind: "biblez.main", onOpenModuleManager: "openModuleManager", onOpenBC: "openSelector", onModuleChanged: "handleChangeModule"},
            {name: "moduleManager", kind: "biblez.moduleManager", onBack: "handleBack", onInstalled: "handleInstalledModule"},
            {name: "bcSelector", kind: "biblez.bcSelector", onSelect: "handlePassageSelect", onBack: "handleBack"},
            {name: "moduleManagerDesktop", kind: "biblez.moduleManagerDesktop", onBack: "handleBack", onInstalled: "handleInstalledModule"}
            //{name: "settings"}
        ]}
    ],

    rendered: function () {
        this.inherited(arguments);
        //this.$.panel.setIndex(1);
    },

    handlePanels: function (inSender, inEvent) {
        if(inEvent.toIndex === 1 && !enyo.platform.firefox) {
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
        if(enyo.platform.firefox)
            this.$.panel.setIndex(3);
        else
            this.$.panel.setIndex(1);
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
    }
});

window.screen.onmozorientationchange = function () {
    enyo.Signals.send("onOrientationChange");
};
//enyo.dispatcher.listen(window, "beforeunload");
