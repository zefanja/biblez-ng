enyo.kind({
	name: "App",
	kind: "Panels",
    fit: true,
    classes: "app-panels",
    arrangerKind: "CardArranger",
    draggable: false,
    components: [
        {name: "main", kind: "biblez.main", onOpenModuleManager: "openModuleManager"},
        {name: "moduleManager", kind: "biblez.moduleManager", onBack: "handleBack"}
        //{name: "settings"}
    ],

    rendered: function () {
        this.inherited(arguments);
        this.setIndex(1);
    },

    handleBack: function (inSender, inEvent) {
        this.setIndex(0);
    },

    openModuleManager: function (inSender, inEvent) {
        this.setIndex(1);
    }
});
