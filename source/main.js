enyo.kind({
	name: "biblez.main",
	kind: "FittableRows",
	fit: true,
	events: {
		onOpenModuleManager: ""
	},
	components:[
		//{kind: "Signals", onSwordReady: "getBible"},
		{kind: "onyx.MoreToolbar", components: [
			{content: "", name: "bible"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", placeholder: "Enter a passage...", onchange: "handlePassage"}
			]}
		]},
		{kind: "enyo.Scroller", fit: true, components: [
			{kind: "onyx.Spinner", name: "spinner", classes: "onyx-light"},
			{name: "main", classes: "nice-padding", allowHtml: true}
		]},
		{kind: "onyx.MoreToolbar", components: [
			{kind: "onyx.IconButton", src: "assets/modules.png", ontap: "doOpenModuleManager"}
			//{kind: "onyx.Button", content: "Delete all Modules", ontap: "clearDB"},
			//{kind: "onyx.Button", content: "Install ESV", esv: true, ontap: "handleInstallTap"},
			//{kind: "Input", type: "file", onchange: "handleInstallTap"}
		]}
	],

	bible: null,

	create: function () {
		this.inherited(arguments);
		this.$.spinner.stop();
		this.getBible();
	},



	getBible: function (inSender, inEvent) {
		sword.moduleMgr.getModules(enyo.bind(this, function(inError, inModules) {
			if(inModules.length !== 0) {
				this.bible = inModules[0];
				this.$.bible.setContent(this.bible.config.moduleKey);
			}
		}));
	},

	handleInstallTap: function (inSender, inEvent) {
		this.$.spinner.start();
		self = this;
		self.$.main.setContent("Installing Module...");
		var blob = "ESV.zip";
		if (!inSender.esv)
			blob = inEvent.target.files[0];
		sword.installMgr.installModule(blob, function (inError, inId) {
			//console.log(inError, inId);
			if(!inError)
				sword.moduleMgr.getModule(inId, function (inError, inModule) {
					//console.log(inError, inModule);
					self.bible = inModule;
					self.$.spinner.stop();
					if(!inError) {
						self.$.main.setContent(enyo.json.stringify(inModule.config));
						self.$.bible.setContent(inModule.config.moduleKey);
					}
				});
		});
	},

	clearDB: function () {
		sword.dataMgr.clearDatabase();
	},

	handlePassage: function (inSender, inEvent) {
		//console.log("PASSAGE", inSender.getValue());
		this.bible.renderText(inSender.getValue(), enyo.bind(this, function (inError, inText) {
			//console.log(inError, inText);
			this.$.main.setContent(inText);
		}));
	}
});
