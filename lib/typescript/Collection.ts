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

module Light {
    export class Collection implements ToStringInterface, JSONInterface {
        private tableName: string;
        private sqlHelper: SQLHelper;
        private models: Model[] = [];
        private modelExtension: any;
        private isAddModel = true;

        /**
         * Constructor
         * @param {object} extensions New properties for current entity
         * @param tableName
         */
        constructor(tableName: string, extensions?: any)
        constructor(options: any)
        constructor(models: Model[])
        constructor(options: any, extensions?: any) {

            if("string" === typeof options) {
                this.tableName = options;

                if("undefined" !== typeof extensions) {

                    for(var name in extensions) {
                        this[name] = extensions[name];
                    }
                }
            }

            if("object" === typeof options) {

                if(Object.prototype.toString.call(options) === '[object Array]') {

                    if(options.length > 0 && options[0] instanceof Model) {
                        this.models = options;
                    } else {

                        for(var i = 0; i < options.length; i++) {
                            this.createModel(options[i]);
                        }
                    }
                } else {
                    for(var name in options) {
                        this[name] = options[name];
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
                add = this.isAddModel;
            }

            model = new Model(this.tableName, data, this.modelExtension);

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
         * @param {number} at Position
         * @returns {Model}
         */
        getModel(at: number): Model {

            if(this.models.length <= at) {
                //throw new Error("No model at " + at);
                return null;
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

            Light.driver.query(query, (err, rows, fields) => {

                if(err) {

                    if("function" === typeof callback) {
                        callback(err);
                    }
                } else {
                    var models: Model[] = [];

                    for(var i = 0; i<rows.length; i++) {
                        var model = new Model(this.tableName, rows[i], this.modelExtension);
                        models.push(model);
                    }

                    if("function" === typeof callback) {
                        callback(null, models);
                    }
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

                if("function" === typeof callback) {
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