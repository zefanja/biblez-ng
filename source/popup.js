enyo.kind({
    name: "biblez.versePopup",
    kind: "onyx.Popup",
    classes: "verse-popup",
    published: {
        osisRef: null
    },
    components: [
        {kind: "enyo.FittableRows", components: [
            {kind: "enyo.FittableColumns", components: [
                {content: $L("Bookmark"), classes: "verse-popup-cell cell-top-left", ontap: "handleBookmark"},
                {content: $L("Note"), classes: "verse-popup-cell cell-top-right", ontap: "handleNote"},
            ]},
            {kind: "enyo.FittableColumns", components: [
                {content: $L("Highlight"), classes: "verse-popup-cell", ontap: "handleHighlight"},
                {content: $L("Copy&Share"), classes: "verse-popup-cell cell-bottom-right", ontap: "handleCopyShare"},
            ]}
        ]}
    ],

    handleBookmark: function (inSender, inEvent) {
        console.log(this.osisRef);
    }
});