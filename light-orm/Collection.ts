/**
 * Created by agnynk on 26.01.14.
 */

///<reference path="Model.ts" />
///<reference path="helpers/SQLHelper.ts" />
///<reference path="interfaces/DriverInterface.ts" />

class Collection {
    private tableName: string;
    private connector: DriverInterface;
    private sqlHelper: SQLHelper;

    constructor(connector: DriverInterface, tableName: string) {
        this.connector = connector;
        this.tableName = tableName;
        this.sqlHelper = new SQLHelper();
    }

    find(search: {string: any}, callback: (err: string, models?: Array<Model>) => void) {
        var query = this.sqlHelper.buildSelect(this.tableName, search);
        this.connector.query(query, (err, rows, fields) => {

            if(err) {
                callback(err);
            } else {
                var models: Array<Model>;

                for(var i = 0; i<rows.length; i++) {
                    var model = new Model(this.connector, this.tableName);
                    model.set(rows[i]);
                    models.push(model);
                }

                callback(null, models);
            }
        });
    }

    findOne(search: {string: any}, callback: (err: string, model?: Model) => void) {
        this.find(search, (lerr, lmodels?) => {
            var model: Model;

            if(lmodels.length > 0) {
                model = lmodels[0];
            }

            callback(lerr, model);
        });
    }
}