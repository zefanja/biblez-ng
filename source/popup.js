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
            {kind: "enyo.FittableColumns", components: [
                {content: $L("Highlight"), classes: "verse-popup-cell", ontap: "handleHighlight"},
                {content: $L("Copy&Share"), classes: "verse-popup-cell cell-bottom-right", ontap: "handleCopyShare"},
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
    }
});