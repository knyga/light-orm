/**
 * Created by agnynk on 26.01.14.
 */

///<reference path="Model.ts" />
///<reference path="helpers/SQLHelper.ts" />
///<reference path="interfaces/DriverInterface.ts" />
///<reference path="interfaces/ToStringInterface.ts" />
///<reference path="interfaces/JSONInterface.ts" />

module Light {
    export class Collection implements ToStringInterface, JSONInterface {
        private tableName: string;
        private connector: DriverInterface;
        private sqlHelper: SQLHelper;
        private models: Model[] = [];

        constructor(connector: DriverInterface, tableName?: string) {
            this.connector = connector;
            this.tableName = tableName;
            this.sqlHelper = new SQLHelper();
        }

        createModel(data: {});
        createModel(add: boolean);
        createModel(data: {}, add: boolean);
        createModel(options?: any, add?: boolean) : Model {
            var model, data;

            if("boolean" === typeof options) {
                add = options;
            } else {
                data = options;
            }

            if("undefined" === typeof add) {
                add = true;
            }

            model = new Model(this.connector, this.tableName, data);

            if(add) {
                this.models.push(model);
            }

            return model;
        }

        getModels() {
            return this.models;
        }

        getModel(at: number): Model {

            if(this.models.length <= at) {
                throw new Error("No model at " + at);
            }

            return this.models[at];
        }

        find(search: string, callback?: (err: string, models?: Model[]) => void);
        find(search: {}, callback?: (err: string, models?: Model[]) => void);
        find(search: any, callback?: (err: string, models?: Model[]) => void) {
            var query = "";

            if("string" === typeof search) {
                query = search;
            } else {
                query = this.sqlHelper.buildSelect(this.tableName, search);
            }

            this.connector.query(query, (err, rows, fields) => {

                if(err) {
                    callback(err);
                } else {
                    var models: Model[] = [];

                    for(var i = 0; i<rows.length; i++) {
                        var model = new Model(this.connector, this.tableName);
                        model.set(rows[i]);
                        models.push(model);
                    }

                    callback(null, models);
                }
            });
        }

        findOne(search: string, callback?: (err: string, model?: Model) => void);
        findOne(search: {}, callback?: (err: string, model?: Model) => void);
        findOne(search: any, callback?: (err: string, model?: Model) => void) {
            this.find(search, (lerr, lmodels?) => {
                var model: Model;

                if(lmodels.length > 0) {
                    model = lmodels[0];
                }

                if("undefined" !== typeof callback) {
                    callback(lerr, model);
                }
            });
        }

        toString(): string {
            return "[LightOrm Collection <" + this.tableName + ">]";
        }

        toJSON(): any {
            var data = [];
            for(var i = 0, length = this.models.length; i < length; i++) {
                data.push(this.models[i].toJSON());
            }

            return data;
        }
    }
}