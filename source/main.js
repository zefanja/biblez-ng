enyo.kind({
	name: "biblez.main",
	kind: "FittableRows",
	fit: true,
	events: {
		onOpenModuleManager: "",
		onModuleChanged: "",
        onOpenBC: ""
	},
	published: {
        passage: ""
	},
	components:[
		//{kind: "Signals", onSwordReady: "getBible"},
        {name: "messagePopup", kind: "onyx.Popup", centered: true, floating: true, classes: "message-popup"},
		{kind: "onyx.MoreToolbar", components: [
			{kind: "onyx.MenuDecorator", onSelect: "moduleSelected", components: [
				{kind: "onyx.IconButton", src: "assets/modules.png"},
				{kind: "onyx.Menu", name: "moduleMenu"}
			]},
            {kind: "onyx.Button", name: "btnPassage", ontap: "doOpenBC"}
			/*{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", placeholder: "Enter a passage...", onchange: "handlePassage", name: "passageInput", value: "Matt 1"}
			]}*/
		]},
		{kind: "enyo.Scroller", touch: true, fit: true, components: [
			{kind: "onyx.Spinner", name: "spinner", classes: "onyx-light"},
			{name: "main", classes: "nice-padding", allowHtml: true}
		]},
		{kind: "onyx.MoreToolbar", components: [
			{kind: "onyx.IconButton", src: "assets/add.png", ontap: "doOpenModuleManager"},
			{kind: "onyx.Button", content: "Delete all Modules", ontap: "clearDB"}
			//{kind: "onyx.Button", content: "Install ESV", esv: true, ontap: "handleInstallTap"},
			//{kind: "Input", type: "file", onchange: "handleInstallTap"}
		]}
	],

	currentModule: null,
    currentPassage: "Matt 1",
	modules: [],

	create: function () {
		this.inherited(arguments);
		this.$.spinner.stop();
        this.getInstalledModules();
	},

    rendered: function () {
        this.inherited(arguments);
    },

	getInstalledModules: function (inSender, inEvent) {
		sword.moduleMgr.getModules(enyo.bind(this, function(inError, inModules) {
            if (!inError) {
                if(inModules.length !== 0) {
                    this.currentModule = inModules[0];
                    this.doModuleChanged({module: this.currentModule});
                    this.handlePassage();
                    //this.$.moduleLabel.setContent(this.currentModule.config.moduleKey);
                    this.modules = inModules;
                    var mods = [];
                    this.modules.forEach(enyo.bind(this, function (mod, idx) {
                        if (this.currentModule.modKey === mod.modKey || idx === 0)
                            mods.push({content: mod.config.moduleKey, index: idx, active: true});
                        else
                            mods.push({content: mod.config.moduleKey, index: idx});
                        }));
                    this.$.moduleMenu.createComponents(mods, {owner: this.$.moduleMenu});
                    this.$.moduleMenu.render();
                }
            } else {
                this.handleError(inError);
            }
		}));
	},

	moduleSelected: function (inSender, inEvent) {
		this.currentModule = this.modules[inEvent.originator.index];
		this.doModuleChanged({module: this.currentModule});
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
					} else
                        this.handleError(inError);
				});
            else
                this.handleError(inError);
		});
	},

	clearDB: function () {
		sword.dataMgr.clearDatabase();
	},

    passageChanged: function (inSender, inEvent) {
        this.currentPassage = inEvent.book.abbrev + " " + inEvent.chapter;
        this.handlePassage(inEvent.osis);
    },

	handlePassage: function (passage) {
		//console.log("PASSAGE", inSender.getValue());
		if(!passage)
			passage = this.currentPassage;
        this.$.btnPassage.setContent(this.currentPassage);
		this.currentModule.renderText(passage, {oneVersePerLine: true}, enyo.bind(this, function (inError, inText) {
			console.log(inError);
            if(!inError)
                this.$.main.setContent(inText);
            else
                this.handleError(inError);
		}));
	},

    handleError: function (inMessage) {
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});
