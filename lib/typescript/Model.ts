/**
 * Created by agnynk on 26.01.14.
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

        constructor(connector: DriverInterface, tableName?: string, attributes?: {}) {
            this.connector = connector;
            this.tableName = tableName;
            this.sqlHelper = new SQLHelper();

            if("undefined" !== typeof attributes) {
                this.set(attributes);
            }
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

        getAll() {
            return this.attributes;
        }

        get(name: string) : any {

            if(this.attributes.hasOwnProperty(name)) {
                return this.attributes[name];
            } else {
                return null;
            }
        }

        set(options: {})
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

        update(callback?: (err?, model?) => void);
        update(options: {}, callback?: (err?, model?) => void);
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
                                callback(err, model);
                            } else {
                                callback(err);
                            }
                        });
                    } else {
                        callback(err);
                    }
                }
            });

//            this.callBeforeHandlers(Model.UPDATE);
//            this.connector.query(query, (err, rows, fields) => {
//                this.callAfterHandlers(Model.UPDATE);
//            });
        }
        remove(callback?: (err?, model?) => void);
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
                                callback(err, model);
                            } else {
                                callback(err);
                            }
                        });
                    } else {
                        callback(err);
                    }
                }
            });

//            this.callBeforeHandlers(Model.REMOVE);
//            this.connector.query(query, (err, rows, fields) => {
//                this.callAfterHandlers(Model.REMOVE);
//            });
        }

        toString(): string {
            return "[LightOrm Model <"
                + this.tableName
                + ", "
                + (this.get(this.pkAttr) ? this.get(this.pkAttr) : "undefined")
                + ">]";
        }

        toJSON(): any {
            return this.attributes;
        }

    }
}