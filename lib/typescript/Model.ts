/**
 * Provides basic model methods
 * @author Oleksandr Knyga <oleksandrknyga@gmail.com>
 * @license Apache License 2.0 - See file 'LICENSE.md' in this project.
 */

///<reference path="interfaces/CrudInterface.ts" />
///<reference path="interfaces/DriverInterface.ts" />
///<reference path="interfaces/GetSetInterface.ts" />
///<reference path="interfaces/ModelEventInterface.ts" />
///<reference path="interfaces/UpdateOptionsInterface.ts" />
///<reference path="interfaces/ToStringInterface.ts" />
///<reference path="interfaces/JSONInterface.ts" />
///<reference path="helpers/SQLHelper.ts" />

module Light {
    export class Model implements CrudInterface, GetSetInterface, ToStringInterface, JSONInterface {
//        public static CREATE = 'create';
//        public static UPDATE = 'update';
//        public static REMOVE = 'remove';

        private pkAttr: string = 'id';

        private connector: DriverInterface;
        private tableName: string;
        private attributes: {} = {};
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

//        private callBeforeHandlers(type: string) {
//            for(var i=0;i<this.beforeList.length;i++) {
//                this.beforeList[i](type);
//            }
//        }
//
//        private callAfterHandlers(type: string) {
//            for(var i=0;i<this.afterList.length;i++) {
//                this.afterList[i](type);
//            }
//        }
//        before(handler: (type: string) => void) {
//            this.beforeList.push(handler);
//        }
//
//        after(handler: (type: string) => void) {
//            this.afterList.push(handler);
//        }

        private updateOptionsToObject(options: UpdateOptionsInterface): {} {
            var obj: {} = {};

            if("undefined" !== typeof options.pk) {

                for(var i = 0; i < options.pk.length; i++) {

                    if(this.attributes.hasOwnProperty(options.pk[i])) {
                        obj[options.pk[i]] = this.attributes[options.pk[i]];
                    }
                }
            } else {
                obj = options.pkValue;
            }

            return obj;
        }

        /**
         * Get All attributes
         * @returns {object}
         */
        getAll() {
            return this.attributes;
        }

        /**
         * Get attribute by name
         * Throws error if none
         * @param {string} name Name of attribute
         * @returns {any} Value of attribute
         */
        get(name: string) : any {

            if(!this.attributes.hasOwnProperty(name)) {
                throw new Error("No attribute with name " + name);
            }

            return this.attributes[name];
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
                this.attributes[arg1] = arg2;
            }

            if("object" === typeof arg1) {

                for(var name in arg1) {

                    if(arg1.hasOwnProperty(name)) {
                        this.attributes[name] = arg1[name];
                    }
                }
            }
        }

        /**
         * Create model
         * @param {function} callback
         */
        create(callback?: (err?, rows?, fields?) => void) {
            var query = this.sqlHelper.buildInsert(this.tableName, this.attributes);
            this.connector.query(query, (err, rows, fields) => {
                if("function" === typeof callback) {
                    callback(err, rows, fields);
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
         * @param {UpdateOptionsInterface} options Object to select data {pk: [], pkValue: {}}
         * @param {function} callback
         */
        update(options: {}, callback?: (err?, model?) => void)

        update(input?: any, callback?: (err?, model?) => void) {
            var whereOptions: {} = {},
                options: UpdateOptionsInterface;

            if("function" === typeof input) {
                callback = input;
            } else {
                options = input;
            }

            if("undefined" === typeof options) {
                whereOptions[this.pkAttr] = this.attributes[this.pkAttr];
            } else {
                whereOptions = this.updateOptionsToObject(options);
            }

            var query = this.sqlHelper.buildUpdate(this.tableName, this.attributes, whereOptions);

            this.connector.query(query, (err, rows, fields) => {
                if("function" === typeof callback) {

                    if(/\([^,]+, [^,]+/.test(callback.toString())) {
                        query = this.sqlHelper.buildSelect(this.tableName, whereOptions);
                        this.connector.query(query, (err, rows, fields) => {

                            if("undefined" !== typeof rows && rows.length > 0) {
                                var model = new Model(this.connector, this.tableName, rows[0]);

                                if("function" === typeof callback) {
                                    callback(err, model);
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
         * @param callback
         */
        remove(options: {}, callback?: (err?, model?) => void);

        remove(input?: any, callback?: (err?, model?) => void) {
            var whereOptions: {} = {},
                options: UpdateOptionsInterface;

            if("function" === typeof input) {
                callback = input;
            } else {
                options = input;
            }

            if("undefined" === typeof options) {
                whereOptions[this.pkAttr] = this.attributes[this.pkAttr];
            } else {
                whereOptions = this.updateOptionsToObject(options);
            }

            var query = this.sqlHelper.buildDelete(this.tableName, whereOptions);

            this.connector.query(query, (err, rows, fields) => {
                if("function" === typeof callback) {

                    if(/\([^,]+, [^,]+/.test(callback.toString())) {
                        query = this.sqlHelper.buildSelect(this.tableName, whereOptions);
                        this.connector.query(query, (err, rows, fields) => {

                            if("undefined" !== typeof rows && rows.length > 0) {
                                var model = new Model(this.connector, this.tableName, rows[0]);

                                if("function" === typeof callback) {
                                    callback(err, model);
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
            return this.attributes;
        }

    }
}