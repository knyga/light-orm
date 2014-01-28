/**
* Interface to update/delete selection options
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
/**
* Interface to CRUD operations
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
///<reference path="UpdateOptionsInterface.ts" />
/**
* Interface to Driver
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
/**
* Interface to GET/SET operations
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
/**
* Interface to before/after event setters
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
/**
* Escape string methods
* https://github.com/felixge/node-mysql/blob/master/lib/protocol/SqlString.js
*/

var SqlString = (function () {
    function SqlString() {
    }
    SqlString.getEntity = function () {
        if ("undefined" === typeof SqlString.entity) {
            SqlString.entity = new SqlString();
        }

        return SqlString.entity;
    };

    SqlString.prototype.convertTimezone = function (tz) {
        if (tz == "Z")
            return 0;

        var m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);

        if (m) {
            return (m[1] == '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
        }

        return 0;
    };

    SqlString.prototype.zeroPad = function (vnumber, vlength) {
        var snumber = vnumber.toString();

        while (snumber.length < vlength) {
            snumber = '0' + snumber;
        }

        return snumber;
    };

    SqlString.prototype.dateToString = function (dt, timeZone) {
        if (timeZone != 'local') {
            var tz = this.convertTimezone(timeZone);

            dt.setTime(dt.getTime() + (dt.getTimezoneOffset() * 60000));
            if (!tz) {
                dt.setTime(dt.getTime() + (tz * 60000));
            }
        }

        var year = dt.getFullYear();
        var month = this.zeroPad(dt.getMonth() + 1, 2);
        var day = this.zeroPad(dt.getDate(), 2);
        var hour = this.zeroPad(dt.getHours(), 2);
        var minute = this.zeroPad(dt.getMinutes(), 2);
        var second = this.zeroPad(dt.getSeconds(), 2);
        var millisecond = this.zeroPad(dt.getMilliseconds(), 3);

        return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond;
    };

    SqlString.prototype.bufferToString = function (buffer) {
        var hex = '';

        try  {
            hex = buffer.toString('hex');
        } catch (err) {
            for (var i = 0; i < buffer.length; i++) {
                var vbyte = +buffer[i];
                hex += this.zeroPad(vbyte.toString(16));
            }
        }

        return "X'" + hex + "'";
    };

    SqlString.prototype.arrayToList = function (array, timeZone) {
        var _this = this;
        return array.map(function (v) {
            if (Array.isArray(v)) {
                return '(' + _this.arrayToList(v, timeZone) + ')';
            }
            return _this.escape(v, true, timeZone);
        }).join(', ');
    };

    SqlString.prototype.objectToValues = function (object, timeZone) {
        var values = [];
        for (var key in object) {
            var value = object[key];
            if (typeof value === 'function') {
                continue;
            }

            values.push(this.escapeId(key) + ' = ' + this.escape(value, true, timeZone));
        }

        return values.join(', ');
    };

    SqlString.prototype.escapeId = function (val, forbidQualified) {
        var _this = this;
        if ("undefined" === typeof forbidQualified) {
            forbidQualified = false;
        }

        if (Array.isArray(val)) {
            return val.map(function (v) {
                return _this.escapeId(v, forbidQualified);
            }).join(', ');
        }

        if (forbidQualified) {
            return '`' + val.replace(/`/g, '``') + '`';
        }

        return '`' + val.replace(/`/g, '``').replace(/\./g, '`.`') + '`';
    };

    SqlString.prototype.escape = function (val, stringifyObjects, timeZone) {
        if (val === undefined || val === null) {
            return 'NULL';
        }

        switch (typeof val) {
            case 'boolean':
                return (val) ? 'true' : 'false';
            case 'number':
                return val + '';
        }

        if (val instanceof Date) {
            val = this.dateToString(val, timeZone || 'local');
        }

        if (Buffer.isBuffer(val)) {
            return this.bufferToString(val);
        }

        if (Array.isArray(val)) {
            return this.arrayToList(val, timeZone);
        }

        if (typeof val === 'object') {
            if (stringifyObjects) {
                val = val.toString();
            } else {
                return this.objectToValues(val, timeZone);
            }
        }

        val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
            switch (s) {
                case "\0":
                    return "\\0";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\b":
                    return "\\b";
                case "\t":
                    return "\\t";
                case "\x1a":
                    return "\\Z";
                default:
                    return "\\" + s;
            }
        });
        return "'" + val + "'";
    };
    return SqlString;
})();
/**
* Wrapper on basic search operations
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
///<reference path="SqlString.ts" />
var SQLHelper = (function () {
    function SQLHelper() {
        this.sqlString = SqlString.getEntity();
        this.separator = ", ";
    }
    SQLHelper.getEntity = function () {
        if ("undefined" === typeof SQLHelper.entity) {
            SQLHelper.entity = new SQLHelper();
        }

        return SQLHelper.entity;
    };

    SQLHelper.prototype.buildWhere = function (data) {
        var query = "", joinString = " AND ";

        for (var name in data) {
            if (data.hasOwnProperty(name)) {
                query += "`" + name + "` = " + this.sqlString.escape(data[name]) + joinString;
            }
        }

        if (query.length > 0) {
            query = query.substring(0, query.length - joinString.length);
        }

        return query;
    };

    SQLHelper.prototype.buildAttrs = function (data, keys) {
        var query = "";

        if ("undefined" === typeof keys) {
            keys = true;
        }

        if (keys) {
            for (var name in data) {
                if (data.hasOwnProperty(name)) {
                    //                    query += "`" + name + "`"
                    //                        + this.separator;
                    query += this.sqlString.escapeId(name) + this.separator;
                }
            }
        } else {
            for (var name in data) {
                if (data.hasOwnProperty(name)) {
                    //                    query += "'" + data[name] + "'"
                    //                        + this.separator;
                    query += this.sqlString.escape(data[name]) + this.separator;
                }
            }
        }

        //TODO: use join
        if (query.length > 0) {
            query = query.substring(0, query.length - this.separator.length);
        }

        return query;
    };

    /**
    * Create SELECT SQL query
    * @param {string} tableName
    * @param {object} whereData Conditions for WHERE block in query
    * @returns {string} Query
    */
    SQLHelper.prototype.buildSelect = function (tableName, whereData) {
        var query = "SELECT * FROM `" + tableName + "`";

        if ("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    };

    /**
    * Create UPDATE SQL query
    * @param {string} tableName
    * @param {string} valuesData Fieldnames and values that should be updated
    * @param {object} whereData Conditions for WHERE block in query
    * @returns {string} Query
    */
    SQLHelper.prototype.buildUpdate = function (tableName, valuesData, whereData) {
        var query = "UPDATE `" + tableName + "`" + " SET ";

        for (var name in valuesData) {
            if (valuesData.hasOwnProperty(name)) {
                query += this.sqlString.escapeId(name) + "= " + this.sqlString.escape(valuesData[name]) + this.separator;
            }
        }

        query = query.substring(0, query.length - this.separator.length);

        if ("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    };

    /**
    * Create INSERT SQL query
    * @param {string} tableName
    * @param {string} valuesData Fieldnames and values that should be inserted
    * @returns {string} Query
    */
    SQLHelper.prototype.buildInsert = function (tableName, valuesData) {
        var query = "INSERT INTO `" + tableName + "` (";

        query += this.buildAttrs(valuesData, true);
        query += ") VALUES ";
        query += " (";
        query += this.buildAttrs(valuesData, false);
        query += ")";

        return query;
    };

    /**
    * Create DELETE SQL query
    * @param {string} tableName
    * @param {object} whereData Conditions for WHERE block in query
    * @returns {string} Query
    */
    SQLHelper.prototype.buildDelete = function (tableName, whereData) {
        var query = "DELETE FROM `" + tableName + "`";

        if ("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    };
    return SQLHelper;
})();
/**
* Interface to String transformation
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
/**
* Interface to JSON transformation
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
/**
* Provides basic model methods
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
///<reference path="interfaces/CrudInterface.ts" />
///<reference path="interfaces/DriverInterface.ts" />
///<reference path="interfaces/GetSetInterface.ts" />
///<reference path="interfaces/ModelEventInterface.ts" />
///<reference path="interfaces/UpdateOptionsInterface.ts" />
///<reference path="interfaces/ToStringInterface.ts" />
///<reference path="interfaces/JSONInterface.ts" />
///<reference path="helpers/SqlHelper.ts" />
var Light;
(function (Light) {
    var Model = (function () {
        function Model(options, tableName, attributes, extensions) {
            //        public static CREATE = 'create';
            //        public static UPDATE = 'update';
            //        public static REMOVE = 'remove';
            this.pkAttr = 'id';
            this.attributes = {};
            if ("undefined" !== typeof options && options.hasOwnProperty('connector')) {
                for (var name in options) {
                    this[name] = options[name];
                }
            } else {
                this.connector = options;
                this.tableName = tableName;

                if ("undefined" !== typeof attributes) {
                    this.set(attributes);
                }

                if ("undefined" !== typeof extensions) {
                    for (var name in extensions) {
                        this[name] = extensions[name];
                    }
                }
            }

            this.sqlHelper = SQLHelper.getEntity();
        }
        //        private callBeforeHandlers(type: string) {
        //            for(var i=0;i<this.beforeList.length;i++) {
        //                this.beforeList[i](type);
        //            }
        //        }
        //
        //        private callAfterHandlers(type: string) {
        //            for(var i=0;i<this.afterList.length;i++) {
        //                this.afterList[i](type);
        //            }
        //        }
        //        before(handler: (type: string) => void) {
        //            this.beforeList.push(handler);
        //        }
        //
        //        after(handler: (type: string) => void) {
        //            this.afterList.push(handler);
        //        }
        Model.prototype.updateOptionsToObject = function (options) {
            var obj = {};

            if ("undefined" !== typeof options.pk) {
                for (var i = 0; i < options.pk.length; i++) {
                    if (this.attributes.hasOwnProperty(options.pk[i])) {
                        obj[options.pk[i]] = this.attributes[options.pk[i]];
                    }
                }
            } else {
                obj = options.pkValue;
            }

            return obj;
        };

        /**
        * Get All attributes
        * @returns {object}
        */
        Model.prototype.getAll = function () {
            return this.attributes;
        };

        /**
        * Get attribute by name
        * @param {string} name Name of attribute
        * @returns {any} Value of attribute
        */
        Model.prototype.get = function (name) {
            if (!this.attributes.hasOwnProperty(name)) {
                //throw new Error("No attribute with name " + name);
                return null;
            }

            return this.attributes[name];
        };

        /**
        * Check presence of attribute
        * @param name
        * @returns {boolean}
        */
        Model.prototype.has = function (name) {
            return this.attributes.hasOwnProperty(name);
        };

        Model.prototype.set = function (arg1, arg2) {
            if ("string" === typeof arg1 && "undefined" !== typeof arg2) {
                this.attributes[arg1] = arg2;
            }

            if ("object" === typeof arg1) {
                for (var name in arg1) {
                    if (arg1.hasOwnProperty(name)) {
                        this.attributes[name] = arg1[name];
                    }
                }
            }
        };

        Model.prototype.clear = function (name) {
            if ("undefined" === typeof name) {
                this.attributes = {};
            } else {
                if (this.has(name)) {
                    delete this.attributes[name];
                }
            }
        };

        /**
        * Create model
        * @param {function} callback
        * @param {boolean} isGetModel True, if sub request is needed
        */
        Model.prototype.create = function (callback, isGetModel) {
            var _this = this;
            var that = this, query = this.sqlHelper.buildInsert(this.tableName, this.attributes);

            if ("undefined" === typeof isGetModel) {
                isGetModel = true;
            }

            this.connector.query(query, function (err, rows, fields) {
                if (isGetModel) {
                    var whereOptions = _this.attributes;
                    query = _this.sqlHelper.buildSelect(_this.tableName, whereOptions);
                    _this.connector.query(query, function (err, rows, fields) {
                        if ("undefined" !== typeof rows && rows.length > 0) {
                            var model = new Model(_this.connector, _this.tableName, rows[0]);
                            that.set(model.attributes);

                            if ("function" === typeof callback) {
                                callback(err, that);
                            }
                        } else {
                            if ("function" === typeof callback) {
                                callback(err);
                            }
                        }
                    });
                } else {
                    if ("function" === typeof callback) {
                        callback(err);
                    }
                }
            });
            //            this.callBeforeHandlers(Model.CREATE);
            //            this.connector.query(query, (err, rows, fields) => {
            //                this.callAfterHandlers(Model.CREATE);
            //            });
        };

        Model.prototype.update = function (input, callback, isGetModel) {
            var _this = this;
            var that = this, whereOptions = {}, options;

            if ("function" === typeof input) {
                callback = input;
            } else {
                options = input;
            }

            if ("undefined" === typeof options) {
                whereOptions[this.pkAttr] = this.attributes[this.pkAttr];
            } else {
                whereOptions = this.updateOptionsToObject(options);
            }

            var query = this.sqlHelper.buildUpdate(this.tableName, this.attributes, whereOptions);

            if ("undefined" === typeof isGetModel) {
                if ("boolean" === typeof callback) {
                    isGetModel = callback;
                } else {
                    isGetModel = true;
                }
            }

            this.connector.query(query, function (err, rows, fields) {
                if (isGetModel) {
                    var whereOptions = _this.attributes;
                    query = _this.sqlHelper.buildSelect(_this.tableName, whereOptions);
                    _this.connector.query(query, function (err, rows, fields) {
                        if ("undefined" !== typeof rows && rows.length > 0) {
                            var model = new Model(_this.connector, _this.tableName, rows[0]);
                            that.set(model.attributes);

                            if ("function" === typeof callback) {
                                callback(err, that);
                            }
                        } else {
                            if ("function" === typeof callback) {
                                callback(err);
                            }
                        }
                    });
                } else {
                    if ("function" === typeof callback) {
                        callback(err);
                    }
                }
            });
            //            this.callBeforeHandlers(Model.UPDATE);
            //            this.connector.query(query, (err, rows, fields) => {
            //                this.callAfterHandlers(Model.UPDATE);
            //            });
        };

        Model.prototype.remove = function (input, callback, isGetModel) {
            var _this = this;
            var that = this, whereOptions = {}, options;

            if ("function" === typeof input) {
                callback = input;
            } else {
                options = input;
            }

            if ("undefined" === typeof options) {
                whereOptions[this.pkAttr] = this.attributes[this.pkAttr];
            } else {
                whereOptions = this.updateOptionsToObject(options);
            }

            var query = this.sqlHelper.buildDelete(this.tableName, whereOptions);

            if ("undefined" === typeof isGetModel) {
                if ("boolean" === typeof callback) {
                    isGetModel = callback;
                } else {
                    isGetModel = true;
                }
            }

            this.connector.query(query, function (err, rows, fields) {
                if (isGetModel) {
                    var whereOptions = _this.attributes;
                    query = _this.sqlHelper.buildSelect(_this.tableName, whereOptions);
                    _this.connector.query(query, function (err, rows, fields) {
                        if ("undefined" !== typeof rows && rows.length > 0) {
                            var model = new Model(_this.connector, _this.tableName, rows[0]);
                            that.set(model.attributes);

                            if ("function" === typeof callback) {
                                callback(err, that);
                            }
                        } else {
                            if ("function" === typeof callback) {
                                callback(err);
                            }
                        }
                    });
                } else {
                    if ("function" === typeof callback) {
                        callback(err);
                    }
                }
            });
            //            this.callBeforeHandlers(Model.REMOVE);
            //            this.connector.query(query, (err, rows, fields) => {
            //                this.callAfterHandlers(Model.REMOVE);
            //            });
        };

        /**
        * Create string from object
        * @returns {string}
        */
        Model.prototype.toString = function () {
            return "[LightOrm Model <" + this.tableName + ", " + (this.get(this.pkAttr) ? this.get(this.pkAttr) : "undefined") + ">]";
        };

        /**
        * Get attributes of model
        * @returns {object}
        */
        Model.prototype.toJSON = function () {
            return this.attributes;
        };
        return Model;
    })();
    Light.Model = Model;
})(Light || (Light = {}));
/**
* Provides model creation and search methods
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
///<reference path="Model.ts" />
///<reference path="helpers/SqlHelper.ts" />
///<reference path="interfaces/DriverInterface.ts" />
///<reference path="interfaces/ToStringInterface.ts" />
///<reference path="interfaces/JSONInterface.ts" />
var Light;
(function (Light) {
    var Collection = (function () {
        function Collection(options, tableName, extensions) {
            this.models = [];
            if (Object.prototype.toString.call(options) === '[object Array]') {
                if (options.length > 0 && options[0] instanceof Light.Model) {
                    this.models = options;
                } else {
                    for (var i = 0; i < options.length; i++) {
                        this.createModel(options[i]);
                    }
                }
            } else {
                if (options.hasOwnProperty('connector')) {
                    for (var name in options) {
                        this[name] = options[name];
                    }
                } else {
                    this.connector = options;
                    this.tableName = tableName;

                    if ("undefined" !== typeof extensions) {
                        for (var name in extensions) {
                            this[name] = extensions[name];
                        }
                    }
                }
            }

            this.sqlHelper = SQLHelper.getEntity();
        }
        Collection.prototype.createModel = function (options, add) {
            var model, data;

            if ("boolean" === typeof options) {
                add = options;
            } else {
                data = options;
            }

            if ("undefined" === typeof add) {
                add = true;
            }

            model = new Light.Model(this.connector, this.tableName, data, this.modelExtension);

            if (add) {
                this.models.push(model);
            }

            return model;
        };

        /**
        * Get all models from saved models list
        * @returns {Model[]}
        */
        Collection.prototype.getModels = function () {
            return this.models;
        };

        /**
        * Get model at position from saved models list
        * @param {number} at Position
        * @returns {Model}
        */
        Collection.prototype.getModel = function (at) {
            if (this.models.length <= at) {
                //throw new Error("No model at " + at);
                return null;
            }

            return this.models[at];
        };

        Collection.prototype.find = function (search, callback) {
            var _this = this;
            var query = "";

            if ("string" === typeof search) {
                query = search;
            } else {
                query = this.sqlHelper.buildSelect(this.tableName, search);
            }

            this.connector.query(query, function (err, rows, fields) {
                if (err) {
                    if ("function" === typeof callback) {
                        callback(err);
                    }
                } else {
                    var models = [];

                    for (var i = 0; i < rows.length; i++) {
                        var model = new Light.Model(_this.connector, _this.tableName, rows[i], _this.modelExtension);
                        models.push(model);
                    }

                    if ("function" === typeof callback) {
                        callback(null, models);
                    }
                }
            });
        };

        /**
        * Get all models
        * @param callback
        */
        Collection.prototype.findAll = function (callback) {
            this.find(undefined, callback);
        };

        Collection.prototype.findOne = function (search, callback) {
            this.find(search, function (lerr, lmodels) {
                var model;

                if (lmodels.length > 0) {
                    model = lmodels[0];
                }

                if ("function" === typeof callback) {
                    callback(lerr, model);
                }
            });
        };

        /**
        * Create string from object
        * @returns {string}
        */
        Collection.prototype.toString = function () {
            return "[LightOrm Collection <" + this.tableName + ">]";
        };

        /**
        * Create array of attributes of saved models
        * @returns {array}
        */
        Collection.prototype.toJSON = function () {
            var data = [];
            for (var i = 0, length = this.models.length; i < length; i++) {
                data.push(this.models[i].toJSON());
            }

            return data;
        };
        return Collection;
    })();
    Light.Collection = Collection;
})(Light || (Light = {}));
module.exports = Light;
