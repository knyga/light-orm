/**
 * Created by agnynk on 26.01.14.
 */

///<reference path="interfaces/DriverInterface.ts" />
///<reference path="Model.ts" />
///<reference path="Collection.ts" />

class Connector {
    private connector: DriverInterface;

    getModel(tableName: string) : Model {
        return new Model(this.connector, tableName);
    }

    getCollection(tableName: string): Collection {
        return new Collection(this.connector, tableName);
    }


}