/**
 * Provides basic model methods
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

///<reference path="interfaces/CrudInterface.ts" />
///<reference path="interfaces/DriverInterface.ts" />
///<reference path="interfaces/GetSetInterface.ts" />
///<reference path="interfaces/ModelEventInterface.ts" />
///<reference path="interfaces/ToStringInterface.ts" />
///<reference path="interfaces/ToJSONInterface.ts" />

///<reference path="helpers/Sql/SQLHelper.ts" />
///<reference path="helpers/Where.ts" />
///<reference path="helpers/Clone.ts" />
///<reference path="helpers/Filter.ts" />
///<reference path="helpers/ObjectWrapper.ts" />

module Light {
    export class Model implements CrudInterface, GetSetInterface, ToStringInterface, JSONInterface {
//        public static CREATE = 'create';
//        public static UPDATE = 'update';
//        public static REMOVE = 'remove';

        private pkAttr: string = 'id';

        private connector: DriverInterface;
        private tableName: string;
        private data: {} = {};
        private dataNew: {} = {};
//        private beforeList: { (type: string): void; } [] = [];
//        private afterList: { (type: string): void; } [] = [];
        private sqlHelper: SQLHelper;

        /**
         * Constructor
         * @param {object} connector Connection object to DB with method query(query: string, handler: (err, rows, fields) => void)
         * @param {object} attributes Attributes, that will be setted during construction
         * @param {object} extensions New properties for current entity
         * @param tableName
         */
        constructor(connector: DriverInterface, tableName: string, attributes?: {}, extensions?: any)
        constructor(options: any, tableName: string, attributes?: {}, extensions?: any) {

            if("undefined" !== typeof options && options.hasOwnProperty('connector')) {

                for(var name in options) {
                    this[name] = options[name];
                }
            } else {
                this.connector = options;
                this.tableName = tableName;

                if("undefined" !== typeof attributes) {
                    this.set(attributes);
                }

                if("undefined" !== typeof extensions) {

                    for(var name in extensions) {
                        this[name] = extensions[name];
                    }
                }
            }

            this.sqlHelper = SQLHelper.getEntity();
        }

        /**
         * Get All attributes, combines dataNew and data
         * @returns {object}
         */
        getAll(): {} {
            var localData:{} = new Clone(this.data);

            for(var name in this.data) {

                if(this.data.hasOwnProperty(name) &&
                    (!localData.hasOwnProperty(name) ||
                        localData[name] != this.data[name])
                    ) {
                    localData[name] = this.data[name]
                }
            }

            return localData;
        }

        /**
         * Get attribute by name
         * @param {string} name Name of attribute
         * @returns {any} Value of attribute
         */
        get(name: string) : any {

            if(this.dataNew.hasOwnProperty(name)) {
                return this.dataNew[name];
            }

            if(this.data.hasOwnProperty(name)) {
                return this.data[name];
            }

            return null;
        }

        /**
         * Check presence of attribute
         * @param name
         * @returns {boolean}
         */
        has(name: string): boolean {

            if(this.dataNew.hasOwnProperty(name)) {
                return true;
            }

            if(this.data.hasOwnProperty(name)) {
                return true;
            }

            return false;
        }

        /**
         * Set attributes
         * @param {object} options New attributes {name: value}
         */
        set(options: {})

        /**
         * Set attribute
         * @param {string} name Name of attribute
         * @param {any} value Value of attribute
         */
        set(name: string, value: any)

        set(arg1: any, arg2?: any) {

            if("string" === typeof arg1 && "undefined" !== typeof arg2) {
                this.dataNew[arg1] = arg2;
            }

            if("object" === typeof arg1) {

                for(var name in arg1) {

                    if(arg1.hasOwnProperty(name)) {
                        this.dataNew[name] = arg1[name];
                    }
                }
            }
        }

        clear(name?: string) {
            if("undefined" === typeof name) {
                this.dataNew = {};
                this.data = {};
            } else {

                if(this.dataNew.hasOwnProperty(name)) {
                    delete this.dataNew[name];
                }

                if(this.data.hasOwnProperty(name)) {
                    delete this.data[name];
                }
            }
        }

        /**
         * Create model
         * @param {function} callback
         * @param {boolean} isGetModel True, if sub request is needed
         */
        create(callback?: (err?, model?) => void, isGetModel?:boolean) {
            var that = this,
                query = this.sqlHelper.buildInsert(this.tableName, this.getAll());

            if("undefined" === typeof isGetModel) {
                isGetModel = true;
            }

            this.connector.query(query, (err, rows, fields) => {

                if(isGetModel) {
                    var whereOptions = this.getAll();
                    query = this.sqlHelper.buildSelect(this.tableName, whereOptions);
                    this.connector.query(query, (err, rows, fields) => {

                        if("undefined" !== typeof rows && rows.length > 0) {
                            var model = new Model(this.connector, this.tableName, rows[0]);
                            that.set(model.getAll());

                            if("function" === typeof callback) {
                                callback(err, that);
                            }
                        } else {

                            if("function" === typeof callback) {
                                callback(err);
                            }
                        }
                    });
                } else {

                    if("function" === typeof callback) {
                        callback(err);
                    }
                }
            });
//            this.callBeforeHandlers(Model.CREATE);
//            this.connector.query(query, (err, rows, fields) => {
//                this.callAfterHandlers(Model.CREATE);
//            });
        }

        /**
         * Update model
         * @param {function} callback
         */
        update(callback?: (err?, model?) => void)

        /**
         * Update model
         * @param {function} callback
         * @param {boolean} isGetModel True, if sub request is needed
         */
        update(callback?: (err?, model?) => void, isGetModel?:boolean)

        /**
         * Update model
         * @param {UpdateOptionsInterface} options Object to select data {pk: [], pkValue: {}}
         * @param {function} callback
         * @param {boolean} isGetModel True, if sub request is needed
         */
        update(options: {}, callback?: (err?, model?) => void, isGetModel?:boolean)

        update(input?: any, callback?: any, isGetModel?:boolean) {
            var that = this,
                whereOptions: {} = {},
                options: Where;

            if("function" === typeof input) {
                callback = input;
            } else {
                options = input;
            }

            if("undefined" === typeof options) {
                whereOptions[this.pkAttr] = this.get(this.pkAttr);
            } else {
                whereOptions = new Where(options).getBlock(this.getAll());
            }

            var updateData = new Filter(this.dataNew).difference(this.data);

            if(new ObjectWrapper(updateData).size() < 1) {

                if("function" === typeof callback) {
                    callback("Nothing to update");
                }

                return;
            }

            var query = this.sqlHelper.buildUpdate(this.tableName,
                new Filter(this.dataNew).difference(this.data),
                whereOptions);

            if("undefined" === typeof isGetModel) {

                if("boolean" === typeof callback) {
                    isGetModel = callback;
                } else {
                    isGetModel = true;
                }
            }

            this.connector.query(query, (err, rows, fields) => {

                if(isGetModel) {
                    var whereOptions = this.getAll();
                    query = this.sqlHelper.buildSelect(this.tableName, whereOptions);
                    this.connector.query(query, (err, rows, fields) => {

                        if("undefined" !== typeof rows && rows.length > 0) {
                            var model = new Model(this.connector, this.tableName, rows[0]);
                            that.set(model.getAll());

                            if("function" === typeof callback) {
                                callback(err, that);
                            }
                        } else {

                            if("function" === typeof callback) {
                                callback(err);
                            }
                        }
                    });
                } else {

                    if("function" === typeof callback) {
                        callback(err);
                    }
                }
            });

//            this.callBeforeHandlers(Model.UPDATE);
//            this.connector.query(query, (err, rows, fields) => {
//                this.callAfterHandlers(Model.UPDATE);
//            });
        }

        /**
         * Remove model
         * @param {function} callback
         */
        remove(callback?: (err?, model?) => void);

        /**
         * Remove model
         * @param {UpdateOptionsInterface} options Object to select data {pk: [], pkValue: {}}
         * @param {boolean} isGetModel True, if sub request is needed
         * @param callback
         */
        remove(options: {}, callback?: (err?, model?) => void, isGetModel?:boolean);

        /**
         * Remove model
         * @param {function} callback
         * @param {boolean} isGetModel True, if sub request is needed
         */
        remove(callback?: (err?, model?) => void, isGetModel?:boolean)

        remove(input?: any, callback?: any, isGetModel?:boolean) {
            var that = this,
                whereOptions: {} = {},
                options: Where;

            if("function" === typeof input) {
                callback = input;
            } else {
                options = input;
            }

            if("undefined" === typeof options) {
                whereOptions[this.pkAttr] = this.get(this.pkAttr);
            } else {
                whereOptions = new Where(options).getBlock(this.getAll());
            }

            var query = this.sqlHelper.buildDelete(this.tableName, whereOptions);

            if("undefined" === typeof isGetModel) {

                if("boolean" === typeof callback) {
                    isGetModel = callback;
                } else {
                    isGetModel = true;
                }
            }

            this.connector.query(query, (err, rows, fields) => {

                if(isGetModel) {
                    var whereOptions = this.getAll();
                    query = this.sqlHelper.buildSelect(this.tableName, whereOptions);
                    this.connector.query(query, (err, rows, fields) => {

                        if("undefined" !== typeof rows && rows.length > 0) {
                            var model = new Model(this.connector, this.tableName, rows[0]);
                            that.set(model.getAll());

                            if("function" === typeof callback) {
                                callback(err, that);
                            }
                        } else {

                            if("function" === typeof callback) {
                                callback(err);
                            }
                        }
                    });
                } else {

                    if("function" === typeof callback) {
                        callback(err);
                    }
                }
            });

//            this.callBeforeHandlers(Model.REMOVE);
//            this.connector.query(query, (err, rows, fields) => {
//                this.callAfterHandlers(Model.REMOVE);
//            });
        }

        /**
         * Create string from object
         * @returns {string}
         */
        toString(): string {
            return "[LightOrm Model <"
                + this.tableName
                + ", "
                + (this.get(this.pkAttr) ? this.get(this.pkAttr) : "undefined")
                + ">]";
        }

        /**
         * Get attributes of model
         * @returns {object}
         */
        toJSON(): any {
            return this.getAll();
        }

    }
}