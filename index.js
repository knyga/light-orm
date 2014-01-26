/**
* Created by agnynk on 25.01.14.
*/
/**
* Created by agnynk on 25.01.14.
*/
///<reference path="UpdateOptionsInterface.ts" />
/**
* Created by agnynk on 25.01.14.
*/
/**
* Created by agnynk on 25.01.14.
*/
/**
* Created by agnynk on 25.01.14.
*/
/**
* Created by agnynk on 26.01.14.
*/
var SQLHelper = (function () {
    function SQLHelper() {
        this.separator = ", ";
    }
    SQLHelper.prototype.buildWhere = function (data) {
        var whereQuery = "";

        for (var name in data) {
            if (data.hasOwnProperty(name)) {
                whereQuery += name + "= '" + data[name] + "'";
            }
        }

        return whereQuery;
    };

    SQLHelper.prototype.buildAttrs = function (data, keys) {
        var query = "";

        if ("undefined" === typeof keys) {
            keys = true;
        }

        if (keys) {
            for (var name in data) {
                if (data.hasOwnProperty(name)) {
                    query += "`" + name + "`" + this.separator;
                }
            }
        } else {
            for (var name in data) {
                if (data.hasOwnProperty(name)) {
                    query += "'" + data[name] + "'" + this.separator;
                }
            }
        }

        if (query.length > 0) {
            query = query.substring(0, query.length - this.separator.length);
        }

        return query;
    };

    SQLHelper.prototype.buildSelect = function (tableName, whereData) {
        var query = "SELECT * FROM `" + tableName + "`";

        if ("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    };

    SQLHelper.prototype.buildUpdate = function (tableName, valuesData, whereData) {
        var query = "UPDATE `" + tableName + "`" + " SET ";

        for (var name in valuesData) {
            if (valuesData.hasOwnProperty(name)) {
                query += "`" + name + "` = '" + valuesData[name] + "'" + this.separator;
            }
        }

        query = query.substring(0, query.length - this.separator.length);

        if ("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    };

    SQLHelper.prototype.buildInsert = function (tableName, valuesData) {
        var query = "INSERT INTO `" + tableName + "` (";

        query += this.buildAttrs(valuesData, true);
        query += ") VALUES ";
        query += " (";
        query += this.buildAttrs(valuesData, false);
        query += ")";

        return query;
    };

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
* Created by agnynk on 26.01.14.
*/
/**
* Created by agnynk on 26.01.14.
*/
/**
* Created by agnynk on 26.01.14.
*/
///<reference path="interfaces/CrudInterface.ts" />
///<reference path="interfaces/DriverInterface.ts" />
///<reference path="interfaces/GetSetInterface.ts" />
///<reference path="interfaces/ModelEventInterface.ts" />
///<reference path="interfaces/UpdateOptionsInterface.ts" />
///<reference path="interfaces/ToStringInterface.ts" />
///<reference path="interfaces/JSONInterface.ts" />
///<reference path="helpers/SQLHelper.ts" />
var Light;
(function (Light) {
    var Model = (function () {
        function Model(connector, tableName, attributes) {
            //        public static CREATE = 'create';
            //        public static UPDATE = 'update';
            //        public static REMOVE = 'remove';
            this.pkAttr = 'id';
            this.attributes = {};
            this.connector = connector;
            this.tableName = tableName;
            this.sqlHelper = new SQLHelper();

            if ("undefined" !== typeof attributes) {
                this.set(attributes);
            }
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

        Model.prototype.getAll = function () {
            return this.attributes;
        };

        Model.prototype.get = function (name) {
            if (this.attributes.hasOwnProperty(name)) {
                return this.attributes[name];
            } else {
                return null;
            }
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

        Model.prototype.create = function (callback) {
            var query = this.sqlHelper.buildInsert(this.tableName, this.attributes);
            this.connector.query(query, function (err, rows, fields) {
                if ("function" === typeof callback) {
                    callback(err, rows, fields);
                }
            });
            //            this.callBeforeHandlers(Model.CREATE);
            //            this.connector.query(query, (err, rows, fields) => {
            //                this.callAfterHandlers(Model.CREATE);
            //            });
        };

        Model.prototype.update = function (input, callback) {
            var _this = this;
            var whereOptions = {}, options;

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

            this.connector.query(query, function (err, rows, fields) {
                if ("function" === typeof callback) {
                    if (/\([^,]+, [^,]+/.test(callback.toString())) {
                        query = _this.sqlHelper.buildSelect(_this.tableName, whereOptions);
                        _this.connector.query(query, function (err, rows, fields) {
                            if ("undefined" !== typeof rows && rows.length > 0) {
                                var model = new Model(_this.connector, _this.tableName, rows[0]);
                                callback(err, model);
                            } else {
                                callback(err);
                            }
                        });
                    } else {
                        callback(err);
                    }
                }
            });
            //            this.callBeforeHandlers(Model.UPDATE);
            //            this.connector.query(query, (err, rows, fields) => {
            //                this.callAfterHandlers(Model.UPDATE);
            //            });
        };

        Model.prototype.remove = function (input, callback) {
            var _this = this;
            var whereOptions = {}, options;

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

            this.connector.query(query, function (err, rows, fields) {
                if ("function" === typeof callback) {
                    if (/\([^,]+, [^,]+/.test(callback.toString())) {
                        query = _this.sqlHelper.buildSelect(_this.tableName, whereOptions);
                        _this.connector.query(query, function (err, rows, fields) {
                            if ("undefined" !== typeof rows && rows.length > 0) {
                                var model = new Model(_this.connector, _this.tableName, rows[0]);
                                callback(err, model);
                            } else {
                                callback(err);
                            }
                        });
                    } else {
                        callback(err);
                    }
                }
            });
            //            this.callBeforeHandlers(Model.REMOVE);
            //            this.connector.query(query, (err, rows, fields) => {
            //                this.callAfterHandlers(Model.REMOVE);
            //            });
        };

        Model.prototype.toString = function () {
            return "[LightOrm Model <" + this.tableName + ", " + (this.get(this.pkAttr) ? this.get(this.pkAttr) : "undefined") + ">]";
        };

        Model.prototype.toJSON = function () {
            return this.attributes;
        };
        return Model;
    })();
    Light.Model = Model;
})(Light || (Light = {}));
/**
* Created by agnynk on 26.01.14.
*/
///<reference path="Model.ts" />
///<reference path="helpers/SQLHelper.ts" />
///<reference path="interfaces/DriverInterface.ts" />
///<reference path="interfaces/ToStringInterface.ts" />
///<reference path="interfaces/JSONInterface.ts" />
var Light;
(function (Light) {
    var Collection = (function () {
        function Collection(connector, tableName) {
            this.models = [];
            this.connector = connector;
            this.tableName = tableName;
            this.sqlHelper = new SQLHelper();
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

            model = new Light.Model(this.connector, this.tableName, data);

            if (add) {
                this.models.push(model);
            }

            return model;
        };

        Collection.prototype.getModels = function () {
            return this.models;
        };

        Collection.prototype.getModel = function (at) {
            if (this.models.length <= at) {
                throw new Error("No model at " + at);
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
                    callback(err);
                } else {
                    var models = [];

                    for (var i = 0; i < rows.length; i++) {
                        var model = new Light.Model(_this.connector, _this.tableName);
                        model.set(rows[i]);
                        models.push(model);
                    }

                    callback(null, models);
                }
            });
        };

        Collection.prototype.findOne = function (search, callback) {
            this.find(search, function (lerr, lmodels) {
                var model;

                if (lmodels.length > 0) {
                    model = lmodels[0];
                }

                if ("undefined" !== typeof callback) {
                    callback(lerr, model);
                }
            });
        };

        Collection.prototype.toString = function () {
            return "[LightOrm Collection <" + this.tableName + ">]";
        };

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
