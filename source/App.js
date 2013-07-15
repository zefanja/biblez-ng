enyo.kind({
	name: "App",
    kind: enyo.FittableRows,
    fit: true,
    components: [
        {name: "panel", kind: "Panels", fit: true, classes: "app-panels", arrangerKind: "CardArranger", draggable: false, onTransitionFinish: "handlePanels", components: [
            {name: "main", kind: "biblez.main", onOpenModuleManager: "openModuleManager"},
            {name: "moduleManager", kind: "biblez.moduleManager", onBack: "handleBack", onInstalled: "handleInstalledModule"}
            //{name: "settings"}
        ]}
    ],

    rendered: function () {
        this.inherited(arguments);
        //this.$.panel.setIndex(0);
    },

    handlePanels: function (inSender, inEvent) {
        if(inEvent.toIndex === 1) {
            this.$.moduleManager.start();
        }

    },

    handleBack: function (inSender, inEvent) {
        this.$.panel.setIndex(0);
    },

    handleInstalledModule: function (inSender, inEvent) {
        this.$.main.getInstalledModules();
    },

    openModuleManager: function (inSender, inEvent) {
        this.$.panel.setIndex(1);
    }
});
