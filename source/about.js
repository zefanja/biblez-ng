enyo.kind({
    name: "biblez.about",
    kind: "enyo.FittableRows",
    fit: true,
    events: {
        onBack: "",
    },
    components: [
        {kind: "onyx.MoreToolbar", layoutKind:"FittableColumnsLayout", components: [
            {kind: "onyx.IconButton", src: "assets/back.png", ontap: "handleBack"},
            {name: "title", content: $L("About BibleZ")}
        ]},
        {kind: "enyo.Scroller", fit: true, components: [
            {classes: "settings-container", style: "text-align: center;", components: [
                {tag: "img", src: "assets/biblez128.png"},
                {allowHtml: true, content: "BibleZ is based on <a href='https://github.com/zefanja/swordjs' target='_blank'>swordjs</a>, a Javascript library to access the bible modules from the <a href='http://crosswire.org/sword' target='_blank'>SWORD Project</a>.<br><br>BibleZ is licenced under the GPLv3. (<a href='https://github.com/zefanja/biblez-ng' target='_blank'>Source Code</a>)"},
                {tag: "br"},
                {tag: "span", content: "<a href='https://twitter.com/biblez' target='_blank'><img src='assets/twitter_32.png'></a>", allowHtml: true, style: "margin: 5px;"},
                {tag: "span", content: "<a href='https://www.facebook.com/zefanjas' target='_blank'><img src='assets/facebook_32.png'></a>", allowHtml: true, style: "margin: 5px;"},
                {tag: "br"},
                {kind: "onyx.Button", content: "Send eMail", ontap: "handleMail", classes: "onyx-affirmative", style: "margin-top: 10px;"}
            ]},


        ]}
    ],

    version: "",

    rendered: function () {
        this.inherited(arguments);
        var request = navigator.mozApps.getSelf();
        request.onsuccess = enyo.bind(this, function() {
            if (request.result) {
                this.version = request.result.manifest.version;
                this.$.title.addContent(" v" + this.version);
            }
        });
    },

    handleMail: function () {
        window.location = "mailto:info@zefanjas.de?subject=BibleZ " + this.version;
    },

    handleBack: function() {
        this.doBack();
    }
});