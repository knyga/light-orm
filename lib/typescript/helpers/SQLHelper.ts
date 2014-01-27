/**
 * Wrapper on basic search operations
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

class SQLHelper{
    private separator: string = ", ";
    private static entity: SQLHelper;
    private constructor() {}

    public static getEntity() {

        if("undefined" === typeof SQLHelper.entity) {
            SQLHelper.entity = new SQLHelper();
        }

        return SQLHelper.entity;
    }

    private buildWhere(data: {}) : string {
        var whereQuery = "";

        for(var name in data) {

            if(data.hasOwnProperty(name)) {
                whereQuery += name + "= '" + data[name] + "'";
            }
        }

        return whereQuery;
    }

    private buildAttrs(data: {}, keys?: boolean) : string {
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
            query = query.substring(0, query.length - this.separator.length);
        }

        return query;
    }

    /**
     * Create SELECT SQL query
     * @param {string} tableName
     * @param {object} whereData Conditions for WHERE block in query
     * @returns {string} Query
     */
    public buildSelect(tableName: string, whereData?: {}) {
        var query = "SELECT * FROM `" + tableName + "`";

        if("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    }
    /**
     * Create UPDATE SQL query
     * @param {string} tableName
     * @param {string} valuesData Fieldnames and values that should be updated
     * @param {object} whereData Conditions for WHERE block in query
     * @returns {string} Query
     */
    public buildUpdate(tableName: string, valuesData: {}, whereData?: {}) {
        var query = "UPDATE `" + tableName + "`"
            + " SET ";

        for(var name in valuesData) {

            if(valuesData.hasOwnProperty(name)) {
                query += "`" + name + "` = '" + valuesData[name] + "'"
                    + this.separator;
            }
        }

        query = query.substring(0, query.length - this.separator.length);

        if("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    }

    /**
     * Create INSERT SQL query
     * @param {string} tableName
     * @param {string} valuesData Fieldnames and values that should be inserted
     * @returns {string} Query
     */
    public buildInsert(tableName: string, valuesData: {}) {
        var query = "INSERT INTO `" + tableName + "` (";

        query += this.buildAttrs(valuesData, true);
        query += ") VALUES ";
        query += " (";
        query += this.buildAttrs(valuesData, false);
        query += ")";

        return query;
    }

    /**
     * Create DELETE SQL query
     * @param {string} tableName
     * @param {object} whereData Conditions for WHERE block in query
     * @returns {string} Query
     */
    public buildDelete(tableName: string, whereData?: {}) {
        var query = "DELETE FROM `" + tableName + "`";

        if("undefined" !== typeof whereData) {
            query += " WHERE ";
            query += this.buildWhere(whereData);
        }

        return query;
    }
}