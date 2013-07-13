enyo.kind({
    name: "biblez.moduleManager",
    kind: "enyo.FittableRows",
    fit: true,
    classes: "app-panels",
    arrangerKind: "CollapsingArranger",
    events: {
        onBack: ""
    },
    components: [
        {kind: "onyx.MoreToolbar", components: [
            {kind: "onyx.Button", content: $L("<"), ontap: "doBack"},
            {content: $L("Module Manager")},
            {kind: "onyx.PickerDecorator", components: [
                {},
                {name: "repoPicker", kind: "onyx.Picker"}
            ]}
        ]},
        {name: "panel", kind: "Panels", components: [
            {name: "panelLang", components: [
                {name: "langList", kind: "List", fit: true, onSetupItem: "setupLangItem", components: [
                    {classes: "item", ontap: "itemTap", components: [
                        {name: "lang"},
                        {name: "index", style: "float: right;"}
                    ]}
                ]}
            ]},
            {name: "panelModules"},
            {name: "panelDescription"}
        ]}

    ],

    lang: [],
    repos: [],
    modules: [],

    rendered: function () {
        this.inherited(arguments);
        if (!api.get("lastRepoUpdate"))
            this.getRepos();
        else
            this.setupRepoPicker();
    },

    getRepos: function () {
        sword.installMgr.getRepositories(enyo.bind(this, function (inError, inRepos) {
            console.log(inError, inRepos);
            api.set("repos", inRepos);
            api.set("lastRepoUpdate", {time: new Date().getTime()});
            this.setupRepoPicker(inRepos);
        }));
    },

    setupRepoPicker: function (inRepos) {
        if(!inRepos)
            inRepos = api.get("repos");

        var items = [];
        inRepos.forEach(function(repo,idx) {
            if (repo.name === "CrossWire") items.push({content: repo.name, index: idx, active: true});
            else items.push({content: repo.name, index: idx});
        });

        this.repos = inRepos;
        this.$.repoPicker.createComponents(items, {owner: this});
        this.$.repoPicker.render();


    },

    setupLangItem: function(inSender, inEvent) {
        var data = this.lang[inEvent.index];
        //this.$.name.setContent(data.name);
        //this.$.index.setContent(inEvent.index);
    },
    handleLanguage: function(inSender, inEvent) {
        //alert("You tapped on row: " + inEvent.index);
    }
});