enyo.kind({
    name: "biblez.bcSelector",
    kind: "enyo.FittableRows",
    events: {
        onSelect: "",
        onBack: ""
    },
    classes: "enyo-fit",
    published: {
        module: null
    },
    components: [
        {name: "bcPanel", kind: "Panels", arrangerKind: "CardArranger", fit: true, animate: false, components: [
            {name: "bookPanel", kind: "enyo.FittableRows", components: [
                {kind: "onyx.Toolbar", components: [
                    {kind: "onyx.IconButton", src: "assets/back.png", ontap: "doBack"},
                    {content: $L("Books")}
                ]},
                {kind: "enyo.Scroller", fit: true, touch: true, components: [
                    {name: "bookRepeater", kind: "Repeater", count: 0, onSetupItem: "setBookItems", components: [
                        {name: "bookItem", kind: "onyx.Button", classes: "bc-item", ontap: "handleBook"}
                    ]}
                ]}
            ]},
            {name: "chapterPanel", kind: "enyo.FittableRows", components: [
                {name: "tbChapter", kind: "onyx.Toolbar", components: [
                    {kind: "onyx.IconButton", src: "assets/back.png", ontap: "handleBack"},
                    {name: "chapterLabel", content: $L("Chapters"), classes: "text-ellipsis"}
                ]},
                {kind: "enyo.Scroller", fit: true, touch: true, components: [
                    {name: "chapterRepeater", kind: "Repeater", count: 0, onSetupItem: "setChapterItems", components: [
                        {name: "chapterItem", kind: "onyx.Button", classes: "bc-item", ontap: "handleChapter"}
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
        this.$.bcPanel.setIndex(0);
    },

    moduleChanged: function (inSender, inEvent) {
        this.books = this.module.getAllBooks();
        this.$.bookRepeater.setCount(this.books.length);
    },

    setBookItems: function (inSender, inEvent) {
        if (inEvent.index === 39) {
            inEvent.item.$.bookItem.addStyles("clear: both;");
        }
        if (inEvent.index >= 39) {
            inEvent.item.$.bookItem.addClass("books-nt");
        } else {
            inEvent.item.$.bookItem.addClass("books-ot");
        }
        inEvent.item.$.bookItem.setContent(this.books[inEvent.index].abbrev.slice(0,4));
    },

    handleBook: function (inSender, inEvent) {
        this.currentBook = this.books[inEvent.index];
        this.$.chapterRepeater.setCount(this.currentBook.maxChapter);
        this.$.chapterLabel.setContent($L("Chapters in ") + this.currentBook.name);
        this.$.bcPanel.setIndex(1);
        //truncate text if the label's width is longer than window.innerWidth
        if(window.innerWidth - 60 < this.$.chapterLabel.hasNode().clientWidth) {
            var w = this.$.tbChapter.hasNode().clientWidth - 60 + "px";
            this.$.chapterLabel.applyStyle("width", w);
        }

    },

    setChapterItems: function (inSender, inEvent) {
        inEvent.item.$.chapterItem.setContent(inEvent.index+1);
    },

    handleChapter: function (inSender, inEvent) {
        this.doSelect({book: this.currentBook, chapter: inEvent.index+1, osis: this.currentBook.abbrev + "." + (inEvent.index+1), label: this.currentBook.abbrev + " " + (inEvent.index+1)});
        this.$.bcPanel.setIndex(0);
    },

    resizeHandler: function () {
        this.inherited(arguments);
        var w = this.$.tbChapter.hasNode().clientWidth - 60 + "px";
        this.$.chapterLabel.applyStyle("width", w);
    }
});