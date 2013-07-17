enyo.kind({
    name: "biblez.bcSelector",
    kind: "enyo.FittableRows",
    events: {
        onSelect: "",
        onBack: ""
    },
    published: {
        module: null
    },
    components: [
        {name: "bcPanel", kind: "Panels", arrangerKind: "CardArranger", fit: true, components: [
            {name: "bookPanel", kind: "enyo.FittableRows", components: [
                {kind: "onyx.Toolbar", components: [
                    {kind: "onyx.IconButton", src: "assets/back.png", ontap: "doBack"},
                    {content: $L("Books")}
                ]},
                {kind: "enyo.Scroller", fit: true, touch: true, components: [
                    {name: "bookRepeater", kind: "Repeater", count: 0, onSetupItem: "setBookItems", components: [
                        {name: "bookItem", classes: "bc-item", ontap: "handleBook"}
                    ]}
                ]}
            ]},
            {name: "chapterPanel", kind: "enyo.FittableRows", components: [
                {kind: "onyx.Toolbar", components: [
                {kind: "onyx.IconButton", src: "assets/back.png", ontap: "handleBack"},
                    {content: $L("Chapters")}
                ]},
                {kind: "enyo.Scroller", fit: true, touch: true, components: [
                    {name: "chapterRepeater", kind: "Repeater", count: 0, onSetupItem: "setChapterItems", components: [
                        {name: "chapterItem", classes: "bc-item", ontap: "handleChapter"}
                    ]}
                ]}
            ]}
        ]}

    ],

    books: [],
    currentBook: null,

    setPanel: function (index) {
        this.$.bcPanel.setIndex(index);
    },

    handleBack: function (inSender, inEvent) {
        this.$.bcPanel.setIndex(0)
    },

    moduleChanged: function (inSender, inEvent) {
        this.books = this.module.getAllBooks();
        this.$.bookRepeater.setCount(this.books.length);
    },

    setBookItems: function (inSender, inEvent) {
        inEvent.item.$.bookItem.setContent(this.books[inEvent.index].abbrev.slice(0,4));
    },

    handleBook: function (inSender, inEvent) {
        this.currentBook = this.books[inEvent.index];
        this.$.chapterRepeater.setCount(this.currentBook.maxChapter);
        this.$.bcPanel.setIndex(1);
    },

    setChapterItems: function (inSender, inEvent) {
        inEvent.item.$.chapterItem.setContent(inEvent.index+1);
    },

    handleChapter: function (inSender, inEvent) {
        this.doSelect({book: this.currentBook, chapter: inEvent.index+1, osis: this.currentBook.abbrev + "." + (inEvent.index+1)});
    }
});