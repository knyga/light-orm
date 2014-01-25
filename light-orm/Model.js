/**
* Created by agnynk on 26.01.14.
*/
///<reference path="interfaces/CrudInterface.ts" />
///<reference path="interfaces/DriverInterface.ts" />
///<reference path="interfaces/GetSetInterface.ts" />
///<reference path="interfaces/ModelEventInterface.ts" />
///<reference path="interfaces/UpdateOptionsInterface.ts" />
///<reference path="helpers/SQLHelper.ts" />
var Model = (function () {
    function Model(connector, tableName) {
        this.idAttr = 'id';
        this.connector = connector;
        this.tableName = tableName;
        this.sqlHelper = new SQLHelper();
    }
    Model.prototype.callBeforeHandlers = function (type) {
        for (var i = 0; i < this.beforeList.length; i++) {
            this.beforeList[i](type);
        }
    };

    Model.prototype.callAfterHandlers = function (type) {
        for (var i = 0; i < this.afterList.length; i++) {
            this.afterList[i](type);
        }
    };

    Model.prototype.updateOptionsToObject = function (options) {
        var obj;

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

    Model.prototype.before = function (handler) {
        this.beforeList.push(handler);
    };

    Model.prototype.after = function (handler) {
        this.afterList.push(handler);
    };

    Model.prototype.create = function () {
        var _this = this;
        var query = this.sqlHelper.buildInsert(this.tableName, this.attributes);
        this.callBeforeHandlers(Model.CREATE);
        this.connector.query(query, function (err, rows, fields) {
            _this.callAfterHandlers(Model.CREATE);
        });
    };

    Model.prototype.update = function (options) {
        var _this = this;
        var whereOptions;

        if ("undefined" === typeof options) {
            whereOptions[this.idAttr] = this.attributes[this.idAttr];
        } else {
            whereOptions = this.updateOptionsToObject(options);
        }

        var query = this.sqlHelper.buildUpdate(this.tableName, this.attributes, whereOptions);

        this.callBeforeHandlers(Model.UPDATE);
        this.connector.query(query, function (err, rows, fields) {
            _this.callAfterHandlers(Model.UPDATE);
        });
    };

    Model.prototype.remove = function (options) {
        var _this = this;
        var whereOptions;

        if ("undefined" === typeof options) {
            whereOptions[this.idAttr] = this.attributes[this.idAttr];
        } else {
            whereOptions = this.updateOptionsToObject(options);
        }

        var query = this.sqlHelper.buildDelete(this.tableName, whereOptions);

        this.callBeforeHandlers(Model.REMOVE);
        this.connector.query(query, function (err, rows, fields) {
            _this.callAfterHandlers(Model.REMOVE);
        });
    };
    Model.CREATE = 'create';
    Model.UPDATE = 'update';
    Model.REMOVE = 'remove';
    return Model;
})();
//# sourceMappingURL=Model.js.map
