enyo.kind({
    name: "biblez.versePopup",
    kind: "onyx.Popup",
    classes: "verse-popup",
    components: [
        {kind: "enyo.FittableRows", components: [
            {kind: "enyo.FittableColumns", components: [
                {content: "Bookmark", classes: "verse-popup-cell cell-top-left"},
                {content: "Note", classes: "verse-popup-cell cell-top-right"},
            ]},
            {kind: "enyo.FittableColumns", components: [
                {content: "Highlight", classes: "verse-popup-cell"},
                {content: "Copy&Share", classes: "verse-popup-cell cell-bottom-right"},
            ]}
        ]}
    ]
});