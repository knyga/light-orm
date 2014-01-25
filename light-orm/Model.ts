/**
 * Created by agnynk on 26.01.14.
 */

///<reference path="interfaces/CrudInterface.ts" />
///<reference path="interfaces/DriverInterface.ts" />
///<reference path="interfaces/GetSetInterface.ts" />
///<reference path="interfaces/ModelEventInterface.ts" />
///<reference path="interfaces/UpdateOptionsInterface.ts" />
///<reference path="helpers/SQLHelper.ts" />

class Model implements CrudInterface, GetSetInterface, ModelEventInterface {
    public static CREATE = 'create';
    public static UPDATE = 'update';
    public static REMOVE = 'remove';

    private idAttr: string = 'id';

    private connector: DriverInterface;
    private tableName: string;
    private attributes: {string: any};
    private beforeList: Array<(type: string) => void>;
    private afterList: Array<(type: string) => void>;
    private sqlHelper: SQLHelper;

    constructor(connector: DriverInterface, tableName: string) {
        this.connector = connector;
        this.tableName = tableName;
        this.sqlHelper = new SQLHelper();
    }

    private callBeforeHandlers(type: string) {
        for(var i=0;i<this.beforeList.length;i++) {
            this.beforeList[i](type);
        }
    }

    private callAfterHandlers(type: string) {
        for(var i=0;i<this.afterList.length;i++) {
            this.afterList[i](type);
        }
    }

    private updateOptionsToObject(options: UpdateOptionsInterface): {string: any} {
        var obj: {string: any};

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

    get(name: string) : any {

        if(this.attributes.hasOwnProperty(name)) {
            return this.attributes[name];
        } else {
            return null;
        }
    }

    set(options: {string: any})
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

    before(handler: (type: string) => void) {
        this.beforeList.push(handler);
    }

    after(handler: (type: string) => void) {
        this.afterList.push(handler);
    }

    create() {
        var query = this.sqlHelper.buildInsert(this.tableName, this.attributes);
        this.callBeforeHandlers(Model.CREATE);
        this.connector.query(query, (err, rows, fields) => {
            this.callAfterHandlers(Model.CREATE);
        });
    }

    update(options?: UpdateOptionsInterface) {
        var whereOptions: {string: any};

        if("undefined" === typeof options) {
            whereOptions[this.idAttr] = this.attributes[this.idAttr];
        } else {
            whereOptions = this.updateOptionsToObject(options);
        }

        var query = this.sqlHelper.buildUpdate(this.tableName, this.attributes, whereOptions);

        this.callBeforeHandlers(Model.UPDATE);
        this.connector.query(query, (err, rows, fields) => {
            this.callAfterHandlers(Model.UPDATE);
        });
    }

    remove(options?: UpdateOptionsInterface) {
        var whereOptions: {string: any};

        if("undefined" === typeof options) {
            whereOptions[this.idAttr] = this.attributes[this.idAttr];
        } else {
            whereOptions = this.updateOptionsToObject(options);
        }

        var query = this.sqlHelper.buildDelete(this.tableName, whereOptions);

        this.callBeforeHandlers(Model.REMOVE);
        this.connector.query(query, (err, rows, fields) => {
            this.callAfterHandlers(Model.REMOVE);
        });
    }

}