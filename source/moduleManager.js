enyo.kind({
    name: "biblez.moduleManager",
    kind: "enyo.FittableRows",
    fit: true,
    events: {
        onBack: "",
        onInstalled: ""
    },
    components: [
        {name: "messagePopup", kind: "onyx.Popup", centered: true, floating: true, classes: "message-popup"},
        {name: "scrim", kind: "onyx.Scrim", classes: "onyx-scrim-translucent"},
        {kind: "onyx.MoreToolbar", components: [
            {kind: "onyx.IconButton", src: "assets/back.png", ontap: "handleBack"},
            {content: $L("Module Manager")}
        ]},
        {name: "panel", arrangerKind: "CollapsingArranger", fit: true, kind: "Panels", classes: "app-panels", components: [
            {name: "panelLang", kind: "enyo.FittableRows", components: [
                {name: "langList", kind: "List", fit: true, touch: true, onSetupItem: "setupLangItem", components: [
                    {classes: "item", ontap: "handleLanguage", components: [
                        {kind: "enyo.FittableColumns", components: [
                            {name: "langShort", classes: "item-left"},
                            {name: "langName", style: "font-style: italic;"}
                        ]}

                    ]}
                ]}
            ]},
            {name: "panelModules", kind: "enyo.FittableRows", components: [
                {name: "modList", kind: "List", fit: true, touch: true, onSetupItem: "setupModItem", components: [
                    {classes: "item", ontap: "handleModule", components: [
                        {name: "modName"}
                    ]}
                ]}
            ]},
            {name: "panelDescription", kind: "enyo.FittableRows", components: [
                {kind: enyo.Scroller, touch: true, fit: true, components: [
                    {name: "detailsContainer", showing: false, classes: "content-container", components: [
                        {name: "detailsName", classes: "title"},
                        //{kind: "onyx.ProgressBar", name: "progressBar", progress: 0, showing: false, showStripes: false},
                        {kind: "onyx.Button", ontap: "installModule", name: "btnInstall", classes: "onyx-affirmative", content: $L("Install Module"), style: "margin-left: 10px;"},
                        {name: "detailsDescription", allowHtml: true, classes: "nice-padding"}
                    ]}
                ]}
            ]}
        ]},
        {kind: "onyx.MoreToolbar", name: "bottomTB", components: [
            {kind: "onyx.PickerDecorator", components: [
                {},
                {name: "repoPicker", kind: "onyx.Picker", onSelect: "handleRepoChange"}
            ]},
            {kind: "onyx.ProgressBar", name: "progressBar", progress: 0, showing: false, showStripes: false, fit: true}
        ]}
    ],

    lang: [],
    started: false,
    repos: [],
    modules: [],
    langModules: [],
    currentModule: null,

    rendered: function () {
        this.inherited(arguments);

    },

    start: function () {
        if (!this.started) {
            this.$.scrim.show();
            if (!api.get("lastRepoUpdate"))
                this.getRepos();
            else
                this.setupRepoPicker();
        }
        this.started = true;
    },

    handleBack: function() {
        if(enyo.Panels.isScreenNarrow()) {
            if(this.$.panel.getIndex() !== 0)
                this.$.panel.previous();
            else
                this.doBack();
        } else this.doBack();
    },

    handleRepoChange: function (inSender, inEvent) {
        this.$.detailsContainer.hide();
        this.$.scrim.show();
        this.$.modList.setCount(0);
        this.$.modList.refresh();
        this.$.panel.setIndex(0);
        api.set("currentRepo", this.repos[inEvent.selected.index]);
        this.getRemoteModules(this.repos[inEvent.selected.index]);
    },

    getRepos: function () {
        sword.installMgr.getRepositories(enyo.bind(this, function (inError, inRepos) {
            if (!inError) {
                api.set("repos", inRepos);
                api.set("lastRepoUpdate", {time: new Date().getTime()});
                this.setupRepoPicker(inRepos);
            } else {
                this.handleError((inError.message) ? inError.message : inError);
            }
        }));
    },

    setupRepoPicker: function (inRepos) {
        //console.log("setupRepoPicker", inRepos);
        if(!inRepos) {
            inRepos = api.get("repos");
        }

        var items = [],
            cw = null;
        var currentRepo = api.get("currentRepo");
        inRepos.forEach(function(repo,idx) {
            if ((currentRepo && repo.name === currentRepo.name) || repo.name === "CrossWire") {
                items.push({content: repo.name, index: idx, active: true});
                cw = repo;
            } else items.push({content: repo.name, index: idx});
        });

        this.repos = inRepos;
        this.$.repoPicker.createComponents(items, {owner: this});
        this.$.repoPicker.render();

        if(currentRepo) this.getRemoteModules(currentRepo);
        else this.getRemoteModules(cw);
    },

    getRemoteModules: function (inRepo) {
        //console.log(inRepo);
        var currentModules = api.get("currentModules");
        if(currentModules && inRepo.name === currentModules.name) {
            this.modules = currentModules.modules;
            this.prepareLangList(this.modules);
        } else {
            sword.installMgr.getModules(inRepo, enyo.bind(this, function (inError, inModules) {
                //enyo.log(inError, inModules, inModules.length);
                if(!inError) {
                    api.set("currentModules", {modules: inModules, name: inRepo.name});
                    this.modules = inModules;
                    //this.$.langList.setCount(inModules.length);
                    this.prepareLangList(this.modules);

                } else {
                    this.handleError((inError.message) ? inError.message : inError);
                }
            }));
        }
    },

    prepareLangList: function (inModules) {
        this.lang = [];
        inModules.forEach(enyo.bind(this, function(module, idx) {
            //console.log(module.Lang, inModules[idx+1].Lang);
            if (idx === 0) {
                this.lang.push({lang: module.Lang});
            } else if (idx > 0 && module.Lang !== inModules[idx-1].Lang) {
                this.lang.push({lang: module.Lang});
            }
        }));
        this.$.langList.setCount(this.lang.length);
        this.$.langList.refresh();
        this.$.scrim.hide();
    },

    setupLangItem: function(inSender, inEvent) {
        var data = this.lang[inEvent.index];
        this.$.langShort.setContent(data.lang);
        this.$.langName.setContent(languages[data.lang]);
        //this.$.index.setContent(inEvent.index);
    },

    handleLanguage: function(inSender, inEvent) {
        if(enyo.Panels.isScreenNarrow()) {
            this.$.panel.next();
        }
        this.langModules = [];
        this.modules.forEach(enyo.bind(this, function (module, idx) {
            if(module.Lang === this.lang[inEvent.index].lang)
                this.langModules.push(module);
        }));
        this.$.modList.setCount(this.langModules.length);
        this.$.modList.refresh();
    },

    // Module List //
    setupModItem: function (inSender, inEvent) {
        var data = this.langModules[inEvent.index];
        this.$.modName.setContent(data.Description);
    },

    handleModule: function (inSender, inEvent) {
        if(enyo.Panels.isScreenNarrow()) {
            this.$.panel.next();
        }
        this.$.detailsContainer.show();
        var data = this.langModules[inEvent.index];
        this.currentModule = data;
        this.$.detailsName.setContent(data.Description);
        this.$.detailsDescription.setContent(data.About.replace(/\\par/g, "<br>"));
    },

    installModule: function (inSender, inEvent) {
        console.log(this.currentModule.url);
        this.$.btnInstall.setDisabled(true);
        this.$.progressBar.show();
        this.$.bottomTB.render();
        sword.installMgr.installModule(this.currentModule.url, enyo.bind(this, function (inError, inModule) {
            if (!inError) {
                this.doInstalled();
            } else {
                this.handleError((inError.message) ? inError.message : inError);
            }
            //console.log(inError, inModule);
            this.$.progressBar.hide();
            this.$.progressBar.setProgress(0);
            this.$.btnInstall.setDisabled(false);
        }),
        enyo.bind(this, function (inEvent) {
            this.$.progressBar.animateProgressTo(inEvent.loaded/inEvent.total*100);
        }));
    },

    handleError: function (inMessage) {
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});