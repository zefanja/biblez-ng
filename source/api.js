var api = {
    isInitialized: false,
    db: null,

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
                dbVersion: 1,
                /*indexes: [
                    {name: "modules", keyPath: "moduleKey", unique: true}
                ],*/
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

    put: function (inObject, inCallback) {
        this.wrapper(function (inError, inDB) {
            inDB.put(inObject,
                function (inId) {
                    if(inCallback) inCallback(null, inId);
                },
                function (inError) {
                    if(inCallback) inCallback(inError);
                }
            );
        });
    },

    get: function (inId, inCallback) {
        this.wrapper(function (inError, inDB) {
            inDB.get(inId,
                function (inObject) {
                    if(inCallback) inCallback(null, inObject);
                },
                function (inError) {
                    if(inCallback) inCallback(inError);
                }
            );
        });
    }


};