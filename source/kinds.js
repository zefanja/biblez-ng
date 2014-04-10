enyo.kind({
	name: "VerseList",
	kind: "List",
	published: {
		clientStyle: "display: inline;"
	},
	events: {
		onOffset: ""
	},

	create: function () {
		this.inherited(arguments);
		this.$.port.addRemoveClass("verse-view", true);
		this.clientStyleChanged();
	},

	clientStyleChanged: function () {
		this.$.generator.setClientStyle(this.clientStyle);
	},

	reset: function (inIndex) {
		this.getSelection().clear();
		this.invalidateMetrics();
		this.invalidatePages();
		this.stabilize();
		if(inIndex)
			this.scrollToRow(inIndex + 1);
		else
			this.scrollToRow(1);
	}

});