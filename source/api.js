var api = {
    isInitialized: false,
    db: null,
    isBmInitialized: false,
    bmStore: null,
    isNoteInitialized: false,
    noteStore: null,
    isHlInitialized: false,
    hlStore: null,
    store: sword.dataMgr.getIDBWrapper(),

    //Wraps the initialization of the IndexedDB Wrapper function
    wrapper: function (inCallback) {
        //console.log("isInitialized...", this.isInitialized);
        if (this.isInitialized) {
            inCallback(null, this.db);
        } else {
            var self = this;
            this.db = new this.store({
                storeName: "biblez",
                dbVersion: 3,
                onStoreReady: function() {
                    //console.log("isInitialized", self.isInitialized);
                    self.isInitialized = true;
                    if(inCallback) inCallback(null, self.db);
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
            inCallback(null, this.bmStore);
        } else {
            var self = this;
            this.bmStore = new this.store({
                storeName: "bookmarks",
                keyPath: 'id',
                autoIncrement: true,
                dbVersion: 2,
                indexes: [
                    {name: "osisRef", keyPath: "osisRef", unique: true}
                ],
                onStoreReady: function() {
                    //console.log("isInitialized", self.isInitialized);
                    self.isBmInitialized = true;
                    if(inCallback) inCallback(null, self.bmStore);
                },
                onError: function(inError) {
                    self.isBmInitialized = false;
                    if(inCallback) inCallback(inError);
                }
            });
        }
    },

    hlWrapper: function (inCallback) {
        //console.log("isInitialized...", this.isHlInitialized);
        if (this.isHlInitialized) {
            inCallback(null, this.hlStore);
        } else {
            var self = this;
            this.hlStore = new this.store({
                storeName: "highlights",
                keyPath: 'id',
                autoIncrement: true,
                dbVersion: 2,
                indexes: [
                    {name: "osisRef", keyPath: "osisRef", unique: true}
                ],
                onStoreReady: function() {
                    self.isHlInitialized = true;
                    if(inCallback) inCallback(null, self.hlStore);
                },
                onError: function(inError) {
                    self.isHlInitialized = false;
                    if(inCallback) inCallback(inError);
                }
            });
        }
    },

    noteWrapper: function (inCallback) {
        //console.log("isInitialized...", this.isHlInitialized);
        if (this.isNoteInitialized) {
            inCallback(null, this.noteStore);
        } else {
            var self = this;
            this.noteStore = new this.store({
                storeName: "notes",
                keyPath: 'id',
                autoIncrement: true,
                dbVersion: 2,
                indexes: [
                    {name: "osisRef", keyPath: "osisRef", unique: true}
                ],
                onStoreReady: function() {
                    self.isNoteInitialized = true;
                    if(inCallback) inCallback(null, self.noteStore);
                },
                onError: function(inError) {
                    self.isNoteInitialized = false;
                    if(inCallback) inCallback(inError);
                }
            });
        }
    },

    //Put something in the ObjectStores
    _put: function (inDB, inObject, inCallback) {
        //console.log("Put this:", inDB, inObject);
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
            if(!inError)
                this._put(inDB, inObject, enyo.bind(this, function(inError, inId) {
                    if(!inError)
                        this.get(inObject.osisRef, enyo.bind(this, function(inError, inOsisObject) {
                            if(!inError) {
                                if(inOsisObject === undefined)
                                    inOsisObject = {id: inObject.osisRef};
                                inOsisObject["bookmarkId"] = inId;
                                this.put(inOsisObject, inCallback);
                            } else
                                inCallback(inError);
                        }));
                    else
                        inCallback(inError);
                }));
            else inCallback(inError);
        }));
    },

    putHighlight: function (inObject, inCallback) {
        this.hlWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError)
                this._put(inDB, inObject, enyo.bind(this, function(inError, inId) {
                    if(!inError)
                        this.get(inObject.osisRef, enyo.bind(this, function(inError, inOsisObject) {
                            if(!inError) {
                                if(inOsisObject === undefined)
                                    inOsisObject = {id: inObject.osisRef};
                                inOsisObject["highlightId"] = inId;
                                this.put(inOsisObject, inCallback);
                            } else
                                inCallback(inError);
                        }));
                    else
                        inCallback(inError);
                }));
            else inCallback(inError);
        }));
    },

    putNote: function (inObject, inCallback) {
        this.noteWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError)
                if(!inObject.id) {
                    //save a new note
                    delete inObject["id"];
                    this._put(inDB, inObject, enyo.bind(this, function(inError, inId) {
                        if(!inError)
                            this.get(inObject.osisRef, enyo.bind(this, function(inError, inOsisObject) {
                                if(!inError) {
                                    if(inOsisObject === undefined)
                                        inOsisObject = {id: inObject.osisRef};
                                    inOsisObject["noteId"] = inId;
                                    this.put(inOsisObject, inCallback);
                                } else
                                    inCallback(inError);
                            }));
                        else
                            inCallback(inError);
                    }));
                } else {
                    //Update an existing note
                    this.getNote(inObject.id, enyo.bind(this, function (inError, inNoteObject) {
                        if(!inError) {
                            inNoteObject["text"] = inObject["text"];
                            this._put(inDB, inNoteObject, inCallback);
                        } else {
                            inCallback(inError);
                        }
                    }));
                }
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

    _getBatch: function (inDB, inIds, inCallback) {
        inDB.getBatch(inIds,
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

    _query: function(inDB, inOptions, inCallback) {
        //inOptions["onError"] = function (inError) {inCallback(inError);};
        inDB.query(function (inResults) {
            inCallback(null, inResults);
        }, inOptions);
    },

    get: function (inId, inCallback) {
        this.wrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._get(inDB, inId, inCallback);
            else inCallback(inError);
        }));
    },

    getAll: function(inCallback) {
        this.wrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._getAll(inDB, inCallback);
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
            if(!inError) this._query(inDB, {index: "osisRef"}, inCallback);
            else inCallback(inError);
        }));
    },

    getHighlights: function (inIds, inCallback) {
        this.hlWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._getBatch(inDB, inIds, inCallback);
            else inCallback(inError);
        }));
    },

    getAllHighlights: function (inCallback) {
        this.hlWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._query(inDB, {index: "osisRef"}, inCallback);
            else inCallback(inError);
        }));
    },

    getNote: function (inId, inCallback) {
        this.noteWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._get(inDB, inId, inCallback);
            else inCallback(inError);
        }));
    },

    getNotes: function (inIds, inCallback) {
        this.noteWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._getBatch(inDB, inIds, inCallback);
            else inCallback(inError);
        }));
    },

    getAllNotes: function (inCallback) {
        this.noteWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError) this._query(inDB, {index: "osisRef"}, inCallback);
            else inCallback(inError);
        }));
    },

    getUserData: function(inOsis, inVMax, inCallback) {
        var z=1,
            userData = {};
        inOsis = (inOsis.split(".").length === 2) ? inOsis : inOsis.split(".")[0] + "." + inOsis.split(".")[1];
        for (var i=1;i<inVMax+1;i++) {
            this.get(inOsis + "." + i, function (inError, inData) {
                if(!inError) {
                    if(inData && inData.bookmarkId)
                        userData[inData.id] = inData;
                    if(inData && inData.highlightId)
                        userData[inData.id] = inData;
                    if(inData && inData.noteId)
                        userData[inData.id] = inData;
                    if(z === inVMax) inCallback(null, userData);
                    else z++;
                } else
                    inCallback(inError);
            });
        }
    },

    _remove: function (inDB, inId, inCallback) {
        inDB.remove(inId,
            function () {
                if(inCallback) inCallback(null);
            },
            function (inError) {
                if(inCallback) inCallback(inError);
            }
        );
    },

    removeBookmark: function (inBookmark, inCallback) {
        this.bmWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError)
                this._remove(inDB, inBookmark.id, enyo.bind(this, function(inError) {
                    if(!inError)
                        this.get(inBookmark.osisRef, enyo.bind(this, function(inError, inOsisObject) {
                            if(!inError) {
                                if(inOsisObject !== undefined) {
                                    delete inOsisObject["bookmarkId"];
                                    this.put(inOsisObject, inCallback);
                                } else
                                    inCallback({message: "api.removeBookmark: Couldn't remove bookmarkId from osisObject"});
                            } else
                                inCallback(inError);
                        }));
                    else
                        inCallback(inError);
                }));
            else inCallback(inError);
        }));
    },

    removeHighlight: function (inHighlight, inCallback) {
        this.hlWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError)
                this._remove(inDB, inHighlight.id, enyo.bind(this, function(inError) {
                    if(!inError)
                        this.get(inHighlight.osisRef, enyo.bind(this, function(inError, inOsisObject) {
                            if(!inError) {
                                if(inOsisObject !== undefined) {
                                    delete inOsisObject["highlightId"];
                                    this.put(inOsisObject, inCallback);
                                } else
                                    inCallback({message: "api.removeHighlight: Couldn't remove highlightId from osisObject"});
                            } else
                                inCallback(inError);
                        }));
                    else
                        inCallback(inError);
                }));
            else inCallback(inError);
        }));
    },

    removeNote: function (inNote, inCallback) {
        this.noteWrapper(enyo.bind(this, function (inError, inDB) {
            if(!inError)
                this._remove(inDB, inNote.id, enyo.bind(this, function(inError) {
                    if(!inError)
                        this.get(inNote.osisRef, enyo.bind(this, function(inError, inOsisObject) {
                            if(!inError) {
                                if(inOsisObject !== undefined) {
                                    delete inOsisObject["noteId"];
                                    this.put(inOsisObject, inCallback);
                                } else
                                    inCallback({message: "api.removeHighlight: Couldn't remove noteId from osisObject"});
                            } else
                                inCallback(inError);
                        }));
                    else
                        inCallback(inError);
                }));
            else inCallback(inError);
        }));
    },

    putSetting: function (inKey, inValue, inCallback) {
        this.get("settings", enyo.bind(this, function (inError, inSettings) {
            if(!inError) {
                inSettings[inKey] = inValue;
                this.put(inSettings, inCallback);
            } else {
                inCallback(inError);
            }
        }));
    },

    deleteDatabases: function () {
        this.wrapper(function (inError, inDB) {
            inDB.clear();
        });
        this.bmWrapper(function (inError, inDB) {
            inDB.clear();
        });
        this.hlWrapper(function (inError, inDB) {
            inDB.clear();
        });
    },

    formatOsis: function (inOsis) {
        var split = inOsis.split(".");
        var formatted = split[0] + " " + split[1];
        return  (split[2]) ? formatted + ":" + split[2] : formatted;
    }
};