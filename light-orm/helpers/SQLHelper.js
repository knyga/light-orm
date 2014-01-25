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
            query = query.substr(query.length - this.separator.length);
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

        query = query.substr(query.length - this.separator.length);

        if ("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    };

    SQLHelper.prototype.buildInsert = function (tableName, valuesData) {
        var query = "INSERT INTO `" + tableName + "`";

        query += this.buildAttrs(valuesData, true);
        query += " VALUES ";
        query += " (";
        query += this.buildAttrs(valuesData, false);
        query += ")";

        return query;
    };

    SQLHelper.prototype.buildDelete = function (tableName, whereData) {
        var query = "DELECT FROM `" + tableName + "`";

        if ("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    };
    return SQLHelper;
})();
//# sourceMappingURL=SQLHelper.js.map
