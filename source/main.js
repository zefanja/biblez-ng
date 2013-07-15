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
			{kind: "onyx.MenuDecorator", onSelect: "moduleSelected", components: [
				{content: "", name: "moduleLabel"},
				{kind: "onyx.Menu", name: "moduleMenu"}
			]},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", placeholder: "Enter a passage...", onchange: "handlePassage", name: "passageInput", value: "Matt 1"}
			]}
		]},
		{kind: "enyo.Scroller", touch: true, fit: true, components: [
			{kind: "onyx.Spinner", name: "spinner", classes: "onyx-light"},
			{name: "main", classes: "nice-padding", allowHtml: true}
		]},
		{kind: "onyx.MoreToolbar", components: [
			{kind: "onyx.IconButton", src: "assets/modules.png", ontap: "doOpenModuleManager"},
			{kind: "onyx.Button", content: "Delete all Modules", ontap: "clearDB"}
			//{kind: "onyx.Button", content: "Install ESV", esv: true, ontap: "handleInstallTap"},
			//{kind: "Input", type: "file", onchange: "handleInstallTap"}
		]}
	],

	currentModule: null,
	modules: [],

	create: function () {
		this.inherited(arguments);
		this.$.spinner.stop();
		this.getInstalledModules();
	},

	getInstalledModules: function (inSender, inEvent) {
		sword.moduleMgr.getModules(enyo.bind(this, function(inError, inModules) {
			if(inModules.length !== 0) {
				this.currentModule = inModules[0];
				this.handlePassage();
				this.$.moduleLabel.setContent(this.currentModule.config.moduleKey);
				this.modules = inModules;
				var mods = [];
				this.modules.forEach(enyo.bind(this, function (mod, idx) {
					mods.push({content: mod.config.moduleKey, index: idx});
				}));
				this.$.moduleMenu.createComponents(mods, {owner: this.$.moduleMenu});
				this.$.moduleMenu.render();
			}
		}));
	},

	moduleSelected: function (inSender, inEvent) {
		this.currentModule = this.modules[inEvent.originator.index];
		this.$.moduleLabel.setContent(this.currentModule.config.moduleKey);
		this.handlePassage();
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
					self.currentModule = inModule;
					self.$.spinner.stop();
					if(!inError) {
						self.$.main.setContent(enyo.json.stringify(inModule.config));
						self.$.moduleLabel.setContent(inModule.config.moduleKey);
					}
				});
		});
	},

	clearDB: function () {
		sword.dataMgr.clearDatabase();
	},

	handlePassage: function (inSender, inEvent) {
		//console.log("PASSAGE", inSender.getValue());
		if(!inSender)
			inSender = this.$.passageInput;
		this.currentModule.renderText(inSender.getValue(), {oneVersePerLine: true}, enyo.bind(this, function (inError, inText) {
			//console.log(inError, inText);
			this.$.main.setContent(inText);
		}));
	}
});
