/**
* Created by agnynk on 26.01.14.
*/
///<reference path="Model.ts" />
///<reference path="helpers/SQLHelper.ts" />
///<reference path="interfaces/DriverInterface.ts" />
var Collection = (function () {
    function Collection(connector, tableName) {
        this.connector = connector;
        this.tableName = tableName;
        this.sqlHelper = new SQLHelper();
    }
    Collection.prototype.find = function (search, callback) {
        var _this = this;
        var query = this.sqlHelper.buildSelect(this.tableName, search);
        this.connector.query(query, function (err, rows, fields) {
            if (err) {
                callback(err);
            } else {
                var models;

                for (var i = 0; i < rows.length; i++) {
                    var model = new Model(_this.connector, _this.tableName);
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

            callback(lerr, model);
        });
    };
    return Collection;
})();
//# sourceMappingURL=Collection.js.map
