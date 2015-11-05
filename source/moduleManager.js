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
            {content: $L("Module Manager")},
            {fit: true},
            {kind: "onyx.IconButton", src: "assets/refresh.png", ontap: "handleReload"}
        ]},
        {name: "panel", arrangerKind: "CollapsingArranger", fit: true, kind: "Panels", classes: "app-panels", components: [
            {name: "panelLang", kind: "enyo.FittableRows", components: [
                {classes: "center", components: [{kind: "onyx.Spinner", name: "spinner", classes: "onyx-light center"}]},
                {name: "langList", kind: "List", fit: true, onSetupItem: "setupLangItem", components: [
                    {name: "langItem", classes: "item", ontap: "handleLanguage", components: [
                        {kind: "enyo.FittableColumns", components: [
                            {name: "langShort", classes: "item-left"},
                            {name: "langName", style: "font-style: italic;"}
                        ]}

                    ]}
                ]}
            ]},
            {name: "panelModules", kind: "enyo.FittableRows", components: [
                {name: "modList", kind: "List", fit: true, onSetupItem: "setupModItem", components: [
                    {name: "modItem", classes: "item", ontap: "handleModule", components: [
                        {name: "modName"}
                    ]}
                ]}
            ]},
            {name: "panelDescription", kind: "enyo.FittableRows", components: [
                {name: "descrScroller", kind: enyo.Scroller, fit: true, components: [
                    {name: "detailsContainer", showing: false, classes: "content-container", components: [
                        {name: "detailsName", classes: "title"},
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
            {kind: "onyx.ProgressBar", name: "progressBar", progress: 0, showing: false, showStripes: false, animateStripes: true, fit: true}
        ]}
    ],

    lang: [],
    started: false,
    repos: [],
    modules: [],
    langModules: [],
    currentModule: null,
    installedModules: [],

    handleReload: function() {
        if(this.currentRepo)
            this.getRemoteModules(this.currentRepo, true);
    },

    start: function () {
        if (!this.started) {
            this.$.spinner.show();
            api.get("repos", enyo.bind(this, function (inError, inData) {
                if(!inError) {
                    if(!inData)
                        this.getRepos();
                    else
                        this.setupRepoPicker(inData.repos, inData.currentRepo);
                } else {
                    this.handleError(inError);
                }
            }));
        }
        this.getInstalledModules();
        this.started = true;

        //improve scrolling performance on Android
        if(this.$.langList.getStrategy().get("kind") === "TranslateScrollStrategy") {
            this.$.langList.getStrategy().set("translateOptimized", true);
            this.$.modList.getStrategy().set("translateOptimized", true);
            this.$.descrScroller.getStrategy().set("translateOptimized", true);
        }
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
        if(navigator.onLine) {
            if (window.navigator.mozApps) {
                var request = navigator.mozApps.getSelf();
                request.onsuccess = enyo.bind(this, function() {
                    if (request.result && !enyo.platform.firefox) {
                        sword.installMgr.getRepositories(enyo.bind(this, function (inError, inRepos) {
                            if (!inError) {
                                this.saveRepoData(inRepos);
                            } else {
                                this.handleError(inError);
                                this.getReopsXHR();
                            }
                        }));
                    } else {
                        this.getReposXHR();
                    }
                });
            } //else handle non firefox browser
        } else {
            this.$.spinner.stop();
            this.handleError({message: $L("You need an internet connection to download modules!")});
        }
    },

    getReposXHR: function (){
        var xhr = new enyo.Ajax({url: "http://zefanjas.de/apps/biblezMasterlist.php"});
        xhr.go();
        xhr.response(this, function (inSender, inRepos) {
            this.saveRepoData(inRepos);
        });
        xhr.error(this, function (inSender, inResponse) {
            this.log(inSender, inResponse);
            this.handleError({message: "Couldn't download MasterList!"});
        });
    },

    saveRepoData: function (inRepos) {
        api.put({id: "repos", repos: inRepos, lastRepoUpdate: {time: new Date().getTime()}},
            enyo.bind(this, function (inError, inId) {
                if(!inError)
                    this.setupRepoPicker(inRepos);
                else
                    this.handleError(inError);
            })
        );
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

    getRemoteModules: function (inRepo, inForceReload) {
        this.currentRepo = inRepo;
        //console.log(inRepo, inForceReload);
        api.get("downloadedModules", enyo.bind(this, function (inError, allModules) {
            //console.log(inRepo, allModules, this.repos);
            if(!inError) {
                if(allModules && allModules.hasOwnProperty(inRepo.name.replace(" ", "")) && !inForceReload) {
                    this.modules = allModules[inRepo.name.replace(" ", "")].modules;
                    this.prepareLangList(this.modules);
                } else {
                    if (navigator.onLine) {
                        if (window.navigator.mozApps) {
                            var request = navigator.mozApps.getSelf();
                            request.onsuccess = enyo.bind(this, function() {
                                if (request.result && !enyo.platform.firefox) {
                                    sword.installMgr.getModules(inRepo, enyo.bind(this, function (inError, inModules) {
                                        //enyo.log(inError, inModules, inModules.length);
                                        if(!inError) {
                                            if(!allModules) allModules = {id: "downloadedModules"};
                                            this.handleGotRemoteModules(allModules, inModules, inRepo);
                                        } else {
                                            this.handleError((inError.message) ? inError.message : inError);
                                            this.getRemoteModulesXHR(inRepo, allModules);
                                        }
                                    }));
                                } else {
                                    this.getRemoteModulesXHR(inRepo, allModules);
                                }
                            });
                        } //else handle non firefox browser
                    } else {
                        this.$.spinner.stop();
                        this.handleError({message: $L("You need an internet connection to download modules!")});
                    }
                }
            } else
                this.handleError(inError);
        }));

    },

    getRemoteModulesXHR: function (inRepo, allModules) {
        var xhr = new enyo.Ajax({url: "http://zefanjas.de/apps/biblezModules.php"});
        xhr.go({modUrl: inRepo.url});
        xhr.response(this, function (inSender, inModules) {
            inModules = api.cleanArray(inModules).sort(api.dynamicSortMultiple("Lang", "moduleKey"));
            if(!allModules) allModules = {id: "downloadedModules"};
            this.handleGotRemoteModules(allModules, inModules, inRepo);
        });
        xhr.error(this, function (inSender, inResponse) {
            this.handleError({message: "Couldn't download Modules!"});
        });
    },

    handleGotRemoteModules: function(allModules, inModules, inRepo) {
        allModules[inRepo.name.replace(" ", "")] = {modules: inModules, name: inRepo.name};
        api.put(allModules, enyo.bind(this, function (inError, inId) {
            if(inError)
                this.handleError(inError);
        }));
        this.modules = inModules;
        this.prepareLangList(this.modules);
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
        this.$.langList.reset();


    },

    setupLangItem: function(inSender, inEvent) {
        var data = this.lang[inEvent.index];
        this.$.langShort.setContent(data.lang);
        this.$.langName.setContent(languages[data.lang]);
        this.$.langItem.addRemoveClass("list-selected", inSender.isSelected(inEvent.index));
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
        this.$.modList.reset();
    },

    // Module List //
    setupModItem: function (inSender, inEvent) {
        var data = this.langModules[inEvent.index];
        this.$.modName.setContent(data.Description);
        this.$.modItem.addRemoveClass("list-selected", inSender.isSelected(inEvent.index));
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
        if (window.navigator.mozApps) {
            var request = navigator.mozApps.getSelf();
            request.onsuccess = enyo.bind(this, function() {
                if (request.result && !enyo.platform.firefox) {
                    this.$.progressBar.setShowStripes(false);
                    sword.installMgr.installModule(this.currentModule.url,
                        enyo.bind(this, this.handleInstalled),
                    enyo.bind(this, function (inEvent) {
                        this.$.progressBar.animateProgressTo(inEvent.loaded/inEvent.total*100);
                    }));
                } else {
                    this.installModuleXHR();
                }
            });
        }
    },

    installModuleXHR: function () {
        this.$.progressBar.setShowStripes(true);
        var xhr = new XMLHttpRequest({mozSystem: true, mozAnon: true});
        var url = "http://zefanjas.de/apps/biblezGetModule.php?modKey="+this.currentModule.moduleKey+"&type="+this.currentRepo.type;
        xhr.open('GET', url, true);
        xhr.responseType = "blob";
        xhr.onreadystatechange = enyo.bind(this, function (evt) {
            //console.log(xhr.readyState, evt, xhr.status);
            if (xhr.readyState == 4) {
                if(xhr.status === 200)
                    sword.installMgr.installModule(xhr.response, enyo.bind(this, this.handleInstalled));
                else
                    this.handleError({message: "Couldn't download module.", error: xhr.status});
            }
        });
        xhr.onprogress = enyo.bind(this, function (inEvent) {
            this.$.progressBar.animateProgressTo(100);
        });
        xhr.onerror = enyo.bind(this, function (inError) {
            this.handleError({message: "Couldn't download Module!"});
            this.$.btnInstall.show();
            this.$.btnInstall.setDisabled(false);
            this.$.btnRemove.hide();
        });
        xhr.send(null);
    },

    handleInstalled: function (inError, inModule) {
        if (!inError) {
            this.doInstalled();
            this.getInstalledModules();
            this.$.btnInstall.hide();
            this.$.btnRemove.show();
        } else {
            this.log(inError);
            this.handleError(inError);
            this.$.btnInstall.show();
            this.$.btnRemove.hide();
            this.installModuleXHR();
        }
        this.$.progressBar.hide();
        this.$.progressBar.setProgress(0);
        this.$.btnInstall.setDisabled(false);
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