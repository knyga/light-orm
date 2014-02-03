/**
* Interface to CRUD operations
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
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
* Interface to JSON transformation
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
/**
* Interface to String transformation
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
/**
* Interface to where block
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
/**
* Clones object
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
var Clone = (function () {
    function Clone(data) {
        this.data = data;
        return this.clone();
    }
    Clone.prototype.clone = function () {
        if (null === this.data || "object" !== typeof this.data) {
            return this.data;
        }

        var copy = this.data.constructor() || {};

        for (var attr in this.data) {
            if (this.data.hasOwnProperty(attr)) {
                copy[attr] = this.data[attr];
            }
        }

        return copy;
    };
    return Clone;
})();
/**
* Filter object on property names
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
var Filter = (function () {
    /**
    * @param {object} data Object, that should be filtered
    */
    function Filter(data) {
        this.data = data;
    }
    /**
    * @param Names of properties, that should stay in object
    * @returns {{}}
    */
    Filter.prototype.filter = function (names) {
        var newData = {};

        for (var name in this.data) {
            if (this.data.hasOwnProperty(name)) {
                newData[name] = this.data[name];
            }
        }

        return newData;
    };

    /**
    * this.data MINUS data
    * @param data2
    * @returns {{}}
    */
    Filter.prototype.minus = function (data2) {
        var newData = {};

        for (var name in this.data) {
            if (this.data.hasOwnProperty(name) && !data2.hasOwnProperty(name)) {
                newData[name] = this.data[name];
            }
        }

        return newData;
    };
    return Filter;
})();
/**
* Adds some functionality to object or array
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
var ObjectWrapper = (function () {
    function ObjectWrapper(data) {
        this.data = data;
    }
    ObjectWrapper.prototype.size = function () {
        if (this.isArray()) {
            return this.data.length;
        } else {
            return Object.keys(this.data).length;
        }
    };

    ObjectWrapper.prototype.isArray = function () {
        if (Object.prototype.toString.call(this.data) === '[object Array]') {
            return true;
        } else {
            return false;
        }
    };
    return ObjectWrapper;
})();
/**
* Interface to update/delete selection options
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
///<reference path="../interfaces/WhereInterface.ts" />
var Where = (function () {
    function Where(where) {
        this.where = where.where;
        this.whereValue = where.whereValue;
    }
    /**
    * Generate object with data, that will be used for filtering in WHERE block
    * @param data Data from Model
    * @returns {{}}
    */
    Where.prototype.getBlock = function (data) {
        var obj = {};

        if ("undefined" !== typeof this.where) {
            for (var i = 0; i < this.where.length; i++) {
                if (data.hasOwnProperty(this.where[i])) {
                    obj[this.where[i]] = data[this.where[i]];
                }
            }
        } else {
            obj = this.whereValue;
        }

        return obj;
    };
    return Where;
})();
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
* Provides user with basic SQL methods
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
    * @param {string} valuesData Field names and values that should be updated
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
///<reference path="interfaces/DriverInterface.ts" />
var Light;
(function (Light) {
    /**
    * @param {object} connector Connection object to DB with method query(query: string, handler: (err, rows, fields) => void)
    */
    Light.driver;
})(Light || (Light = {}));
/**
* Interface to before/after event setters
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
/**
* Provides basic model methods
* @author Oleksandr Knyga <oleksandrknyga@gmail.com>
* @license Apache License 2.0 - See file 'LICENSE.md' in this project.
*/
///<reference path="interfaces/CrudInterface.ts" />
///<reference path="interfaces/GetSetInterface.ts" />
///<reference path="interfaces/ModelEventInterface.ts" />
///<reference path="interfaces/ToStringInterface.ts" />
///<reference path="interfaces/ToJSONInterface.ts" />
///<reference path="helpers/Sql/SQLHelper.ts" />
///<reference path="helpers/Where.ts" />
///<reference path="helpers/Clone.ts" />
///<reference path="helpers/Filter.ts" />
///<reference path="helpers/ObjectWrapper.ts" />
///<reference path="Driver.ts" />
var Light;
(function (Light) {
    var Model = (function () {
        /**
        * Constructor
        * @param {object} attributes Attributes, that will be setted during construction
        * @param {object} extensions New properties for current entity
        * @param tableName
        */
        function Model(options, attributes, extensions) {
            //        public static CREATE = 'create';
            //        public static UPDATE = 'update';
            //        public static REMOVE = 'remove';
            this.pkAttr = 'id';
            this.data = {};
            this.dataNew = {};
            if ("undefined" !== typeof options && options.hasOwnProperty('connector')) {
                for (var name in options) {
                    this[name] = options[name];
                }
            } else {
                this.tableName = options;

                if ("undefined" !== typeof attributes) {
                    this.data = attributes;
                }

                if ("undefined" !== typeof extensions) {
                    for (var name in extensions) {
                        this[name] = extensions[name];
                    }
                }
            }

            this.sqlHelper = SQLHelper.getEntity();
        }
        /**
        * Get All attributes, combines dataNew and data
        * @returns {object}
        */
        Model.prototype.getAll = function () {
            var localData = new Clone(this.data) || {};

            for (var name in this.dataNew) {
                if (this.dataNew.hasOwnProperty(name) && (!localData.hasOwnProperty(name) || localData[name] != this.dataNew[name])) {
                    localData[name] = this.dataNew[name];
                }
            }

            return localData;
        };

        /**
        * Get attribute by name
        * @param {string} name Name of attribute
        * @returns {any} Value of attribute
        */
        Model.prototype.get = function (name) {
            if (this.dataNew.hasOwnProperty(name)) {
                return this.dataNew[name];
            }

            if (this.data.hasOwnProperty(name)) {
                return this.data[name];
            }

            return null;
        };

        /**
        * Check presence of attribute
        * @param name
        * @returns {boolean}
        */
        Model.prototype.has = function (name) {
            if (this.dataNew.hasOwnProperty(name)) {
                return true;
            }

            if (this.data.hasOwnProperty(name)) {
                return true;
            }

            return false;
        };

        Model.prototype.set = function (arg1, arg2, isNew) {
            if ("string" === typeof arg1 && "undefined" !== typeof arg2) {
                if ("undefined" === typeof isNew || isNew) {
                    this.dataNew[arg1] = arg2;
                } else {
                    this.data[arg1] = arg2;
                }
            }

            if ("object" === typeof arg1) {
                if ("boolean" === typeof arg2 && arg2) {
                    for (var name in arg1) {
                        if (arg1.hasOwnProperty(name)) {
                            this.dataNew[name] = arg1[name];
                        }
                    }
                } else {
                    for (var name in arg1) {
                        if (arg1.hasOwnProperty(name)) {
                            this.data[name] = arg1[name];
                        }
                    }
                }
            }
        };

        Model.prototype.clear = function (name) {
            if ("undefined" === typeof name) {
                this.dataNew = {};
                this.data = {};
            } else {
                if (this.dataNew.hasOwnProperty(name)) {
                    delete this.dataNew[name];
                }

                if (this.data.hasOwnProperty(name)) {
                    delete this.data[name];
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
            var that = this, query = this.sqlHelper.buildInsert(this.tableName, this.getAll());

            if ("undefined" === typeof isGetModel) {
                isGetModel = true;
            }

            Light.driver.query(query, function (err, rows, fields) {
                if (isGetModel) {
                    var whereOptions = _this.getAll();
                    query = _this.sqlHelper.buildSelect(_this.tableName, whereOptions);
                    Light.driver.query(query, function (err, rows, fields) {
                        if ("undefined" !== typeof rows && rows.length > 0) {
                            var model = new Model(_this.tableName, rows[0]);
                            that.set(model.getAll());

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
                whereOptions[this.pkAttr] = this.get(this.pkAttr);
            } else {
                whereOptions = new Where(options).getBlock(this.getAll());
            }

            var updateData = new Clone(this.dataNew);

            this.data = this.getAll();
            this.dataNew = {};

            if (new ObjectWrapper(updateData).size() < 1) {
                if ("function" === typeof callback) {
                    callback("Nothing to update");
                }

                return;
            }

            var query = this.sqlHelper.buildUpdate(this.tableName, updateData, whereOptions);

            if ("undefined" === typeof isGetModel) {
                if ("boolean" === typeof callback) {
                    isGetModel = callback;
                } else {
                    isGetModel = true;
                }
            }

            Light.driver.query(query, function (err, rows, fields) {
                if (isGetModel) {
                    var whereOptions = _this.getAll();
                    query = _this.sqlHelper.buildSelect(_this.tableName, whereOptions);
                    Light.driver.query(query, function (err, rows, fields) {
                        if ("undefined" !== typeof rows && rows.length > 0) {
                            var model = new Model(_this.tableName, rows[0]);
                            that.set(model.getAll());

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
                whereOptions[this.pkAttr] = this.get(this.pkAttr);
            } else {
                whereOptions = new Where(options).getBlock(this.getAll());
            }

            var query = this.sqlHelper.buildDelete(this.tableName, whereOptions);

            if ("undefined" === typeof isGetModel) {
                if ("boolean" === typeof callback) {
                    isGetModel = callback;
                } else {
                    isGetModel = true;
                }
            }

            Light.driver.query(query, function (err, rows, fields) {
                if (isGetModel) {
                    var whereOptions = _this.getAll();
                    query = _this.sqlHelper.buildSelect(_this.tableName, whereOptions);
                    Light.driver.query(query, function (err, rows, fields) {
                        if ("undefined" !== typeof rows && rows.length > 0) {
                            var model = new Model(_this.tableName, rows[0]);
                            that.set(model.getAll());

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
            return this.getAll();
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
///<reference path="Driver.ts" />
///<reference path="helpers/Sql/SQLHelper.ts" />
///<reference path="interfaces/ToStringInterface.ts" />
///<reference path="interfaces/ToJSONInterface.ts" />
var Light;
(function (Light) {
    var Collection = (function () {
        function Collection(options, extensions) {
            this.models = [];
            this.isAddModel = true;
            if ("string" === typeof options) {
                this.tableName = options;

                if ("undefined" !== typeof extensions) {
                    for (var name in extensions) {
                        this[name] = extensions[name];
                    }
                }
            }

            if ("object" === typeof options) {
                if (Object.prototype.toString.call(options) === '[object Array]') {
                    if (options.length > 0 && options[0] instanceof Light.Model) {
                        this.models = options;
                    } else {
                        for (var i = 0; i < options.length; i++) {
                            this.createModel(options[i]);
                        }
                    }
                } else {
                    for (var name in options) {
                        this[name] = options[name];
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
                add = this.isAddModel;
            }

            model = new Light.Model(this.tableName, data, this.modelExtension);

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

            Light.driver.query(query, function (err, rows, fields) {
                if (err) {
                    if ("function" === typeof callback) {
                        callback(err);
                    }
                } else {
                    var models = [];

                    for (var i = 0; i < rows.length; i++) {
                        var model = new Light.Model(_this.tableName, rows[i], _this.modelExtension);
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
