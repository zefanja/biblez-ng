// VERSE POPUP //
enyo.kind({
    name: "biblez.versePopup",
    kind: "onyx.Popup",
    modal: true,
    floating: true,
    classes: "verse-popup",
    events: {
        onBookmark: "",
        onNote: "",
        onHighlight: "",
        onNoteTap: ""
    },
    published: {
        osisRef: null,
        bmExists: false,
        noteExists: false,
        hlExists: false,
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
                {kind: "onyx.IconButton", src: "assets/delete.png", ontap: "removeHighlight"}
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
                    this.doBookmark({action: "add", osisRef: this.osisRef});
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
        var obj = (this.hlExists) ? {id: this.hlId, osisRef: this.osisRef, color: inSender.color} : {osisRef: this.osisRef, color: inSender.color};
        api.putHighlight(obj, enyo.bind(this, function (inError, inId) {
            if(!inError)
                this.doHighlight({osisRef: this.osisRef, color: inSender.color});
            else
                console.log(inError);
        }));
    },

    removeHighlight: function (inSender, inEvent) {
        this.hide();
        if(this.hlExists)
            api.removeHighlight({id: this.hlId, osisRef: this.osisRef}, enyo.bind(this, function (inError) {
                if(!inError)
                    this.doHighlight({action: "remove", osisRef: this.osisRef});
                else
                    console.log(inError);
            }));
    },

    handleNote: function (inSender, inEvent) {
        this.hide();
        this.doNoteTap({osisRef: this.osisRef, noteId: this.noteId});
    }
});

// FONT MENU //

enyo.kind({
    name: "biblez.fontMenu",
    kind: "onyx.Popup",
    events: {
      onFontSize: "",
      onFont: ""
    },
    classes: "font-popup",
    published: {
        fontSize: 1.2,
        font: "default"
    },
    centered: true,
    components:[
        {kind: "enyo.FittableRows", fit: true, components: [
            {name: "fontSlider", kind: "onyx.Slider", value: 50, onChange: "sliderChanged", classes: "font-slider"},
            {name: "fontSelector", kind: "onyx.PickerDecorator", classes: "font-selector", onSelect: "fontSelected", components: [
                {}, //{kind: "onyx.Button", content: $L("Select Font")},
                {kind: "onyx.Picker", components: [
                    {content: $L("Default"), name: "default", active: true},
                    {content: "Verdana", name: "Verdana"},
                    {content: "Arial", name: "Arial"},
                    {content: "Georgia", name: "Georgia"},
                    {content: "Times", name: "Times"}
                ]}
            ]}
        ]}
    ],

    rendered: function () {
        this.inherited(arguments);
        if(enyo.platform.firefoxOS)
            this.$.fontSelector.hide();
    },

    sliderChanged: function (inSender, inEvent) {
        if(inSender.value < 10) {
            this.fontSize = 0.8;
        } else if(inSender.value < 20) {
            this.fontSize = 0.9;
        } else if(inSender.value < 30) {
            this.fontSize = 1;
        } else if(inSender.value < 40) {
            this.fontSize = 1.1;
        } else if(inSender.value < 50) {
            this.fontSize = 1.2;
        } else if(inSender.value < 60) {
            this.fontSize = 1.3;
        } else if(inSender.value < 70) {
            this.fontSize = 1.4;
        } else if(inSender.value < 80) {
            this.fontSize = 1.6;
        } else if(inSender.value < 90) {
            this.fontSize = 1.8;
        } else {
            this.fontSize = 2;
        }
        this.doFontSize({fontSize: this.fontSize});
    },

    fontSizeChanged: function (inSender, inEvent) {
        if(this.fontSize === 0.8) {
            this.$.fontSlider.setValue(10);
        } else if(this.fontSize === 0.9) {
            this.$.fontSlider.setValue(20);
        } else if(this.fontSize === 1) {
            this.$.fontSlider.setValue(30);
        } else if(this.fontSize === 1.1) {
            this.$.fontSlider.setValue(40);
        } else if(this.fontSize === 1.2) {
            this.$.fontSlider.setValue(50);
        } else if(this.fontSize === 1.3) {
            this.$.fontSlider.setValue(60);
        } else if(this.fontSize === 1.4) {
            this.$.fontSlider.setValue(70);
        } else if(this.fontSize === 1.6) {
            this.$.fontSlider.setValue(80);
        } else if(this.fontSize === 1.8) {
            this.$.fontSlider.setValue(90);
        } else {
            this.$.fontSlider.setValue(100);
        }
    },

    fontSelected: function (inSender, inEvent) {
        this.doFont({font: inEvent.selected.name});
    },

    fontChanged: function(inSender, inEvent) {
        this.$[this.font].setActive(true);
    }
});

// NOTE VIEW POPUP //
enyo.kind({
    name: "biblez.notePopup",
    kind: "onyx.Popup",
    events: {
        onEdit: ""
    },
    published: {
        osisRef: null,
        text: ""
    },
    components:[
        {kind: "enyo.Scroller", touch: true, fit: true, classes: "note-popup", components: [
            {name: "noteText", content: "", allowHtml: true, ontap: "handleTap"}
        ]}
    ],

    textChanged: function () {
        this.$.noteText.setContent(this.text);
    },

    handleTap: function (inSender, inEvent) {
        this.doEdit({osisRef: this.osisRef});
    }
});

// FOOTNOTE VIEW POPUP //
enyo.kind({
    name: "biblez.footnotePopup",
    kind: "onyx.Popup",
    floating: true,
    published: {
        text: ""
    },
    components:[
        {kind: "enyo.Scroller", touch: true, fit: true, classes: "note-popup", components: [
            {classes: "center", components: [{kind: "onyx.Spinner", showing: false, name: "spinner", classes: "center"}]},
            {name: "noteText", content: "", allowHtml: true, onclick: "handleTap"}
        ]}
    ],

    handleSpinner: function (inShow) {
        if(inShow)
            this.$.spinner.show();
        else
            this.$.spinner.hide();
    },

    textChanged: function () {
        this.$.noteText.setContent(this.text);
    },

    handleTap: function (inSender, inEvent) {
        inEvent.preventDefault();
        return true;
    }
});