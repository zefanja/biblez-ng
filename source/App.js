enyo.kind({
	name: "App",
    kind: enyo.FittableRows,
    fit: true,
    components: [
        {name: "panel", kind: "Panels", fit: true, classes: "app-panels", arrangerKind: "CardArranger", draggable: false, components: [
            {name: "main", kind: "biblez.main", onOpenModuleManager: "openModuleManager"},
            {name: "moduleManager", kind: "biblez.moduleManager", onBack: "handleBack"}
            //{name: "settings"}
        ]}
    ],

    rendered: function () {
        this.inherited(arguments);
        this.$.panel.setIndex(1);
    },

    handleBack: function (inSender, inEvent) {
        this.$.panel.setIndex(0);
    },

    openModuleManager: function (inSender, inEvent) {
        this.$.panel.setIndex(1);
    }
});
