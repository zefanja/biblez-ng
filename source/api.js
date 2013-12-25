var api = {
    isInitialized: false,
    db: null,
    isBmInitialized: false,
    bmStore: null,
    isNoteInitialized: false,
    noteStore: null,
    isHlInitialized: false,
    hlStore: null,

    //Wraps the initialization of the IndexedDB Wrapper function
    wrapper: function (inCallback) {
        //console.log("isInitialized...", this.isInitialized);
        if (this.isInitialized) {
            inCallback(null, db);
        } else {
            var store = sword.dataMgr.getIDBWrapper();
            var self = this;
            db = new store({
                storeName: "biblez",
                dbVersion: 3,
                onStoreReady: function() {
                    //console.log("isInitialized", self.isInitialized);
                    self.isInitialized = true;
                    if(inCallback) inCallback(null, db);
                },
                onError: function(inError) {
                    self.isInitialized = false;
                    if(inCallback) inCallback(inError);
                }
            });
        }
    },

    bmWrapper: function (inCallback) {
        //console.log("isInitialized...", this.isInitialized);
        if (this.isBmInitialized) {
            inCallback(null, bmStore);
        } else {
            var store = sword.dataMgr.getIDBWrapper();
            var self = this;
            bmStore = new store({
                storeName: "bookmarks",
                keyPath: 'id',
                autoIncrement: true,
                dbVersion: 1,
                onStoreReady: function() {
                    //console.log("isInitialized", self.isInitialized);
                    self.isBmInitialized = true;
                    if(inCallback) inCallback(null, bmStore);
                },
                onError: function(inError) {
                    self.isBmInitialized = false;
                    if(inCallback) inCallback(inError);
                }
            });
        }
    },

    //Put something in the ObjectStores
    _put: function (inDB, inObject, inCallback) {
        inDB.put(inObject,
            function (inId) {
                if(inCallback) inCallback(null, inId);
            },
            function (inError) {
                if(inCallback) inCallback(inError);
            }
        );
    },

    put: function (inObject, inCallback) {
        this.wrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._put(inDB, inObject, inCallback);
            else inCallback(inError);
        }));
    },

    putBookmark: function (inObject, inCallback) {
        this.bmWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._put(inDB, inObject, inCallback);
            else inCallback(inError);
        }));
    },

    _get: function (inDB, inId, inCallback) {
        inDB.get(inId,
            function (inObject) {
                if(inCallback) inCallback(null, inObject);
            },
            function (inError) {
                if(inCallback) inCallback(inError);
            }
        );
    },

    _getAll: function (inDB, inCallback) {
        inDB.getAll(
            function (inObject) {
                if(inCallback) inCallback(null, inObject);
            },
            function (inError) {
                if(inCallback) inCallback(inError);
            }
        );
    },

    get: function (inId, inCallback) {
        this.wrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._get(inDB, inId, inCallback);
            else inCallback(inError);
        }));
    },

    getBookmark: function (inId, inCallback) {
        this.bmWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._get(inDB, inId, inCallback);
            else inCallback(inError);
        }));
    },

    getAllBookmarks: function (inCallback) {
        this.bmWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._getAll(inDB, inId, inCallback);
            else inCallback(inError);
        }));
    }


};