enyo.kind({
	name: "VerseList",
	kind: "List",
	published: {
		clientStyle: "display: inline;"
	},

	create: function () {
		this.inherited(arguments);
		this.$.port.addRemoveClass("verse-view", true);
		this.clientStyleChanged();
	},

	clientStyleChanged: function () {
		this.$.generator.setClientStyle(this.clientStyle);
	}

});