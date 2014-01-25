/**
 * Created by agnynk on 26.01.14.
 */

class SQLHelper {
    private separator: string = ", ";

    private buildWhere(data: {string: any}) : string {
        var whereQuery = "";

        for(var name in data) {

            if(data.hasOwnProperty(name)) {
                whereQuery += name + "= '" + data[name] + "'";
            }
        }

        return whereQuery;
    }

    private buildAttrs(data: {string: any}, keys?: boolean) : string {
        var query = "";

        if("undefined" === typeof keys) {
            keys = true;
        }

        if(keys) {
            for(var name in data) {

                if(data.hasOwnProperty(name)) {
                    query += "`" + name + "`"
                        + this.separator;
                }
            }
        } else {
            for(var name in data) {

                if(data.hasOwnProperty(name)) {
                    query += "'" + data[name] + "'"
                        + this.separator;
                }
            }
        }

        if(query.length > 0) {
            query = query.substr(query.length - this.separator.length);
        }

        return query;
    }

    public buildSelect(tableName: string, whereData?: {string: any}) {
        var query = "SELECT * FROM `" + tableName + "`";

        if("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    }

    public buildUpdate(tableName: string, valuesData: {string: any}, whereData?: {string: any}) {
        var query = "UPDATE `" + tableName + "`"
            + " SET ";

        for(var name in valuesData) {

            if(valuesData.hasOwnProperty(name)) {
                query += "`" + name + "` = '" + valuesData[name] + "'"
                    + this.separator;
            }
        }

        query = query.substr(query.length - this.separator.length);

        if("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    }

    public buildInsert(tableName: string, valuesData: {string: any}) {
        var query = "INSERT INTO `" + tableName + "`";

        query += this.buildAttrs(valuesData, true);
        query += " VALUES ";
        query += " (";
        query += this.buildAttrs(valuesData, false);
        query += ")";

        return query;
    }

    public buildDelete(tableName: string, whereData?: {string: any}) {
        var query = "DELECT FROM `" + tableName + "`";

        if("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    }
}