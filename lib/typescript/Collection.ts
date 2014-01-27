/**
 * Provides model creation and search methods
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
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
        private modelExtension: any;

        /**
         * Constructor
         * @param {object} connector Connection object to DB with method query(query: string, handler: (err, rows, fields) => void)
         * @param {object} extensions New properties for current entity
         * @param tableName
         */
        constructor(connector: DriverInterface, tableName?: string, extensions?: any)
        constructor(options: any)
        constructor(options: any, tableName?: string, extensions?: any) {

            if(options.hasOwnProperty('connector')) {

                for(var name in options) {
                    this[name] = options[name];
                }
            } else {
                this.connector = options;
                this.tableName = tableName;

                if("undefined" !== typeof extensions) {

                    for(var name in extensions) {
                        this[name] = extensions[name];
                    }
                }
            }

            this.sqlHelper = SQLHelper.getEntity();
        }

        /**
         * Create model
         * @param data Attributes, that will be setted during construction
         */
        createModel(data: {});

        /**
         * Create model
         * @param {boolean} add True, if created model should be added to models list
         */
        createModel(add: boolean);

        /**
         * Create model
         * @param data Attributes, that will be setted during construction
         * @param {boolean} add True, if created model should be added to models list
         */
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

            model = new Model(this.connector, this.tableName, data, this.modelExtension);

            if(add) {
                this.models.push(model);
            }

            return model;
        }

        /**
         * Get all models from saved models list
         * @returns {Model[]}
         */
        getModels() {
            return this.models;
        }

        /**
         * Get model at position from saved models list
         * Throws error if none
         * @param {number} at Position
         * @returns {Model}
         */
        getModel(at: number): Model {

            if(this.models.length <= at) {
                throw new Error("No model at " + at);
            }

            return this.models[at];
        }

        /**
         * Search models by query
         * @param search Query to search
         * @param callback
         */
        find(search: string, callback?: (err: string, models?: Model[]) => void);

        /**
         * Search models by object
         * @param search Query to search
         * @param callback
         */
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
                        var model = new Model(this.connector, this.tableName, rows[i], this.modelExtension);
                        models.push(model);
                    }

                    callback(null, models);
                }
            });
        }

        /**
         * Get all models
         * @param callback
         */
        findAll(callback?: (err: string, model?: Model[]) => void) {
            this.find(undefined, callback);
        }

        /**
         * Search one model by query
         * @param search Query to search
         * @param callback
         */
        findOne(search: string, callback?: (err: string, model?: Model) => void);

        /**
         * Search one model by object
         * @param search Query to search
         * @param callback
         */
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

        /**
         * Create string from object
         * @returns {string}
         */
        toString(): string {
            return "[LightOrm Collection <" + this.tableName + ">]";
        }

        /**
         * Create array of attributes of saved models
         * @returns {array}
         */
        toJSON(): any {
            var data = [];
            for(var i = 0, length = this.models.length; i < length; i++) {
                data.push(this.models[i].toJSON());
            }

            return data;
        }
    }
}