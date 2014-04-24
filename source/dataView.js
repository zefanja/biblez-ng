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
        {kind: "onyx.MoreToolbar", layoutKind:"FittableColumnsLayout", classes: "main-toolbar", components: [
            {name: "btBack", kind: "onyx.IconButton", src: "assets/back.png", ontap: "handleBack"},
            {name: "btHide", kind: "onyx.IconButton", src: "assets/hide.png", showing: false, ontap: "handleBack"},
            {kind: "onyx.RadioGroup", onActivate:"sectionActivated", classes: "center", fit: true, defaultKind: "onyx.IconButton", components: [
                {name: "rbBm", src: "assets/bookmarksTB.png", section: "bookmarks", style: "margin: 0 10px;"},
                {name: "rbNotes", src: "assets/notesTB.png", section: "notes", style: "margin: 0 10px;"},
                {name: "rbHl", src: "assets/highlightsTB.png", section: "highlights", style: "margin: 0 10px;"}
            ]},
        ]},
        {name: "noData", classes: "center", style: "margin-top: 10px;", showing: false},
        {name: "dataList", kind: "AroundList", fit: true, onSetupItem: "setupItem", aboveComponents: [
            {kind: "onyx.Toolbar", layoutKind: "FittableColumnsLayout", components: [
                {kind: "onyx.InputDecorator", fit: true, noStretch: true, layoutKind: "FittableColumnsLayout", components: [
                    {kind: "onyx.Input", placeholder: $L("Search..."), fit: true, oninput: "searchInputChange"},
                    {kind: "Image", src: "assets/search-input.png", style: "height: 20px; width: 20px;"}
                ]}
            ]},
        ], components: [
            {name: "item", classes: "item", ontap: "handleListTap", components: [
                //{kind: "enyo.FittableRows", components: [
                    {name: "itemOsis", classes: ""},
                    {name: "itemText", classes: "item-text", allowHtml: true}
                //]}
            ]}
        ]}
    ],

    data: [],
    filtered: [],

    showHideButton: function () {
        this.$.btHide.show();
        this.$.btBack.hide();
    },

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
        this.filter = null;
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
            this.$.dataList.hide();
            this.$.noData.show();
            if(this.section === "bookmarks")
                this.$.noData.setContent($L("No Bookmarks.") + " " + $L("Tap on a verse number to add one."));
            else if(this.section === "notes")
                this.$.noData.setContent($L("No Notes.") + " " + $L("Tap on a verse number to add one."));
            else if(this.section === "highlights")
                this.$.noData.setContent($L("No Highlights.") + " " + $L("Tap on a verse number to add one."));
        } else {
            this.$.noData.hide();
            this.$.dataList.show();
        }
        this.$.dataList.reset();
        this.$.dataList.reflow();
        this.$.dataList.scrollToRow(0);
    },

    setupItem: function(inSender, inEvent) {
        var data = this.filter ? this.filtered[inEvent.index] : this.data[inEvent.index];
        this.$.itemOsis.setContent(api.formatOsis(data.osisRef));
        if(this.section === "highlights") {
            this.$.item.applyStyle("background-color", data.color);
            this.$.itemOsis.addRemoveClass("list-selected-bold", inSender.isSelected(inEvent.index));
        } else {
            this.$.item.applyStyle("background-color", null);
            this.$.itemOsis.addRemoveClass("list-selected-bold", inSender.isSelected(inEvent.index));
        }
        if(this.section === "notes")
            this.$.itemText.setContent(data.text);
        else
            this.$.itemText.setContent("");
        this.$.item.addRemoveClass("list-selected", inSender.isSelected(inEvent.index));

    },

    handleListTap: function (inSender, inEvent) {
        this.doVerse({osisRef: this.data[inEvent.index].osisRef});
    },

    searchInputChange: function(inSender) {
        enyo.job(this.id + ":search", this.bindSafely("filterList", inSender.getValue()), 200);
        return true;
    },

    filterList: function(inFilter) {
        if (inFilter != this.filter) {
            this.filter = inFilter;
            this.filtered = this.generateFilteredData(inFilter);
            this.$.dataList.setCount(this.filtered.length);
            this.$.dataList.reset();
        }
    },
    generateFilteredData: function(inFilter) {
        var re = new RegExp(inFilter, "i");
        var r = [];
        for (var i=0, d; (d=this.data[i]); i++) {
            if (d.osisRef.match(re) || api.formatOsis(d.osisRef).match(re) || (d.text && d.text.match(re))) {
                r.push(d);
            }
        }
        return r;
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