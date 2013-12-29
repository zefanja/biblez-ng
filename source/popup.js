enyo.kind({
    name: "biblez.versePopup",
    kind: "onyx.Popup",
    classes: "verse-popup",
    events: {
        onBookmark: "",
        onNote: "",
        onHighlight: ""
    },
    published: {
        osisRef: null,
        bmExists: false,
        noteExists: false,
        bmId: null,
        noteId: null,
        hlId: null
    },
    components: [
        {kind: "enyo.FittableRows", components: [
            {kind: "enyo.FittableColumns", components: [
                {name: "bmLabel", content: $L("Bookmark"), classes: "verse-popup-cell cell-top-left", ontap: "handleBookmark"},
                {name: "noteLabel", content: $L("Note"), classes: "verse-popup-cell cell-top-right", ontap: "handleNote"},
            ]},
            {kind: "enyo.FittableColumns", classes: "color-container", components: [
                {kind: "onyx.Button", content: " ", ontap: "highlightVerse", classes: "color-button", color: "rgba(255,99,71,0.5)", style: "background-color: red;"},
                {kind: "onyx.Button", content: " ", ontap: "highlightVerse", classes: "color-button", color: "rgba(255,255,0,0.5)", style: "background-color: yellow;"},
                {kind: "onyx.Button", content: " ", ontap: "highlightVerse", classes: "color-button", color: "rgba(152,251,152,0.5)", style: "background-color: green;"},
                {kind: "onyx.Button", content: " ", ontap: "highlightVerse", classes: "color-button", color: "rgba(238,130,238,0.5)", style: "background-color: violet;"},
                {kind: "onyx.Button", caption: " ", ontap: "highlightVerse", classes: "color-button", color: "rgba(255,165,0,0.5)", style: "background-color: orange;"},
                {kind: "onyx.IconButton", src: "assets/delete.png", ontap: "highlightVerse"}
                //{content: $L("Highlight"), classes: "verse-popup-cell", ontap: "handleHighlight"},
                //{content: $L("Copy&Share"), classes: "verse-popup-cell cell-bottom-right", ontap: "handleCopyShare"},
            ]}
        ]}
    ],

    setLabels: function () {
        if(this.bmExists)
            this.$.bmLabel.setContent($L("Bookmark") +  " - ");
        else
            this.$.bmLabel.setContent($L("Bookmark") +  " + ");
    },

    handleBookmark: function (inSender, inEvent) {
        this.hide();
        if (!this.bmExists)
            api.putBookmark({osisRef: this.osisRef}, enyo.bind(this, function (inError, inId) {
                if(!inError) {
                    this.doBookmark({action: "add"});
                } else
                    console.log(inError);
            }));
        else
            api.removeBookmark({id: this.bmId, osisRef: this.osisRef}, enyo.bind(this, function (inError) {
                if(!inError) {
                    this.doBookmark({action: "remove", osisRef: this.osisRef});
                } else
                    console.log(inError);
            }));
    },

    highlightVerse: function (inSender, inEvent) {
        this.hide();
        api.putHighlight({osisRef: this.osisRef, color: inSender.color}, enyo.bind(this, function (inError, inId) {
            if(!inError)
                this.doHighlight();
            else
                console.log(inError);
        }));

    }
});