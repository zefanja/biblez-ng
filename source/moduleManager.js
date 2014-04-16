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
                {classes: "center", components: [{kind: "onyx.Spinner", name: "spinner", classes: "onyx-light center"}]},
                {name: "langList", kind: "List", fit: true, onSetupItem: "setupLangItem", components: [
                    {classes: "item", ontap: "handleLanguage", components: [
                        {kind: "enyo.FittableColumns", components: [
                            {name: "langShort", classes: "item-left"},
                            {name: "langName", style: "font-style: italic;"}
                        ]}

                    ]}
                ]}
            ]},
            {name: "panelModules", kind: "enyo.FittableRows", components: [
                {name: "modList", kind: "List", fit: true, onSetupItem: "setupModItem", components: [
                    {classes: "item", ontap: "handleModule", components: [
                        {name: "modName"}
                    ]}
                ]}
            ]},
            {name: "panelDescription", kind: "enyo.FittableRows", components: [
                {kind: enyo.Scroller, fit: true, components: [
                    {name: "detailsContainer", showing: false, classes: "content-container", components: [
                        {name: "detailsName", classes: "title"},
                        //{kind: "onyx.ProgressBar", name: "progressBar", progress: 0, showing: false, showStripes: false},
                        {kind: "onyx.Button", ontap: "installModule", name: "btnInstall", classes: "onyx-affirmative", content: $L("Install Module"), style: "margin-left: 10px;"},
                        {kind: "onyx.Button", ontap: "removeModule", name: "btnRemove", showing: false, classes: "onyx-negative", content: $L("Remove Module"), style: "margin-left: 10px;"},
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
    installedModules: [],

    start: function () {
        if (!this.started) {
            this.$.spinner.show();
            api.get("repos", enyo.bind(this, function (inError, inData) {
                if(!inData)
                    this.getRepos();
                else
                    this.setupRepoPicker(inData.repos, inData.currentRepo);
            }));
        }
        this.getInstalledModules();
        this.started = true;
    },

    getInstalledModules: function () {
        sword.moduleMgr.getModules(enyo.bind(this, function (inError, inModules) {
            //console.log(inModules);
            if(!inError && inModules.length !== 0) {
                this.installedModules = inModules;
            }
        }));
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

        this.$.modList.setCount(0);
        this.$.modList.refresh();
        this.$.langList.setCount(0);
        this.$.langList.refresh();
        this.$.spinner.show();
        this.$.panel.setIndex(0);

        api.get("repos", enyo.bind(this, function(inError, inRepos) {
            if(!inError) {
                inRepos["currentRepo"] = this.repos[inEvent.selected.index];
                api.put(inRepos);
            } else
                this.handleError(inError);
        }));
        //console.log(inEvent.selected.index);
        this.getRemoteModules(this.repos[inEvent.selected.index]);
    },

    getRepos: function () {
        if(navigator.onLine)
            if(enyo.platform.firefoxOS) {
                sword.installMgr.getRepositories(enyo.bind(this, function (inError, inRepos) {
                    if (!inError) {
                        api.put({id: "repos", repos: inRepos, lastRepoUpdate: {time: new Date().getTime()}},
                            enyo.bind(this, function (inError, inId) {
                                if(!inError)
                                    this.setupRepoPicker(inRepos);
                                else
                                    this.handleError(inError);
                            })
                        );

                    } else {
                        this.handleError(inError);
                    }
                }));
            } else {
                var xhr = new enyo.Ajax({url: "http://zefanjas.de/apps/biblezMasterlist.php"});
                xhr.go();
                xhr.response(this, function (inSender, inRepos) {
                    api.put({id: "repos", repos: inRepos, lastRepoUpdate: {time: new Date().getTime()}},
                        enyo.bind(this, function (inError, inId) {
                            if(!inError)
                                this.setupRepoPicker(inRepos);
                            else
                                this.handleError(inError);
                        })
                    );
                });
                xhr.error(this, function (inSender, inResponse) {
                    this.handleError({message: "Couldn't download MasterList!"});
                });
            }
        else {
            this.$.spinner.stop();
            this.handleError({message: $L("You need an internet connection to download modules!")});
        }
    },

    setupRepoPicker: function (inRepos, currentRepo) {
        this.currentRepo = currentRepo;
        var items = [],
            cw = null;
        inRepos.forEach(enyo.bind(this, function(repo, idx) {
            if ((this.currentRepo && repo.name === this.currentRepo.name) || repo.name === "CrossWire") {
                items.push({content: repo.name, index: idx, active: true});
                cw = repo;
            } else items.push({content: repo.name, index: idx});
        }));

        this.repos = inRepos;
        this.$.repoPicker.createComponents(items, {owner: this});
        this.$.repoPicker.render();

        if (this.currentRepo)
            this.getRemoteModules(this.currentRepo);
        else
            this.getRemoteModules(cw);
    },

    getRemoteModules: function (inRepo) {
        this.currentRepo = inRepo;
        //console.log(inRepo);
        api.get("downloadedModules", enyo.bind(this, function (inError, allModules) {
            //console.log(inRepo, allModules, this.repos);
            if(!inError) {
                if(allModules && allModules.hasOwnProperty(inRepo.name.replace(" ", ""))) {
                    this.modules = allModules[inRepo.name.replace(" ", "")].modules;
                    this.prepareLangList(this.modules);
                } else {
                    if (navigator.onLine)
                        if(enyo.platform.firefoxOS) {
                            sword.installMgr.getModules(inRepo, enyo.bind(this, function (inError, inModules) {
                                //enyo.log(inError, inModules, inModules.length);
                                if(!inError) {
                                    if(!allModules) allModules = {id: "downloadedModules"};
                                    allModules[inRepo.name.replace(" ", "")] = {modules: inModules, name: inRepo.name};
                                    api.put(allModules, enyo.bind(this, function (inError, inId) {
                                        if(inError)
                                            this.handleError(inError);
                                    }));
                                    this.modules = inModules;
                                    this.prepareLangList(this.modules);

                                } else {
                                    this.handleError((inError.message) ? inError.message : inError);
                                }
                            }));
                        } else {
                            var xhr = new enyo.Ajax({url: "http://zefanjas.de/apps/biblezModules.php"});
                            xhr.go({modUrl: inRepo.url});
                            xhr.response(this, function (inSender, inModules) {
                                inModules = api.cleanArray(inModules).sort(api.dynamicSortMultiple("Lang", "moduleKey"));
                                if(!allModules) allModules = {id: "downloadedModules"};
                                    allModules[inRepo.name.replace(" ", "")] = {modules: inModules, name: inRepo.name};
                                    api.put(allModules, enyo.bind(this, function (inError, inId) {
                                        if(inError)
                                            this.handleError(inError);
                                    }));
                                    this.modules = inModules;
                                    this.prepareLangList(this.modules);
                            });
                            xhr.error(this, function (inSender, inResponse) {
                                //console.log(inSender, inResponse);
                                this.handleError({message: "Couldn't download Modules!"});
                            });
                        }
                    else {
                        this.$.spinner.stop();
                        this.handleError({message: $L("You need an internet connection to download modules!")});
                    }
                }
            } else
                this.handleError(inError);
        }));

    },

    prepareLangList: function (inModules) {
        this.$.spinner.hide();
        this.lang = [];
        inModules.forEach(enyo.bind(this, function(module, idx) {
            //console.log(module.Lang, inModules[idx+1].Lang);
            if (idx === 0) {
                this.lang.push({lang: module.Lang});
            } else if (idx > 0 && module.Lang !== inModules[idx-1].Lang) {
                this.lang.push({lang: module.Lang});
            }
        }));
        this.$.panelLang.reflow();
        this.$.langList.setCount(this.lang.length);
        this.$.langList.refresh();


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
        this.$.btnInstall.show();
        this.$.btnRemove.hide();
        this.currentModule = this.langModules[inEvent.index];
        this.installedModules.forEach(enyo.bind(this, function(mod) {
            if(mod.modKey === this.currentModule.moduleKey) {
                this.$.btnInstall.hide();
                this.$.btnRemove.show();
            }
        }));
        this.$.detailsContainer.show();
        this.$.detailsName.setContent(this.currentModule.Description);
        this.$.detailsDescription.setContent(this.currentModule.About.replace(/\\par/g, "<br>"));
    },

    installModule: function (inSender, inEvent) {
        //console.log(this.currentModule.url);
        this.$.btnInstall.setDisabled(true);
        this.$.progressBar.show();
        this.$.bottomTB.render();
        if(enyo.platform.firefoxOS) {
            sword.installMgr.installModule(this.currentModule.url, enyo.bind(this, function (inError, inModule) {
                if (!inError) {
                    this.doInstalled();
                    this.getInstalledModules();
                    this.$.btnInstall.hide();
                    this.$.btnRemove.show();
                } else {
                    console.log(inError);
                    this.handleError(inError);
                    this.$.btnInstall.show();
                    this.$.btnRemove.hide();
                }
                //console.log(inError, inModule);


            }),
            enyo.bind(this, function (inEvent) {
                this.$.progressBar.animateProgressTo(inEvent.loaded/inEvent.total*100);
            }));
        } else {
            var xhr = new XMLHttpRequest({mozSystem: true, mozAnon: true});
            var url = "http://zefanjas.de/apps/biblezGetModule.php?modKey="+this.currentModule.moduleKey+"&type="+this.currentRepo.type;
            xhr.open('GET', url, true);
            xhr.responseType = "blob";
            xhr.onreadystatechange = enyo.bind(this, function (evt) {
                //console.log(xhr.readyState, evt, xhr.status);
                if (xhr.readyState == 4) {
                    if(xhr.status === 200)
                        sword.installMgr.installModule(xhr.response, enyo.bind(this, function (inError, inModule) {
                            if (!inError) {
                                this.doInstalled();
                                this.getInstalledModules();
                                this.$.btnInstall.hide();
                                this.$.btnRemove.show();
                            } else {
                                this.handleError((inError.message) ? inError.message : inError);
                            }
                            this.$.progressBar.hide();
                            this.$.progressBar.setProgress(0);
                            this.$.btnInstall.setDisabled(false);
                        }));
                    else
                        this.handleError({message: "Couldn't download module.", error: xhr.status});
                }
            });
            xhr.onprogress = enyo.bind(this, function (inEvent) {
                this.$.progressBar.animateProgressTo(inEvent.loaded/4000000*100);
            });
            xhr.onerror = enyo.bind(this, function (inError) {
                this.handleError({message: "Couldn't download Module!"});
                this.$.btnInstall.show();
                this.$.btnRemove.hide();
            });
            xhr.send(null);
        }

    },

    removeModule: function (inSender, inEvent) {
        sword.installMgr.removeModule(this.currentModule.moduleKey, enyo.bind(this, function (inError) {
            if(!inError) {
                this.doInstalled();
                this.$.btnInstall.show();
                this.$.btnRemove.hide();
            } else {
                this.handleError(inError);
            }
        }));
    },

    clearDB: function () {
        sword.dataMgr.clearDatabase();
    },

    handleError: function (inMessage) {
        if (inMessage.message)
            inMessage = inMessage.message;
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});