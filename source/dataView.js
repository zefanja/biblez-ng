enyo.kind({
    name: "biblez.dataView",
    kind: "enyo.FittableRows",
    fit: true,
    events: {
        onBack: "",
        onVerse: ""
    },
    published: {
        section: ""
    },
    components: [
        {name: "messagePopup", kind: "onyx.Popup", centered: true, floating: true, classes: "message-popup"},
        {kind: "onyx.MoreToolbar", layoutKind:"FittableColumnsLayout", components: [
            {kind: "onyx.IconButton", src: "assets/back.png", ontap: "handleBack"},
            {kind: "onyx.RadioGroup", onActivate:"sectionActivated", classes: "center", fit: true, defaultKind: "onyx.IconButton", components: [
                {name: "rbBm", src: "assets/bookmarksTB.png", section: "bookmarks", style: "margin: 0 10px;"},
                {name: "rbNotes", src: "assets/notesTB.png", section: "notes", style: "margin: 0 10px;"},
                {name: "rbHl", src: "assets/highlightsTB.png", section: "highlights", style: "margin: 0 10px;"}
            ]},
        ]},
        {name: "noData", classes: "center", style: "margin-top: 10px;", showing: false},
        {name: "dataList", kind: "List", fit: true, touch: true, onSetupItem: "setupItem", components: [
            {name: "item", classes: "item", ontap: "handleListTap", components: [
                {kind: "enyo.FittableRows", components: [
                    {name: "itemOsis", classes: ""},
                    {name: "itemText", classes: "item-text", allowHtml: true}
                ]}
            ]}
        ]}
    ],

    data: [],

    sectionActivated: function (inSender, inEvent) {
        if (inEvent.originator.getActive()) {
            this.setSection(inEvent.originator.section);
        }
        return true;
    },

    updateSection: function (inSection) {
        if(inSection)
            this.section = inSection;
        this.sectionChanged();
    },

    sectionChanged: function (inSender, inEvent) {
        if (this.section === "bookmarks") {
            this.$.rbBm.setActive(true);
            api.getAllBookmarks(enyo.bind(this, function (inError, inData) {
                if(!inError) {
                    this.data = inData;
                    this.updateList();
                } else
                    this.handleError(inError);
            }));
        } else if (this.section === "notes") {
            this.$.rbNotes.setActive(true);
            api.getAllNotes(enyo.bind(this, function (inError, inData) {
                if(!inError) {
                    this.data = inData;
                    this.updateList();
                    this.$.dataList.refresh();
                } else
                    this.handleError(inError);
            }));
        } else if (this.section === "highlights") {
            this.$.rbHl.setActive(true);
            api.getAllHighlights(enyo.bind(this, function (inError, inData) {
                if(!inError) {
                    this.data = inData;
                    this.updateList();
                } else
                    this.handleError(inError);
            }));
        }
    },

    updateList: function () {
        this.$.dataList.setCount(this.data.length);
        if(this.data.length === 0) {
            this.$.noData.show();
            if(this.section === "bookmarks")
                this.$.noData.setContent($L("No Bookmarks.") + " " + $L("Tap on a verse number to add one."));
            else if(this.section === "notes")
                this.$.noData.setContent($L("No Notes.") + " " + $L("Tap on a verse number to add one."));
            else if(this.section === "highlights")
                this.$.noData.setContent($L("No Highlights.") + " " + $L("Tap on a verse number to add one."));
        } else
            this.$.noData.hide();
        this.$.dataList.refresh();
        this.$.dataList.reflow();
    },

    setupItem: function(inSender, inEvent) {
        var data = this.data[inEvent.index];
        this.$.itemOsis.setContent(api.formatOsis(data.osisRef));
        if(this.section === "highlights")
            this.$.item.applyStyle("background-color", data.color);
        else
            this.$.item.applyStyle("background-color", null);
        if(this.section === "notes")
            this.$.itemText.setContent(data.text);
        else
            this.$.itemText.setContent("");
        //this.$.index.setContent(inEvent.index);
    },

    handleListTap: function (inSender, inEvent) {
        this.doVerse({osisRef: this.data[inEvent.index].osisRef});
    },

    handleBack: function() {
        this.doBack();
    },

    handleError: function (inMessage) {
        if (inMessage.message)
            inMessage = inMessage.message;
        this.$.messagePopup.setContent(inMessage);
        this.$.messagePopup.show();
    }
});